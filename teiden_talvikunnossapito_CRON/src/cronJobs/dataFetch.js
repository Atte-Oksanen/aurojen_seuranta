const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')
const simplify = require('simplify-js')

const parseData = (data, verbose, noProj) => {
  const parseTime = Date.now()
  const xmlData = data
  const json = new XMLParser().parse(xmlData)
  const strippedData = []
  const testLimit = json['wfs:FeatureCollection']['gml:featureMember'].length
  let removedDataPoints = 0

  /**
   * Parsing data from wfs provided xml to JSON
   */
  for (let i = 0; i < testLimit; i++) {
    const element = json['wfs:FeatureCollection']['gml:featureMember'][i]
    const workType = element['GIS:AuratKartalla']['GIS:tyolajit'].split(', ').map(element => element.replace(/,/g, ''))
    if (!workType.includes('auraus')) {
      removedDataPoints++
      continue
    }
    const coords = element['GIS:AuratKartalla']['GIS:Geometry']['gml:LineString']['gml:coordinates'].split(' ')
    if (coords.length < 4) {
      removedDataPoints++
      continue
    }
    const coordsAsNumbers = coords.map(element => element.split(',').map(element => Number(element)))
    strippedData.push({
      id: i,
      workType: element['GIS:AuratKartalla']['GIS:tyolajit'].split(', ').map(element => element.replace(/,/g, '')),
      time: new Date(element['GIS:AuratKartalla']['GIS:time']).getTime(),
      coordinates: coords[0] === coords[coords.length - 1] ? coordsAsNumbers.slice(0, coords.length - 1) : coordsAsNumbers,
      roadName: element['GIS:AuratKartalla']['GIS:Kadunnimi']
    })
  }
  const originalDataPoints = strippedData.reduce((prev, curr) => prev + curr.coordinates.length, 0)
  if (verbose) {
    console.log('---------------------------------')
    console.log('Data parsed and cleaned in', (Date.now() - parseTime) / 1000, 'seconds')
    console.log('Number of routes', strippedData.length)
    console.log('Number of coordinate tuples in data', originalDataPoints)
    console.log('Number of datapoints removed', removedDataPoints, Math.round((removedDataPoints / strippedData.length) * 100), '%')
    console.log('---------------------------------')
  }

  /**
   * Building a hash table using road names as index
  */
  const dataCleanTime = Date.now()
  let maxChain = 0
  const strippedHashArray = new Map()
  strippedData.forEach(element => {
    const localIndex = element.roadName
    if (!strippedHashArray.has(localIndex)) {
      strippedHashArray.set(localIndex, [element])
    } else {
      const tempArray = strippedHashArray.get(localIndex).concat([element])
      strippedHashArray.set(localIndex, tempArray)
      maxChain = Math.max(tempArray.length, maxChain)
    }
  })
  /**
   * Finding duplicate data based on coordinates and timestamps
   */
  const duplicateIndecies = new Set()
  let loops = 0
  for (let i = 0; i < strippedData.length; i++) {
    const subArray = strippedHashArray.get(strippedData[i].roadName).filter(element => element.time === strippedData[i].time && strippedData[i].id !== element.id)
    for (let y = 0; y < subArray.length; y++) {
      const smallerArray = strippedData[i].coordinates.length < subArray[y].coordinates.length ? strippedData[i] : subArray[y]
      const biggerArray = strippedData[i].coordinates.length > subArray[y].coordinates.length ? strippedData[i] : subArray[y]
      if (duplicateIndecies.has(smallerArray.id)) {
        continue
      }
      let hits = 0
      for (let x = 0; x < smallerArray.coordinates.length && hits < smallerArray.coordinates.length * 0.1; x++) {
        loops++
        if (biggerArray.coordinates.findIndex(element => element[0] === smallerArray.coordinates[x][0] && element[1] === smallerArray.coordinates[x][1]) !== -1) {
          hits++
        }
      }
      if (hits >= smallerArray.coordinates.length * 0.1) {
        duplicateIndecies.add(smallerArray.id)
      }
    }
  }
  /**
   * Removing found duplicates from data
  */
  const parsedData = []
  for (let i = 0; i < strippedData.length; i++) {
    if (duplicateIndecies.has(strippedData[i].id)) {
      continue
    }
    parsedData.push(strippedData[i])
  }


  if (verbose) {
    console.log('Duplicates found in data', duplicateIndecies.size, Math.round((duplicateIndecies.size / strippedData.length) * 100), '%')
    console.log('Data cleaned from duplicates in', (Date.now() - dataCleanTime) / 1000, 'seconds')
    console.log('loops to find duplicates', loops)
    console.log('---------------------------------')
  }

  /**
   * Build hash table again based on road names to find connectable routes
  */
  maxChain = 0
  const parsedHashArray = new Map()
  parsedData.forEach(element => {
    const localIndex = element.roadName
    if (!parsedHashArray.has(localIndex)) {
      parsedHashArray.set(localIndex, [element])
    } else {
      const tempArray = parsedHashArray.get(localIndex).concat([element])
      parsedHashArray.set(localIndex, tempArray)
      if (maxChain < tempArray.length) {
        maxChainValue = tempArray
      }
      maxChain = Math.max(tempArray.length, maxChain)

    }
  })
  /**
   * Find connectable routes
  */
  const similaritiesTime = Date.now()
  const foundSimilarities = new Map()

  for (let i = 0; i < parsedData.length; i++) {
    if (foundSimilarities.has(parsedData[i].id)) {
      continue
    }
    const subArray = parsedHashArray.get(parsedData[i].roadName)
      .filter(filterElement => parsedData[i].id !== filterElement.id
        && parsedData[i].time - filterElement.time === 60000
        && parsedData[i].coordinates[parsedData[i].coordinates.length - 1][0] === filterElement.coordinates[0][0]
        && parsedData[i].coordinates[parsedData[i].coordinates.length - 1][1] === filterElement.coordinates[0][1])
    if (subArray.length === 1) {
      foundSimilarities.set(parsedData[i].id, [parsedData[i].id, subArray[0].id])
    }
  }

  /**
   * Finds chains of connectable routes and marking routes for deletion
   * Removes all routes under 6 waypoints
   * Optimizes routes with Douglas-Peucker
   * Changes projection from epsg3879 to epsg4326 for Leaflet
  */
  const foundChains = []
  const elementstoDelete = new Set()
  maxChain = 0
  const parsedDataHash = new Map()
  parsedData.forEach(element => {
    parsedDataHash.set(element.id, element)
    const connectionChain = foundSimilarities.get(element.id) || [element.id]
    if (connectionChain.length > 1) {
      elementstoDelete.add(connectionChain[1])
      let nextElement = foundSimilarities.get(connectionChain[1])
      while (nextElement) {
        elementstoDelete.add(nextElement[1])
        connectionChain.push(nextElement[1])
        nextElement = foundSimilarities.get(connectionChain[connectionChain.length - 1])
      }
    }
    foundChains.push(connectionChain)
  })

  const cleanedChains = []
  foundChains.forEach(element => {
    if (elementstoDelete.has(element[0])) {
      return
    }
    const tempCoords = []
    element.map(idElement => tempCoords.push(...parsedDataHash.get(idElement).coordinates.splice(1).map(coordTuple => coordTuple.reverse())))
    if (tempCoords.length < 6) {
      return
    }
    const unique = [...new Set(tempCoords.map(element => element.toString()))].map(element => element.split(',').map(splitElement => Number(splitElement)))
    const optimizedCoords = simplify(unique.map(coordTuple => { return { x: coordTuple[0], y: coordTuple[1] } }), 5, true).map(coordTuple => [coordTuple.x, coordTuple.y])
    cleanedChains.push({
      ...parsedDataHash.get(element[0]),
      coordinates:
        noProj
          ? optimizedCoords
          : optimizedCoords.map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.reverse()))
    })
  })

  // const getEucDistance = (pointA, pointB) => {
  //   return Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2))
  // }
  // const cleanedChainsMap = new Map()
  // maxChain = 0
  // cleanedChains.forEach(element => {
  //   const localIndex = element.roadName
  //   if (!cleanedChainsMap.has(localIndex)) {
  //     cleanedChainsMap.set(localIndex, [element])
  //   } else {
  //     const tempArray = cleanedChainsMap.get(localIndex).concat([element])
  //     cleanedChainsMap.set(localIndex, tempArray)
  //     if (maxChain < tempArray.length) {
  //       maxChainValue = tempArray[0].roadName
  //     }
  //     maxChain = Math.max(tempArray.length, maxChain)

  //   }
  // })
  // console.log(maxChain, maxChainValue)
  // const overlappedElements = new Set()
  // cleanedChainsMap.forEach((testArray) => {
  //   testArray.sort((a, b) => a.time - b.time).forEach(((element) => {
  //     if (overlappedElements.has(element.id)) {
  //       return
  //     }
  //     for (let i = Math.floor(testArray.length / 2); i < testArray.length; i++) {
  //       if (element.id === testArray[i].id) {
  //         continue
  //       }
  //       const startDistance = getEucDistance(element.coordinates[0], testArray[i].coordinates[0])
  //       const crossDistance = getEucDistance(element.coordinates[0], testArray[i].coordinates[testArray[i].coordinates.length - 1])
  //       if (crossDistance > startDistance) {
  //         overlappedElements.add(testArray[i].id)
  //       }
  //     }
  //   }))
  // })
  // console.log(overlappedElements.size / cleanedChains.length)

  // const reducedChains = []
  // cleanedChains.forEach(element => {
  //   if (overlappedElements.has(element.id)) {
  //     return
  //   }
  //   reducedChains.push(element)
  // })
  // console.log(reducedChains.length)
  if (verbose) {
    const finalDataPoints = cleanedChains.reduce((prev, curr) => prev + curr.coordinates.length, 0)
    console.log('Split routes united, optimized and projected to lat-lon in', (Date.now() - similaritiesTime) / 1000, 'seconds')
    console.log('Connectable routes found', foundSimilarities.size)
    console.log('Elements to delete', elementstoDelete.size)
    console.log('Number of routes after optimization', cleanedChains.length)
    console.log('Routes optimized by', Math.round((1 - cleanedChains.length / strippedData.length) * 100), '%')
    console.log('Number of coordinate tuples in data after optimization', finalDataPoints)
    console.log('Data optimized by', Math.round((1 - finalDataPoints / originalDataPoints) * 100), '%')
    console.log('---------------------------------')
  }

  /**
   * Create a single GeoJSON layer
   */
  const geoJson = {
    timestamp: Date.now(),
    geoJson: {
      type: 'FeatureCollection',
      features:
        cleanedChains.sort((a, b) => a.time > b.time ? 1 : -1).map(element => {
          return {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: element.coordinates
            },
            properties: {
              time: element.time,
              roadName: element.roadName
            }
          }
        })
    }
  }
  return geoJson
}


/**
* Helper function for Douglas-Peucker optimizer
*/

const getSlope = line => {
  if (line[0][0] === line[1][0]) {
    line[0][0] = line[0][0] + 0.01
  }
  if (line[0][1] === line[1][1]) {
    line[0][1] = line[0][1] + 0.01
  }
  return (line[1][1] - line[0][1]) / (line[1][0] - line[0][0])
}

const getPerpendicularDistance = (point, line) => {
  const pointX = point[0]
  const pointY = point[1]
  const slope = getSlope(line)
  const intercept = line[0][1] - (slope * line[0][0])
  const result = Math.abs(slope * pointX - pointY + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
  return result;
}

const douglasPeuckerOptimiser = (route, epsilon) => {
  let maxDistance = 0
  let index = 0
  const end = route.length - 1
  for (let i = 1; i < end; i++) {
    const distance = getPerpendicularDistance(route[i], [route[0], route[end]])
    if (distance > maxDistance) {
      index = i
      maxDistance = distance
    }
  }
  const resultList = []
  if (maxDistance > epsilon) {
    const results1 = douglasPeuckerOptimiser(route.slice(0, index), epsilon)
    const results2 = douglasPeuckerOptimiser(route.slice(index, end), epsilon)
    resultList.push(...results1.concat(results2))
  } else {
    resultList.push(...route)
  }
  return resultList
}

module.exports = parseData
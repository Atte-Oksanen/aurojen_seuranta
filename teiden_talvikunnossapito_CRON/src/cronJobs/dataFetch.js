const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')

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
  if (verbose) {
    console.log('data transformed and stripped in', (Date.now() - parseTime) / 1000, 'seconds')
    console.log('number of datapoints', strippedData.length)
    console.log('number of datapoints removed', removedDataPoints, removedDataPoints / strippedData.length)
  }

  /**
   * Building a hash table using road names as index
  */
  const hashBuildTime = Date.now()
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
  if (verbose) {
    console.log('stripped hash array length', strippedHashArray.size)
    console.log('stripped hash table max chain', maxChain)
    console.log('stripped hash table built in ', (Date.now() - hashBuildTime) / 1000, 'seconds')
  }
  /**
   * Finding duplicate data based on coordinates and timestamps
   */
  const duplicateFoundTime = Date.now()
  const duplicateIndecies = new Set()
  for (let i = 0; i < strippedData.length; i++) {
    const subArray = strippedHashArray.get(strippedData[i].roadName)
    for (let y = 0; y < subArray.length; y++) {
      if (strippedData[i].time === subArray[y].time && strippedData[i].id !== subArray[y].id) {
        const smallerArray = strippedData[i].coordinates.length < subArray[y].coordinates.length ? strippedData[i] : subArray[y]
        const biggerArray = strippedData[i].coordinates.length > subArray[y].coordinates.length ? strippedData[i] : subArray[y]
        let hits = 0
        for (let x = 0; x < smallerArray.coordinates.length; x++) {
          if (biggerArray.coordinates.findIndex(element => element[0] === smallerArray.coordinates[x][0] && element[1] === smallerArray.coordinates[x][1]) !== -1) {
            hits++
          }
        }
        if (hits >= smallerArray.coordinates.length * 0.1) {
          duplicateIndecies.add(smallerArray.id)
        }
      }
    }
  }
  if (verbose) {
    console.log('amount of duplicates', duplicateIndecies.size, duplicateIndecies.size / (strippedData.length))
    console.log('duplicates found in', (Date.now() - duplicateFoundTime) / 1000, 'seconds')
  }
  /**
   * Removing found duplicated from data
   */
  const duplicateRemoveTime = Date.now()
  const parsedData = []
  for (let i = 0; i < strippedData.length; i++) { //Remove duplicates from data
    if (duplicateIndecies.has(strippedData[i].id)) {
      continue
    }
    parsedData.push(strippedData[i])
  }
  if (verbose) {
    console.log('Data cleaned in', (Date.now() - duplicateRemoveTime) / 1000, 'seconds')
  }
  const parsedHashArrayTime = Date.now()
  maxChain = 0
  let maxChainValue = []
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
  if (verbose) {
    console.log('parsed hash array length', parsedHashArray.size)
    console.log('parsed hash table max chain', maxChain)
    console.log('parsed hash table built in ', (Date.now() - parsedHashArrayTime) / 1000, 'seconds')
  }

  /**
   * Build hash table again based on road names to find connectable routes
   */
  const similaritiesTime = Date.now()
  const foundSimilarities = []
  for (let i = 0; i < parsedData.length; i++) {
    const subArray = parsedHashArray.get(parsedData[i].roadName)
    for (let y = 0; y < subArray.length; y++) {
      if (parsedData[i].id !== subArray[y].id
        && parsedData[i].time - subArray[y].time === 60000
        && parsedData[i].coordinates[0][0] === subArray[y].coordinates[subArray[y].coordinates.length - 1][0]
        && parsedData[i].coordinates[0][1] === subArray[y].coordinates[subArray[y].coordinates.length - 1][1]) {
        foundSimilarities.push([subArray[y].id, parsedData[i].id])
      }
    }
  }

  if (verbose) {
    console.log('Split routes found in', (Date.now() - similaritiesTime) / 1000, 'seconds')
    console.log('possible split routes found', foundSimilarities.length)
    const splitRoutes = new Set()
    foundSimilarities.map(element => splitRoutes.add(element))
    console.log('duplicates in similarity data', foundSimilarities.length - splitRoutes.size)
  }

  /**
   * Unite datapoints found in previous step and remove unnecessary ones
   */
  const splitUniteTime = Date.now()
  const unitedData = []
  let maxConnectChain = 0
  for (let i = 0; i < parsedData.length; i++) {
    maxConnectChain = 0
    let tempElement = parsedData[i]
    const lookUpElement = foundSimilarities.find(element => element[0] === parsedData[i].id || element[1] === parsedData[i].id)
    if (lookUpElement) {
      if (lookUpElement[0] === tempElement.id) {
        maxConnectChain++
        const connectionChain = [...lookUpElement]
        let connectionElement = foundSimilarities.find(element => element[0] === lookUpElement[1])
        while (connectionElement && connectionChain.indexOf(connectionElement[1]) === -1) {
          connectionChain.push(connectionElement[1])
          maxConnectChain = Math.max(connectionChain.length, maxConnectChain)
          connectionElement = foundSimilarities.find(element => element[0] === connectionElement[1])
        }
        const coords = []
        connectionChain.map(connectionElement => coords.push(...(parsedData.find(element => element.id === connectionElement)).coordinates.splice(1)))
        tempElement = { ...tempElement, coordinates: coords }
      } else if (lookUpElement[1] === tempElement.id) {
        continue
      }
    }
    unitedData.push(tempElement)
  }
  if (verbose) {
    console.log('time to unite elements', (Date.now() - splitUniteTime) / 1000, 'seconds')
    console.log('Max chain of connected routes', maxConnectChain)
    console.log('amount of datapoints', unitedData.length)
    console.log('data simplified by', Math.round((1 - (unitedData.length / (strippedData.length + removedDataPoints))) * 100), '%')
  }
  /**
   * Remove all datapoints that contain under 6 waypoints
   */
  const tranformedData = unitedData.map(element => { return { ...element, coordinates: element.coordinates.map(element => element.reverse()) } }).filter(element => element.coordinates.length > 6)

  /**
   * Helper function for Douglas-Peucker optimizer
   */
  const getPerpendicularDistance = (point, line) => {
    const pointX = point[0]
    const pointY = point[1]
    const lineStart = {
      x: line[0][0],
      y: line[0][1]
    }
    const lineEnd = {
      x: line[1][0],
      y: line[1][1]
    }
    const slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x)
    const intercept = lineStart.y - (slope * lineStart.x)
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

  /**
   * Optimizing remaining datapoints with Douglas-Peucker
   */
  const optimizeTime = Date.now()
  const optimizedData = tranformedData.map(element => { return { ...element, coordinates: douglasPeuckerOptimiser(element.coordinates, 1 / 100000) } })
  if (verbose) {
    console.log('optimized data in ', (Date.now() - optimizeTime) / 1000, 'seconds')
    const unOptimizedDataLen = tranformedData.reduce((partialSum, element) => partialSum + element.coordinates.length, 0)
    const optimizedDataLen = optimizedData.reduce((partialSum, element) => partialSum + element.coordinates.length, 0)
    console.log('unoptimized gps trace waypoints', unOptimizedDataLen)
    console.log('optimized gps trace waypoints', optimizedDataLen)
    console.log('difference to unoptimized', Math.round((1 - optimizedDataLen / unOptimizedDataLen) * 100), '%')
  }
  /**
   * Switch projection to lat-lon representation
   */
  const projectionChangeTime = Date.now()
  const returnData = optimizedData.map(element => { return { ...element, coordinates: noProj ? element.coordinates.reverse() : element.coordinates.map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.reverse())) } })
  if (verbose) {
    console.log('projection changed in', (Date.now() - projectionChangeTime) / 1000, 'seconds')
  }
  /**
   * Create a single geoJSON layer for backend
   */
  const geoJson = {
    timestamp: Date.now(),
    geoJson: {
      type: 'FeatureCollection',
      features:
        returnData.sort((a, b) => a.time > b.time ? 1 : -1).map(element => {
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

module.exports = parseData
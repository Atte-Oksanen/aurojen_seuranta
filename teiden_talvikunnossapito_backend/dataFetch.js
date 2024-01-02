const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')

const getData = () => {
  const parseTime = Date.now()
  const xmlData = fs.readFileSync('./testData/testData_30.12.23.xml').toString()
  const json = new XMLParser().parse(xmlData)
  const strippedData = []
  const testLimit = json['wfs:FeatureCollection']['gml:featureMember'].length
  let removedDataPoints = 0
  for (let i = 0; i < testLimit; i++) { //Parse data
    const element = json['wfs:FeatureCollection']['gml:featureMember'][i]
    const coords = element['GIS:AuratKartalla']['GIS:Geometry']['gml:LineString']['gml:coordinates'].split(' ')
    if (coords.length < 4) {
      removedDataPoints++
      continue
    }
    strippedData.push({
      id: i,
      workType: element['GIS:AuratKartalla']['GIS:tyolajit'].split(', ').map(element => element.replace(/,/g, '')),
      time: new Date(element['GIS:AuratKartalla']['GIS:time']).getTime(),
      coordinates: coords
    })
  }
  console.log('data transformed and stripped in', (Date.now() - parseTime) / 1000, 'seconds')
  console.log('number of datapoints', strippedData.length)
  console.log('number of datapoints removed', removedDataPoints, removedDataPoints / strippedData.length)

  const hashBuildTime = Date.now()
  let maxChain = 0
  const strippedHashArray = new Map()
  strippedData.forEach(element => {
    if (!strippedHashArray.has(element.time)) {
      strippedHashArray.set(element.time, [element])
    } else {
      const tempArray = strippedHashArray.get(element.time).concat([element])
      strippedHashArray.set(element.time, tempArray)
      maxChain = Math.max(tempArray.length, maxChain)
    }
  })
  console.log('stripped hash array length', strippedHashArray.size)
  console.log('stripped hash table max chain', maxChain)
  console.log('stripped hash table built in ', (Date.now() - hashBuildTime) / 1000, 'seconds')

  const duplicateFoundTime = Date.now()
  const duplicateIndecies = new Set()
  for (let i = 0; i < strippedData.length; i++) { //Finding duplicate data
    const subArray = strippedHashArray.get(strippedData[i].time)
    for (let y = 0; y < subArray.length; y++) {
      if (strippedData[i].time === subArray[y].time && strippedData[i].coordinates[0] === subArray[y].coordinates[0] && strippedData[i].coordinates[1] === subArray[y].coordinates[1] && strippedData[i].id !== subArray[y].id) {
        duplicateIndecies.add(strippedData[i].coordinates.length <= strippedData[y].coordinates.length ? i : y)
      }
    }
  }
  console.log('amount of duplicates', duplicateIndecies.size, duplicateIndecies.size / (strippedData.length))
  console.log('duplicates found in', (Date.now() - duplicateFoundTime) / 1000, 'seconds')

  const duplicateRemoveTime = Date.now()
  const parsedData = []
  for (let i = 0; i < strippedData.length; i++) { //Remove duplicates from data
    if (duplicateIndecies.has(i)) {
      continue
    }
    parsedData.push(strippedData[i])
  }
  console.log('Data cleaned in', (Date.now() - duplicateRemoveTime) / 1000, 'seconds')
  const parsedHashArrayTime = Date.now()
  maxChain = 0
  const parsedHashArray = new Map()
  parsedData.forEach(element => {
    const localIndex = element.coordinates[element.coordinates.length - 1]
    if (!parsedHashArray.has(localIndex)) {
      parsedHashArray.set(localIndex, [element])
    } else {
      const tempArray = parsedHashArray.get(localIndex).concat([element])
      parsedHashArray.set(localIndex, tempArray)
      maxChain = Math.max(tempArray.length, maxChain)
    }
  })
  console.log('parsed hash array length', parsedHashArray.size)
  console.log('parsed hash table max chain', maxChain)
  console.log('parsed hash table built in ', (Date.now() - parsedHashArrayTime) / 1000, 'seconds')

  const similaritiesTime = Date.now()
  const foundSimilarities = []
  for (let i = 0; i < parsedData.length; i++) { //search for connectable routes
    const subArray = parsedHashArray.get(parsedData[i].coordinates[0])
    if (!subArray) {
      continue
    }
    for (let y = 0; y < subArray.length; y++) {
      if (parsedData[i].id !== subArray[y].id && subArray[y].coordinates[subArray[y].coordinates.length - 1] === parsedData[i].coordinates[0] && Math.abs(subArray[y].time - parsedData[i].time) === 60000) {
        foundSimilarities.push([subArray[y].id, parsedData[i].id])
      }
    }
  }
  console.log('Split routes found in', (Date.now() - similaritiesTime) / 1000, 'seconds')
  console.log('split routes found', foundSimilarities.length)

  const splitUniteTime = Date.now()
  const unitedData = []
  let maxConnectChain = 0
  for (let i = 0; i < parsedData.length; i++) {
    let tempElement = parsedData[i]
    const lookUpElement = foundSimilarities.find(element => element[0] === parsedData[i].id || element[1] === parsedData[i].id)

    if (lookUpElement) {
      if (lookUpElement[0] === tempElement.id) {
        const connectionChain = [...lookUpElement]
        let connectionElement = foundSimilarities.find(element => element[0] === lookUpElement[1])
        while (connectionElement && JSON.stringify(connectionElement.reverse()) !== JSON.stringify(connectionChain[connectionChain.length - 1])) {
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
  console.log('time to unite elements', (Date.now() - splitUniteTime) / 1000, 'seconds')
  console.log('Max chain of connected routes', maxConnectChain)
  console.log('amount of datapoints', unitedData.length)
  console.log('data simplified by', Math.round((1 - (unitedData.length / (strippedData.length + removedDataPoints))) * 100), '%')

  const projectionChangeTime = Date.now()
  const tranformedData = unitedData.map(element => { return { ...element, coordinates: element.coordinates.map(element => element.split(',').map(element => Number(element)).reverse()) } })


  const getPerpendicularDistance = (lineA, lineB, point) => {
    const A = point[0] - lineA[0]
    const B = point[1] - lineA[1]
    const C = lineB[0] - lineA[0]
    const D = lineB[1] - lineA[1]
    const lenSqr = C * C + D * D
    let param = -1
    if (lenSqr != 0)
      param = A * C + B * D / lenSqr
    let xx, yy
    if (param < 0) {
      xx = lineA[0]
      yy = lineA[1]
    }
    else if (param > 1) {
      xx = lineB[0]
      yy = lineB[1]
    }
    else {
      xx = lineA[0] + param * C
      yy = lineA[1] + param * D
    }
    const dx = point[0] - xx
    const dy = point[1] - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const douglasPeuckerOptimiser = (route, epsilon) => {
    let maxDistance = 0
    let index = 0
    const end = route.length - 1
    for (let i = 2; i < end; i++) {
      const distance = getPerpendicularDistance(route[0], route[end], route[i])
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
  const optimizeTime = Date.now()
  const optimizedData = tranformedData.map(element => { return { ...element, coordinates: douglasPeuckerOptimiser(element.coordinates, 200) } })
  console.log('optimized data in ', (Date.now() - optimizeTime) / 1000, 'seconds')

  const unOptimizedDataLen = tranformedData.reduce((partialSum, element) => partialSum + element.coordinates.length, 0)
  const optimizedDataLen = optimizedData.reduce((partialSum, element) => partialSum + element.coordinates.length, 0)
  console.log('unoptimized gps trace waypoints', unOptimizedDataLen)
  console.log('optimized gps trace waypoints', optimizedDataLen)
  console.log('difference to unoptimized', Math.round((1 - optimizedDataLen / unOptimizedDataLen) * 100), '%')
  const returnData = optimizedData.map(element => { return { ...element, coordinates: element.coordinates.map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.reverse()).reverse()) } })
  console.log('projection changed in', (Date.now() - projectionChangeTime) / 1000, 'seconds')

  return returnData
}

module.exports = getData
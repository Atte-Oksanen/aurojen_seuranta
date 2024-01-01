const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')

const getData = () => {
  const xmlData = fs.readFileSync('./testData/testData_30.12.23.xml').toString()
  const json = new XMLParser().parse(xmlData)
  const strippedData = []
  const testLimit = json['wfs:FeatureCollection']['gml:featureMember'].length

  for (let i = 0; i < testLimit; i++) { //Parse data
    const element = json['wfs:FeatureCollection']['gml:featureMember'][i]
    const coords = element['GIS:AuratKartalla']['GIS:Geometry']['gml:LineString']['gml:coordinates'].split(' ')
    if (coords.length < 4) {
      continue
    }
    strippedData.push({
      id: i,
      workType: element['GIS:AuratKartalla']['GIS:tyolajit'].split(', ').map(element => element.replace(/,/g, '')),
      time: new Date(element['GIS:AuratKartalla']['GIS:time']).getTime(),
      coordinates: coords
    })
  }
  console.log('data parsed')

  strippedData.sort((a, b) => a.time < b.time ? -1 : 1)
  const hashArray = []
  let maxChain = 0
  const indexOffset = strippedData[0].time
  strippedData.forEach(element => { //Create hashtable based on datapoint time
    const localIndex = (element.time - indexOffset) % strippedData.length
    if (!hashArray[localIndex]) {
      hashArray[localIndex] = [element]
    } else {
      const tempArray = hashArray[localIndex].concat([element])
      hashArray[localIndex] = tempArray
      maxChain = Math.max(hashArray[localIndex].length, maxChain)
    }
  })
  console.log('hash array length', hashArray.length)
  console.log('max chain', maxChain)

  const duplicateIndecies = new Set()
  let loops = 0

  for (let i = 0; i < strippedData.length; i++) { //Finding duplicate data
    const subArray = hashArray[(strippedData[i].time - indexOffset) % strippedData.length]
    for (let y = 0; y < subArray.length; y++) {
      loops++
      if (strippedData[i].time === subArray[y].time && strippedData[i].coordinates[0] === subArray[y].coordinates[0] && strippedData[i].coordinates[1] === subArray[y].coordinates[1]) {
        duplicateIndecies.add(strippedData[i].coordinates.length <= strippedData[y].coordinates.length ? i : y)
      }
    }
  }
  console.log('loops to find duplicates', loops)
  console.log('amount of duplicates', duplicateIndecies.size, duplicateIndecies.size / (strippedData.length))

  const parsedData = []
  for (let i = 0; i < strippedData.length; i++) { //Remove duplicates from data
    if (duplicateIndecies.has(i)) {
      continue
    }
    parsedData.push(strippedData[i])
  }
  console.log('Data cleaned')
  // const foundSimilarities = []
  // for (let i = 0; i < parsedData.length; i++) { //search for same end and start points in data
  //   for (let y = 0; y < parsedData.length; y++) {
  //     if (y === i) {
  //       continue
  //     }
  //     if (parsedData[i].coordinates[parsedData[i].coordinates.length - 1] === parsedData[y].coordinates[0] && Math.abs(parsedData[i].time - parsedData[y].time) < 70000) {
  //       foundSimilarities.push([i, y])
  //     }
  //   }
  // }

  // console.log('split routes found', foundSimilarities.length)
  //TODO: add functionality to unite split routes

  return parsedData.map(element => { return { ...element, coordinates: element.coordinates.map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.split(',').map(element => Number(element))).reverse()) } })
}

module.exports = getData
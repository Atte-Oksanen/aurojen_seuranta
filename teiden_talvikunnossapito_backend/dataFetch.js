const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')

const getData = () => {
  const xmlData = fs.readFileSync('./testData/testData_28.12.23.xml').toString()
  const json = new XMLParser().parse(xmlData)
  const parsedData = []
  const coordLengths = []
  let runningId = 0

  json['wfs:FeatureCollection']['gml:featureMember'].forEach(element => {
    const coords = element['GIS:AuratKartalla']['GIS:Geometry']['gml:LineString']['gml:coordinates'].split(' ')
    if (coords.length < 5) {
      return
    }
    const filteredCoords = coords.length < 14 ? [coords[0], coords[coords.length - 1]] : [coords[0], ...coords.filter((coordElement, index) => { return index % 12 !== 0 ? false : true }), coords[coords.length - 1]]
    const mappedCoords = filteredCoords.map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.split(',').map(element => Number(element))).reverse())
    coordLengths.push(filteredCoords.length)
    parsedData.push({
      id: runningId++,
      workType: element['GIS:AuratKartalla']['GIS:tyolajit'].split(', ').map(element => element.replace(/,/g, '')),
      time: new Date(element['GIS:AuratKartalla']['GIS:time']).getTime(),
      coordinates: mappedCoords
    })

  })
  console.log(coordLengths.reduce((partialSum, a) => partialSum + a, 0) / parsedData.length, coordLengths.reduce((partialSum, a) => partialSum + a, 0), parsedData.length)
  return parsedData
}

module.exports = getData
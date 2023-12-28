const fs = require('fs')
const { XMLParser } = require('fast-xml-parser')
const epsg3879 = require('epsg-index/s/3879.json')
const epsg4326 = require('epsg-index/s/4326.json')
const proj4 = require('proj4')

const getData = async () => {
  const xmlData = fs.readFileSync('./testData/testData_28.12.23.xml').toString()
  const parser = new XMLParser()
  const json = parser.parse(xmlData)
  const parsedData = []
  json['wfs:FeatureCollection']['gml:featureMember'].forEach(element => {
    const coords = element['GIS:AuratKartalla']['GIS:Geometry']['gml:LineString']['gml:coordinates']
      .split(' ')
      .map(element => proj4(epsg3879.proj4, epsg4326.proj4, element.split(',').map(element => Number(element))).reverse())
    const workType = element['GIS:AuratKartalla']['GIS:tyolajit']
    const time = new Date(element['GIS:AuratKartalla']['GIS:time']).getTime()
    const dataNode = { id: crypto.randomUUID(), workType: workType, time: time, coordinates: coords }
    parsedData.push(dataNode)
  })
  return parsedData
}

module.exports = getData
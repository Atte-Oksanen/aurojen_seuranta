const parseData = require('../utils/dataParser')
const fs = require('fs')
const data = (fs.readFileSync('../testData/testData_30.12.23.xml')).toString()
const dataParseTime = Date.now()
const parsedData = parseData(data, true, false)
fs.writeFileSync('dataSizeTest.json', JSON.stringify(parsedData))
console.log('Data parsed in', (Math.round((Date.now() - dataParseTime) / 10)) / 100, 'seconds')
console.log(parsedData.geoJson.features[0].properties)
let maxChain = 0
let maxChainValue = ''
const roadNameHashArray = new Map()
parsedData.geoJson.features.forEach(element => {
    if (!roadNameHashArray.has(element.properties.roadName)) {
        roadNameHashArray.set(element.properties.roadName, [element])
    } else {
        const tempArray = roadNameHashArray.get(element.properties.roadName).concat([element])
        roadNameHashArray.set(element.properties.roadName, tempArray)
        if (tempArray.length > maxChain) {
            maxChainValue = tempArray[0].properties.roadName
        }
        maxChain = Math.max(tempArray.length, maxChain)
    }
})
console.log('roadhash max chain', maxChain)
console.log('roadhash max value', maxChainValue)

maxChain = 0
const timeHash = new Map()
roadNameHashArray.get(maxChainValue).forEach(element => {
    if (!timeHash.has(element.properties.time)) {
        timeHash.set(element.properties.time, [element])
    } else {
        const tempArray = timeHash.get(element.properties.time).concat([element])
        timeHash.set(element.properties.time, tempArray)
        if (tempArray.length > maxChain) {
            maxChainValue = tempArray[0].properties.time
        }
        maxChain = Math.max(tempArray.length, maxChain)
    }
})
console.log(timeHash.size, maxChain, maxChainValue)

let sub10Elements = 0
parsedData.geoJson.features.map(element => element.geometry.coordinates.length < 20 ? sub10Elements++ : null)
console.log(sub10Elements)
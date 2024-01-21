const PlowData = require('../models/plowData')

const updateMongo = async (inputPlowData) => {
    const inputData = inputPlowData.geoJson.features
    const roadNamesWithTime = new Map()
    inputData.forEach(element => {
        if (roadNamesWithTime.has(element.properties.roadName)) {
            roadNamesWithTime.set(element.properties.roadName, Math.max(element.properties.time, roadNamesWithTime.get(element.properties.roadName)))
        } else {
            roadNamesWithTime.set(element.properties.roadName, element.properties.time)
        }
    })
    Array.from(roadNamesWithTime).forEach(async element => {
        const newPlowData = {
            timeStamp: element[1]
        }
        await PlowData.findOneAndUpdate({ roadName: element[0] }, newPlowData, { upsert: true })

    })
    console.log(`Updated plowing data for ${roadNamesWithTime.size} roads`)
}

module.exports = updateMongo
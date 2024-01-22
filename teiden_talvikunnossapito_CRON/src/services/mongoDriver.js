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
    const roadNameArray = Array.from(roadNamesWithTime)
    for (let i = 0; i < roadNameArray.length; i++) {
        const newPlowData = {
            roadName: roadNameArray[i][0],
            timeStamp: roadNameArray[i][1]
        }
        await PlowData.findOneAndUpdate({ roadName: newPlowData.roadName }, newPlowData, { upsert: true, new: true })
    }

    console.log(`Updated plowing data for ${roadNamesWithTime.size} roads`)
}

module.exports = updateMongo
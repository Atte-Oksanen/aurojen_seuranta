const PlowData = require('../models/plowData')

const updateRoadData = async (inputPlowData) => {
    const startTime = Date.now()
    const inputData = inputPlowData.geoJson.features
    const roadNamesWithTime = new Map()
    inputData.forEach(element => {
        if (roadNamesWithTime.has(element.properties.roadName)) {
            roadNamesWithTime.set(element.properties.roadName, { time: Math.max(element.properties.time, roadNamesWithTime.get(element.properties.roadName).time), coords: roadNamesWithTime.get(element.properties.roadName).coords })
        } else {
            roadNamesWithTime.set(element.properties.roadName, { time: element.properties.time, coords: element.geometry.coordinates[0] })
        }
    })


    const roadNameArray = Array.from(roadNamesWithTime)
    const bulkOperations = roadNameArray.map(element => {
        return {
            updateOne: {
                filter: { roadName: element[0] },
                update: { $set: { roadName: element[0], timeStamp: element[1].time, coords: element[1].coords } },
                upsert: true
            }
        }
    })
    const bulkOpResult = await PlowData.collection.bulkWrite(bulkOperations)
    console.log('Bulk operation finished in', (Date.now() - startTime) / 1000, 'seconds')
    console.log(`Updated plowing data for ${bulkOpResult.modifiedCount} roads`)
    console.log(`Added plowing data for ${bulkOpResult.upsertedCount} roads`)
}

module.exports = updateRoadData
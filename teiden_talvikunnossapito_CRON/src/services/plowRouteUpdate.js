const parseData = require('../utils/dataParser')
const GeoJson = require('../models/plowGeoJson')


const updatePlowRoutes = async (data) => {
    const startTime = Date.now()
    await GeoJson.deleteMany({})
    const newGeoJson = new GeoJson(data)
    await newGeoJson.save()
    console.info('Plow routes updated in', Math.round((Date.now() - startTime) / 1000), 'seconds')
}

module.exports = updatePlowRoutes
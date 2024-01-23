require('dotenv').config()
const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URI
const updatePlowRoutes = require('./src/services/plowRouteUpdate')
const updateRoadData = require('./src/services/roadDataUpdate')
const loadData = require('./src/services/dataLoader')
const parseData = require('./src/utils/dataParser')


const runCRON = async () => {
    const cronTime = Date.now()
    await mongoose.connect(mongoURI)
    console.log('connected to MongoDB')
    const rawData = await loadData()
    const parsedData = parseData(rawData, true)
    await updatePlowRoutes(parsedData)
    await updateRoadData(parsedData)
    await mongoose.connection.close()
    console.log('Process finished in', (Date.now() - cronTime) / 1000, 'seconds')
}

runCRON()
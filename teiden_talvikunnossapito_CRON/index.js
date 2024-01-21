require('dotenv').config()
const mongoose = require('mongoose')
const mongoURI = process.env.MONGODB_URI
const updateDB = require('./src/cronJobs/testDataCRON')
const updateMongo = require('./src/services/mongoDriver')

const runCRON = async () => {
    const plowData = await updateDB()
    await mongoose.connect(mongoURI)
    console.log('connected to MongoDB')
    await updateMongo(plowData)
    process.exit(1)
}

runCRON()
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const snowplowRouter = require('./routers/snowplowRouter')
const mongoose = require('mongoose')
const mongoAddress = process.env.MONGODB_URI


mongoose.connect(mongoAddress).then(() => {
    console.info('connected to database')
}).catch((error) => {
    console.error('Error connecting to database', error)
})

app.use(cors())

app.use('/api/snowplow', snowplowRouter)

module.exports = app

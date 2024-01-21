require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const mongoUri = process.env.MONGODB_URI
const snowplowRouter = require('./routers/snowplowRouter')
const healthRouter = require('./routers/healthRouter')
const roadRouter = require('./routers/roadRouter')

mongoose.connect(mongoUri).then(() => {
    console.log('connected to MongoDB')
}).catch(error => {
    console.log('error connecting to database', error.message)
})


app.use(cors())


app.use('/api/snowplow', snowplowRouter)
app.use('/api/roads', roadRouter)
app.use('/api/health', healthRouter)

module.exports = app

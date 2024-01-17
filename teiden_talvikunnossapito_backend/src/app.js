require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const snowplowRouter = require('./routers/snowplowRouter')
const healthRouter = require('./routers/healthRouter')


app.use(cors())

app.use('/api/snowplow', snowplowRouter)
app.use('/api/health', healthRouter)

module.exports = app

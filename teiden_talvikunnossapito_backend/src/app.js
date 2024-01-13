require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const snowplowRouter = require('./routers/snowplowRouter')


app.use(cors())

app.use('/api/snowplow', snowplowRouter)

module.exports = app

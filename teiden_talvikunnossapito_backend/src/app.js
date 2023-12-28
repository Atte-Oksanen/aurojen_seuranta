const express = require('express')
const app = express()
const cors = require('cors')
const snowplowRouter = require('./routers/snowplowRouter')
const getRoutesXWeeksAgo = require('./services/snowplowRoute')

app.use(cors())

app.use('/api/snowplow', snowplowRouter)

module.exports = app

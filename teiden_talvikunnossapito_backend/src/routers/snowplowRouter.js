const getData = require('../../dataFetch')
const getRoutesXWeeksAgo = require('../services/snowplowRoute')

const snowplowRouter = require('express').Router()
console.log('data load started')
const startTime = Date.now()
const snowPlowData = getData()
console.log('snow plow data loaded', (Date.now() - startTime) / 1000, snowPlowData.length, snowPlowData[0].coordinates.length)

snowplowRouter.get('/', (req, res) => {
  res.json(snowPlowData)
})

module.exports = snowplowRouter
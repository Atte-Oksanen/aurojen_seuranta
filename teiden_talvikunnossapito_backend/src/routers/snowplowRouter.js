const getData = require('../../dataFetch')
const getRoutesXWeeksAgo = require('../services/snowplowRoute')

const snowplowRouter = require('express').Router()
console.log('data load started')
const startTime = Date.now()
const snowPlowData = getData()
console.log('snow plow data loaded in', (Date.now() - startTime) / 1000, snowPlowData.length)
console.log('plow routes', snowPlowData.length)

snowplowRouter.get('/', (req, res) => {
  res.json(snowPlowData)
})

module.exports = snowplowRouter
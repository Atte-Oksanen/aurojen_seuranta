const getData = require('../../dataFetch')
const getRoutesXWeeksAgo = require('../services/snowplowRoute')

const snowplowRouter = require('express').Router()
const snowPlowData = getData()
console.log('snow plow data loaded')

snowplowRouter.get('/', (req, res) => {
  res.json(snowPlowData)
})

module.exports = snowplowRouter
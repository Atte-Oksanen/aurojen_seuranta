const getRoutesXWeeksAgo = require('../services/snowplowRoute')

const snowplowRouter = require('express').Router()


snowplowRouter.get('/', async (req, res) => {
  res.json(await getRoutesXWeeksAgo(20))
})

module.exports = snowplowRouter
const getData = require('../../dataFetch')
const getRoutesXWeeksAgo = require('../services/snowplowRoute')

const snowplowRouter = require('express').Router()


snowplowRouter.get('/', async (req, res) => {
  // res.json(await getRoutesXWeeksAgo(5))
  res.json(await getData())
})

module.exports = snowplowRouter
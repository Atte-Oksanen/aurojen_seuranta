const snowplowRouter = require('express').Router()
const GeoJson = require('../models/plowGeoJson')

snowplowRouter.get('/', async (req, res) => {
  res.json(await GeoJson.find({}))
})


module.exports = snowplowRouter
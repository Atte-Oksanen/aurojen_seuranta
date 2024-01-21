const roadRouter = require('express').Router()
const PlowData = require('../models/plowData')
roadRouter.get('/', async (req, res) => {
    res.json(await PlowData.find({}))
})


module.exports = roadRouter
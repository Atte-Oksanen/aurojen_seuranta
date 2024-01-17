const getDataFromAWS = require('../services/getDataFromAWS')
const snowplowRouter = require('express').Router()
let snowPlowData = null

const primeData = async () => {
  snowPlowData = await getDataFromAWS()
}

primeData()

setInterval(() => primeData(), 7200000)


snowplowRouter.get('/', (req, res) => {
  res.json(snowPlowData)
})

module.exports = snowplowRouter
const getDataFromAWS = require('../services/getDataFromAWS')
const snowplowRouter = require('express').Router()
console.log('data load started')
const startTime = Date.now()
let snowPlowData = null

const primeData = async () => {
  snowPlowData = await getDataFromAWS()
}

primeData()


snowplowRouter.get('/', (req, res) => {
  res.json(snowPlowData)
})

module.exports = snowplowRouter
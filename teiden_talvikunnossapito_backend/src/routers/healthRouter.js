const healthRouter = require('express').Router()


healthRouter.get('/', (req, res) => {
    res.status(200).json({ status: 'operational' })
})

module.exports = healthRouter
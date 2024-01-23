const mongoose = require('mongoose')

const plowGeoJsonSchema = mongoose.Schema({
    timestamp: { type: Number },
    geoJson: { type: Object },
})

plowGeoJsonSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})


module.exports = mongoose.model('plowGeoJson', plowGeoJsonSchema)
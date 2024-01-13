const mongoose = require('mongoose')

const PlowDataSchema = mongoose.Schema({
    type: { type: String },
    timeStamp: { type: Number },
    data: { type: Object }
})

PlowDataSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})


module.exports = mongoose.model('plowData', PlowDataSchema)
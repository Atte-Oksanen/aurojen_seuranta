const mongoose = require('mongoose')

const PlowDataSchema = mongoose.Schema({
  roadName: { type: String },
  timeStamp: { type: Number },
  coords: { type: Array }

})

PlowDataSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject._v
  }
})


module.exports = mongoose.model('plowData', PlowDataSchema)
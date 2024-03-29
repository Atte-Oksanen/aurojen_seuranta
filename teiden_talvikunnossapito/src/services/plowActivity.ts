import axios from "axios"
import { FeatureCollection } from "geojson"

interface returnObject {
  geoJson: FeatureCollection,
  type: string,
  timestamp: number
}

let API_URL = ''
if (process.env.NODE_ENV === 'development') {
  API_URL = 'http://localhost:3001/api/snowplow'
} else {
  API_URL = 'https://auraseuranta-backend.onrender.com/api/snowplow'
}

const getPlowData = async (): Promise<returnObject> => {
  return (await axios.get(API_URL)).data[0]
}

export default { getPlowData }
import axios from "axios"
import { GeoJsonObject } from "geojson"

interface returnObject {
  geoJson: GeoJsonObject,
  type: string,
  timestamp: number
}
const API_URL = 'http://localhost:3001/api/snowplow'
const getPlowData = async (): Promise<returnObject> => {
  return (await axios.get(API_URL)).data
}

export default { getPlowData }
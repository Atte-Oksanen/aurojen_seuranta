import axios from "axios"
import { GeoJsonObject } from "geojson"

const API_URL = 'http://localhost:3001/api/snowplow'

const getPlowData = async (): Promise<GeoJsonObject> => {
  return (await axios.get(API_URL)).data
}

export default { getPlowData }
import axios from "axios"
import { MapDataObject } from "../components/types/mapDataObject"

const API_URL = 'http://localhost:3001/api/snowplow'

const getPlowData = async (): Promise<MapDataObject[]> => {
  return (await axios.get(API_URL)).data
}

export default { getPlowData }
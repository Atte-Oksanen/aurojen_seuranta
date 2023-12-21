import axios from "axios"
const API_URL = 'http://localhost:3001/api/snowplow'
const getPlowData = async () => {
  return (await axios.get(API_URL)).data
}

export default { getPlowData }
import axios from "axios"

interface returnObject {
    roadName: string,
    timeStamp: number,
    id: string
}

let API_URL = ''
if (process.env.NODE_ENV === 'development') {
  API_URL = 'http://localhost:3001/api/roads'
} else {
  API_URL = 'https://auraseuranta-backend.onrender.com/api/roads'
}

const getRoadNames = async (): Promise<returnObject[]> => {
  return (await axios.get(API_URL)).data
}

export default { getRoadNames }
const axios = require('axios')
const URL = 'https://dev.hel.fi/aura/v1/snowplow/'

const getRoutesXWeeksAgo = async (weeks) => {
  const activeRoutes = (await axios.get(`${URL}?since=${weeks}week+ago`)).data
  const activePlows = activeRoutes.map(element => element.id)
  const routeData = []
  console.log(activePlows.length)
  for (element of activePlows) {
    const singleRoute = (await axios.get(`${URL}/${element}?history=100000`)).data
    console.log('route found')
    routeData.push(singleRoute)
  }
  return routeData
}

module.exports = getRoutesXWeeksAgo
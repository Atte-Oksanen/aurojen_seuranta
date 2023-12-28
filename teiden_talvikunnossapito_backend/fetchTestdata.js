const axios = require('axios')
const fs = require('fs')


const fetchData = async () => {
  const data = (await axios.get('https://kartat.espoo.fi/teklaogcweb/wfs.ashx?service=WFS&version=1.0.0&request=GetFeature&typeName=GIS:AuratKartalla')).data
  fs.writeFileSync('./fresh_testData.xml', data)
}

fetchData()
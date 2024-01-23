const axios = require('axios')

const loadData = async () => {
    const startTime = Date.now()
    const data = (await axios.get('https://kartat.espoo.fi/teklaogcweb/wfs.ashx?service=WFS&version=1.0.0&request=GetFeature&typeName=GIS:AuratKartalla')).data
    console.log('data loaded in', (Date.now() - startTime) / 1000, 'seconds')
    return data
}

module.exports = loadData
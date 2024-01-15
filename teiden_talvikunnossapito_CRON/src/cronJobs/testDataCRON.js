const parseData = require('./dataFetch')
const axios = require('axios')
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client({ region: 'eu-north-1' })

const updateDB = async () => {
    const startTime = Date.now()
    const data = (await axios.get('https://kartat.espoo.fi/teklaogcweb/wfs.ashx?service=WFS&version=1.0.0&request=GetFeature&typeName=GIS:AuratKartalla')).data
    console.log('data loaded')
    const parsedData = parseData(data, true)
    console.log('file upload started')
    const command = new PutObjectCommand({
        Body: JSON.stringify(parsedData),
        Bucket: 'auraseurantaplowdata',
        Key: 'latest.json'
    })
    await client.send(command)
    console.log('new datapoint saved')
    console.info('Database updated in', Math.round((Date.now() - startTime) / 1000), 'seconds')
}

module.exports = updateDB
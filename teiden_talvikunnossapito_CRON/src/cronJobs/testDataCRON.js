const parseData = require('./dataFetch')
const axios = require('axios')
const AWS = require('aws-sdk')
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client({ region: 'eu-north-1' })

const updateDB = async () => {
    const data = (await axios.get('https://kartat.espoo.fi/teklaogcweb/wfs.ashx?service=WFS&version=1.0.0&request=GetFeature&typeName=GIS:AuratKartalla')).data
    console.log('data loaded')
    const parsedData = parseData(data)
    console.log('file upload started')
    const command = new PutObjectCommand({
        Body: JSON.stringify(parsedData),
        Bucket: 'auraseurantaplowdata',
        Key: 'latest.json'
    })
    await client.send(command)
    console.log('new datapoint saved')
}

module.exports = updateDB
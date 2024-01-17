const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client({ region: 'eu-north-1' })

const getPlowData = async () => {
    const command = new GetObjectCommand({
        Bucket: 'auraseurantaplowdata',
        Key: 'latest.json',
    })
    const res = await client.send(command)
    const resStr = await res.Body.transformToString()
    const timeNow = new Date(Date.now()).toUTCString()
    console.log('data fetched at', timeNow)
    return JSON.parse(resStr)
}

module.exports = getPlowData
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client({ region: 'eu-north-1' })

const getPlowData = async () => {
    const command = new GetObjectCommand({
        Bucket: 'auraseurantaplowdata',
        Key: 'latest.json',
    })
    const res = await client.send(command)
    const resStr = await res.Body.transformToString()
    console.log('data fetched')
    return JSON.parse(resStr)
}

module.exports = getPlowData
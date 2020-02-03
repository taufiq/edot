const express = require('express')
const aws = require('aws-sdk')
const { celebrate, Joi } = require('celebrate')
const bodyParser = require('body-parser')
const moment = require('moment')

const port = 3000
const S3_BUCKET = 'edot.open.gov.sg'
const AWS_REGION = 'ap-southeast-1'
const MAX_UPLOAD_FILE_SIZE = 10 * 1000 * 1000 // 10 Million/Mega Bytes, or 10 MB
const awsConfig = {
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
}

// const configureAws = async () => {
  // if (module.exports.nodeEnv === environmentEnums.DEVELOPMENT) {
    aws.config.update(awsConfig)
  // } else {
  //   const getCredentials = () => new Promise((resolve, reject) => {
  //     aws.config.getCredentials((err) => {
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve()
  //       }
  //     })
  //   })
  //   await getCredentials()
  // }
// }

// await configureAws()
const s3 = new aws.S3({ region: AWS_REGION })
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app
  .route('/patients/:patientId')
  .get(
    (req, res) => {
      res.status(200).send({
        nric: 'XXXX9278Z',
        name: 'Arshad Ali',
        totalTreatmentDays: 90,
        numDaysLeft: 10
      })
    }
  )

app
  .route('/patients/:patientId([a-zA-Z0-9]+)/records')
  .put(
    celebrate({
      body: Joi.object().keys({
        videoLink: Joi.string()
          .required()
          .error(() => 'Error - Please specify the video link'),
        sideEffects: Joi.boolean()
          .required()
          .error(() => 'Error - Please specify whether there are side effects'),
      }),
    }),
    (req, res) => {
      return res.status(200).send('Record saved!')
    }
  )


app
  .route('/patients/:patientId([a-zA-Z0-9]+)/videos')
  .post(
    celebrate({
      body: Joi.object().keys({
        fileMd5Hash: Joi.string()
          .base64()
          .required()
          .error(() => 'Error - your file could not be verified'),
        fileType: Joi.string()
          .required()
          .error(() => 'Error - your file could not be verified'),
      }),
    }),
    (req, res) => {
      const fileId = `${req.params.patientId}_${moment().format('DDMMYYYY')}`
      s3.createPresignedPost({
        Bucket: S3_BUCKET,
        Expires: 900, // Expires in 15 mins
        Conditions: [
          ['content-length-range', 0, MAX_UPLOAD_FILE_SIZE], // content length restrictions: 0-MAX_UPLOAD_FILE_SIZE
        ],
        Fields: {
          acl: 'private',
          key: fileId,
          'Content-MD5': req.body.fileMd5Hash,
          'Content-Type': req.body.fileType,
        },
      }, function (err, presignedPostObject) {
        if (err) {
          console.error('Presigning post data encountered an error', err)
          return res.status(400).send(err)
        } else {
          return res.status(200).send(presignedPostObject)
        }
      })
    }
  )

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

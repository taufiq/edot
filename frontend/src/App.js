import React, { Component } from 'react';
import AWS from 'aws-sdk';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import VideoRecorder from './components/VideoRecorder';
import UploadingScreen from './components/UploadingScreen';
import LandingScreen from './screens/Landing';
import JKL from './components/ProgressBar';
import axios from 'axios';
import moment from 'moment';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      success : false,
      url : "",
      error: false,
      errorMessage : "",
      s3Instance: null,
      hasUploaded: false,
      uploadProgress: 0,
    }
  }
  componentDidMount() {
    console.log(process.env)
    let credentials = new AWS.Credentials(process.env.REACT_APP_AWS_ACCESS_KEY_ID, process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
    AWS.config.update({
      credentials,
      region: 'ap-southeast-1'
    })
    const s3 = new AWS.S3()
    this.setState({ s3Instance: s3 })
  }
  
  uploadVideo = async (video, hash) => {
    const BASE_URL = 'http://localhost:8081'
    const patientId = ''
    try {
      const { data: postData } = await axios.post(`http://localhost:8081/videos`, {
        fileMd5Hash: hash,
        fileType: "video/webm",
        patientId,
      });
      console.log(postData)
      let formData = new FormData()
      Object.entries(postData.fields).forEach(([k, v]) => formData.append(k, v))
      formData.set('Content-MD5', hash)
      formData.append('file', video)

      // To retrieve presigned payload
      // This doesn't work, due to some md5 mismatch
      const presignedPostResp = await axios.post(postData.url, formData, {
        'Content-Type': undefined, // In order for the boundary to be automatically set
        withCredentials: true,
      })
      .then(v => {
        console.log(v)
      })
    } catch (error) {
      console.log(error)
    }
    // const { s3Instance } = this.state;
    // let uploadParams = {Bucket: 'edot', Key: `${patientId}-${moment().format('DDMMYYYY')}.webm`, Body: video};
    // setTimeout(() => this.setState({ hasUploaded: true }), 2000)
    // s3Instance.upload(uploadParams, {}, (err, data) => {
    //   if (err) {
    //     console.error('error', err)
    //   }
    //   else {
    //     this.setState({ hasUploaded: true })
    //     console.log('uploaded!', data)
    //   }
    // })

    /**
     * Neither does this, it is the next instruction to carry out
     * this will then send URL of the uploaded video. But since the video can't be uploaded,
     * this is dysfunctional
     */
    axios.put(`${BASE_URL}/videos`, {
      videoLink: video,
      sideEffects: false,
      patientId,
    })
    setTimeout(() => this.setState({ hasUploaded: true }), 2000)
  }


  render() {
    const { hasUploaded } = this.state;
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path='/record'>
              <VideoRecorder onVideoRecorded={this.uploadVideo}/>
              { hasUploaded && <Redirect to="/uploading"/> }
            </Route>
            <Route path='/uploading'>
              <UploadingScreen />
            </Route>
            <Route path='/'>
              <LandingScreen />
            </Route>
          </Switch>
        </Router>
        
      </div>
    );
  }
}

export default App;
import React, { Component } from 'react';
import AWS from 'aws-sdk';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.css';
import './App.css';
import VideoRecorder from './components/VideoRecorder';
import UploadingScreen from './components/UploadingScreen';
import LandingScreen from './screens/Landing';

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
    }
  }
  componentDidMount() {
    let credentials = new AWS.Credentials(process.env.REACT_APP_AWS_ACCESS_KEY_ID, process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
    AWS.config.update({
      credentials,
      region: 'ap-southeast-1'
    })
    const s3 = new AWS.S3()
    this.setState({ s3Instance: s3 })
  }
  
  uploadVideo = (video) => {
    const { s3Instance } = this.state;
    this.setState({ hasRecorded: true })
    let uploadParams = {Bucket: 'edot', Key: `tanahkow-${new Date().toISOString()}.webm`, Body: video};
    // setTimeout(() => this.setState({ hasUploaded: true }), 2000)
    s3Instance.upload(uploadParams, {}, (err, data) => {
      if (err) {
        this.setState({ hasUploaded: true })
        console.error('error', err)
      }
      else {
        this.setState({ hasUploaded: true })
        console.log('uploaded!')
      }
    })
  }


  render() {
    const { hasRecorded, hasUploaded } = this.state;
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path='/record'>
              { !hasRecorded
                ? <VideoRecorder onVideoRecorded={this.uploadVideo}/>
                : <UploadingScreen hasUploaded={hasUploaded}/>
              }
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
import React, { Component } from 'react';
import axios from 'axios';
import AWS from 'aws-sdk';
import './App.css';
import VideoRecorder from './components/VideoRecorder';
import UploadingScreen from './components/UploadingScreen';

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

  handleChange = (ev) => {
    this.setState({success: false, url : ""});
  }

  handleUpload = (ev) => {
    let file = this.uploadInput.files[0];
    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split('.');
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    console.log("Preparing the upload");
    axios.post("http://localhost:3001/sign_s3",{
      fileName : fileName,
      fileType : fileType
    })
    .then(response => {
      var returnData = response.data.data.returnData;
      var signedRequest = returnData.signedRequest;
      var url = returnData.url;
      this.setState({url: url})
      console.log("Recieved a signed request " + signedRequest);

      var options = {
        headers: {
          'Content-Type': fileType
        }
      };
      axios.put(signedRequest,file,options)
      .then(result => {
        console.log("Response from s3")
        this.setState({success: true});
      })
      .catch(error => {
        alert("ERROR " + JSON.stringify(error));
      })
    })
    .catch(error => {
      alert(JSON.stringify(error));
    })
  }

  uploadVideo = (video) => {
    const { s3Instance } = this.state;
    this.setState({ hasRecorded: true })
    let uploadParams = {Bucket: 'edot', Key: `tanahkow-${new Date().toISOString()}.webm`, Body: video};
    setTimeout(() => this.setState({ hasUploaded: true }), 2000)
    // s3Instance.upload(uploadParams, {}, function (err, data) {
    //   if (err) {
    //     console.error('error', err)
    //   }
    //   else {
    //     console.log('uploaded!')
    //   }
    // })
  }


  render() {
    const { hasRecorded, hasUploaded } = this.state;
    return (
      <div className="App">
        { !hasRecorded
        ? <VideoRecorder onVideoRecorded={this.uploadVideo}/>
        : <UploadingScreen hasUploaded={hasUploaded}/>
        }
      </div>
    );
  }
}

export default App;
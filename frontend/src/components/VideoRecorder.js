import React, { Component } from 'react';
import RecordRTC from 'recordrtc';
import * as faceapi from 'face-api.js';
import { TinyFaceDetectorOptions, SsdMobilenetv1Options, Point } from 'face-api.js';

let constraints = {
  audio: true,
  video: true,
}

class VideoRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recorder: null,
      isRecording: false,
      isFaceAligned: false,
      hasGoodLighting: false,
      loaded: false,
    };
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.gridCanvasRef = React.createRef();
  }

  async componentDidMount() {
    const MODEL_URL = '/models'
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    // await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    let canvas = this.canvasRef.current;


    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        let video = this.videoRef.current;
        video.srcObject = stream;
        video.volume = 0;


        let recorder = RecordRTC(stream, {
          type: 'video'
        });
        
        recorder.camera = stream;
        this.setState({ recorder });
      })
      .catch((error) => console.error(error))
  }
  onVideoPlay = async () => {
    let video = this.videoRef.current;
    let canvas = this.canvasRef.current;
    let gridCanvas = this.gridCanvasRef.current;
    gridCanvas.width = video.offsetWidth;
    gridCanvas.height = video.offsetHeight;
    
    // Draw face grid
    if (!this.state.isFaceAligned) {
      let ctx = gridCanvas.getContext('2d')
      ctx.beginPath();
      ctx.ellipse(gridCanvas.width/2, gridCanvas.height/2, gridCanvas.width/6, gridCanvas.width/6*1.2, 0, 0, 2 * Math.PI);
      ctx.stroke()
    }

    const result = await faceapi.detectSingleFace(video, new TinyFaceDetectorOptions({ scoreThreshold: 0.5, inputSize: 128 }))
    if (!this.state.loaded) this.setState({ loaded: true })
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight }

    if (result) {
      const dims = faceapi.matchDimensions(canvas, displaySize)
      // To resize the bounding box with respect to the canvas size
      const resizedResults = faceapi.resizeResults(result, dims)
      if (!this.state.isFaceAligned) {
        const boxCenterCoordinates = new Point(resizedResults.box.topRight.add(resizedResults.box.bottomLeft).x/2, resizedResults.box.topRight.add(resizedResults.box.bottomLeft).y/2)
        const canvasCenterCoordinates = new Point(canvas.width/2, canvas.height/2);
        const distanceFromCenter = canvasCenterCoordinates.sub(boxCenterCoordinates).abs().magnitude()
        if (distanceFromCenter < 50) {this.setState({ isFaceAligned: true })}
      }
      // draw the detection onto canvas
      faceapi.draw.drawDetections(canvas, resizedResults)
    }
    setTimeout(() => this.onVideoPlay())
  }


  startRecording = () => {
    const { recorder } = this.state;
    this.setState({ isRecording: true });
    recorder.startRecording();
  }

  stopRecording = () => {
    const { recorder } = this.state;
    let video = this.videoRef.current;
    this.setState({ isRecording: false });

    recorder.stopRecording(() => {
      // video.src = video.srcObject = null; // Need to reset video src before changing input source
      const recordedVideoBlob = recorder.getBlob();
      // const recordedVideoURL = URL.createObjectURL(recordedVideoBlob);
      video.volume = 1;
      // video.src = recordedVideoURL;

      // const videoFile = new File([recordedVideoBlob], 'tanahkow.webm');
      const reader = new FileReader()
      reader.onload = (event) => {
        this.props.onVideoRecorded(event.target.result);
      }
      reader.readAsArrayBuffer(recordedVideoBlob)

      recorder.camera.stop();
      recorder.destroy();
    })
  }

  render() {
    const { isRecording, isFaceAligned, loaded, hasGoodLighting } = this.state;
    return (
      <div style={{ position: "relative" }}>
        <video playsInline autoPlay ref={this.videoRef} onPlay={this.onVideoPlay} style={{ width: '100%' }}></video>
        <canvas
          ref={this.canvasRef}
          style={{ position: 'absolute', left: '0'}}/>
        <canvas
          ref={this.gridCanvasRef}
          style={{ position: 'absolute', left: '0'}}/>
        <button
          disabled={!isFaceAligned}
          onClick={isRecording ? this.stopRecording : this.startRecording}
          style={{ position: 'absolute', left: '50%', bottom: '0', transform: 'translate(-50%, 0)' }}
        >
          {isRecording ? 'Stop' : 'Start'}
        </button>
        {
          !loaded && (
            <div className=" hover-top alert alert-warning" role="alert">
              Loading...
            </div>
          )
        }
        {
          loaded && !isFaceAligned && (
            <div className=" hover-top alert alert-warning" role="alert">
              Please align your face to the grid
            </div>
          )
        }
        {
          loaded && isFaceAligned && !hasGoodLighting && (
            <div className=" hover-top alert alert-warning" role="alert">
              Please ensure there is good lighting
            </div>
          )
        }
        {
          loaded && isFaceAligned && hasGoodLighting && (
            <div className="hover-top alert alert-success" role="alert">
              You may now record!
            </div>
          )
        }
        {/* <button onClick={this.stopRecording}>Stop Recording</button> */}
      </div>
    )
  }
}

export default VideoRecorder;
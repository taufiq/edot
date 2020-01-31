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
    this.faceCanvasRef = React.createRef();
    this.gridCanvasRef = React.createRef();
    this.cameraCanvasRef = React.createRef();
  }

  async componentDidMount() {
    const MODEL_URL = '/models'
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        let video = this.videoRef.current;
        video.srcObject = stream;
        video.volume = 0;
        video.muted = true;

        let recorder = RecordRTC(stream, {
          type: 'video'
        });
        
        recorder.camera = stream;
        this.setState({ recorder });
      })
      .catch((error) => console.error(error))
  }

  getBrightness = (canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
    var r,g,b,avg;
    var colorSum = 0;
    for(var x = 0, len = data.length; x < len; x+=4) {
      r = data[x];
      g = data[x+1];
      b = data[x+2];

      avg = Math.floor((r+g+b)/3);
      colorSum += avg;
    }
    const brightness = Math.floor(colorSum / (canvas.width*canvas.height));
    return brightness;
  }

  /**
   * config => {
   *    lineWidth: 1,
   *    strokeStyle: 'red',
   *    dimensions: {x:, y:, w:, h:}
   * }
   */
  drawEllipse = (canvas, config = { lineWidth: 1, color: 'red', width: canvas.width, height: canvas.height, x: 0, y: 0 }) => {
    let ctx = canvas.getContext('2d')
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(config.x, config.y, config.width, config.height, 0, 0, 2 * Math.PI);
    ctx.stroke()
  }

  drawFaceBox = (canvas, faceDetection) => {

  }

  onVideoPlay = async () => {
    let video = this.videoRef.current;
    let faceCanvas = this.faceCanvasRef.current;
    if (video == null) return
    let gridCanvas = this.gridCanvasRef.current;
    let cameraCanvas = this.cameraCanvasRef.current;
    // let displaySize = {
    //   width: video.offsetWidth,
    //   height: video.offsetHeight,
    // }
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight }

    // Sets dimensions of canvases to video's
    gridCanvas.width = displaySize.width;
    gridCanvas.height = displaySize.height;
    cameraCanvas.width = displaySize.width;
    cameraCanvas.height = displaySize.height;

    cameraCanvas.getContext('2d').drawImage(video, 0, 0)
    const brightness = this.getBrightness(cameraCanvas);
    if (brightness > 100) {
      this.setState({ hasGoodLighting: true })
    } else {
      if (!this.state.isRecording) this.setState({ hasGoodLighting: false })
    }
    
    try {
      // Draw face grid
      if (!this.state.isFaceAligned) {
        // Guide to align face
        this.drawEllipse(gridCanvas, {
          lineWidth: 5,
          x: gridCanvas.width/2,
          y: gridCanvas.height/2,
          width: gridCanvas.width/4,
          height: gridCanvas.width/4*1.2
        })
      } else {
        // Guide to align mouth
        this.drawEllipse(gridCanvas, {
          lineWidth: 5,
          color: 'red',
          x: gridCanvas.width/2,
          y: gridCanvas.height/2 + gridCanvas.width/7,
          width: gridCanvas.width/7,
          height: gridCanvas.width/7
        })
      }

      const result = await faceapi.detectSingleFace(video, new TinyFaceDetectorOptions({ scoreThreshold: 0.5, inputSize: 256 }))
      if (!this.state.loaded) this.setState({ loaded: true })

      if (result) {
        // Resizes canvas to video
        faceapi.matchDimensions(faceCanvas, displaySize)
        const resizedResults = faceapi.resizeResults(result, displaySize)

        if (!this.state.isFaceAligned) {
          const boxCenterCoordinates = new Point(resizedResults.box.topRight.add(resizedResults.box.bottomLeft).x/2, resizedResults.box.topRight.add(resizedResults.box.bottomLeft).y/2)
          const canvasCenterCoordinates = new Point(displaySize.width/2, displaySize.height/2);
          const distanceFromCenter = canvasCenterCoordinates.sub(boxCenterCoordinates).abs().magnitude()
          // Check if bounding face box is within a certain distance from canvas center
          if (distanceFromCenter < 50) {this.setState({ isFaceAligned: true })}
        }
        // draw the detection onto canvas
        faceapi.draw.drawDetections(faceCanvas, resizedResults)
        // faceapi.draw.drawFaceLandmarks(faceCanvas, result)
      }
      setTimeout(() => this.onVideoPlay())
    } catch (error) {
      console.log('error', error)
    }
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
        <div style={{ transform: 'rotateY(180deg)', display: 'flex', justifyContent: 'center' }}>
          <video playsInline autoPlay ref={this.videoRef} onPlay={this.onVideoPlay} style={{ width: '100%' }}></video>

          {/* Canvas to draw face detection boxes/landmarks */}
          <canvas
            ref={this.faceCanvasRef}
            style={{ position: 'absolute', left: '0'}}/>

          {/* Canvas to draw facial grid guides */}
          <canvas
            ref={this.gridCanvasRef}
            style={{ position: 'absolute', left: '0'}}/>

          {/* Canvas to copy video stream for brightness check */}
          <canvas
            ref={this.cameraCanvasRef}
            style={{ width: '100%', height:'100%', left: '0', opacity: '0', position: 'absolute' }} />

        </div>
        <button
          className={!isFaceAligned ? 'record record-disabled' : (isRecording ? 'record record-stop' : 'record record-start')}
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
          loaded && !isFaceAligned && !hasGoodLighting && (
            <div className=" hover-top alert alert-warning" role="alert">
              Please ensure there is good lighting
            </div>
          )
        }
        {
          loaded && !isFaceAligned && hasGoodLighting && (
            <div className=" hover-top alert alert-warning" role="alert">
              Please align your face to the grid
            </div>
          )
        }
        {
          loaded && isFaceAligned && (
            <div className="hover-top alert alert-success" role="alert">
              You may now record! Align your mouth to the grid when consuming the medicine
            </div>
          )
        }
        {/* <button onClick={this.stopRecording}>Stop Recording</button> */}
      </div>
    )
  }
}

export default VideoRecorder;
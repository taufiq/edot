import React, { Component } from 'react';

export default class UploadingScreen extends Component {
  render() {
    const { hasUploaded } = this.props;
    return (
      <div>
        {
        !hasUploaded
          ? <h1>Uploading..</h1>
          : <h1>Uploaded!</h1>
        }
      </div>
    )
  }
}
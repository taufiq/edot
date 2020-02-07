import React, { Component } from 'react';
import { ReactComponent as DoneHero } from '../svg/done-person.svg';
import { ReactComponent as WhiteBackground } from '../svg/landing-background-white.svg';

export default class UploadingScreen extends Component {
  render() {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center h-100">
        <div
          className="position-absolute background"
          style={{ backgroundColor: '#B83532'  }}> <WhiteBackground /> </div>
        <DoneHero />
        <h4 className="mt-3" style={{ color: 'white' }}>John Choo</h4>
        <p className="text-center" style={{ color: 'white' }}>See you tomorrow!</p>
      </div>
    )
  }
}
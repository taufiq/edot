import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LandingHero } from '../svg/landing-person.svg';
import { ReactComponent as BlackBackground } from '../svg/landing-background.svg';
import { ReactComponent as WhiteBackground } from '../svg/landing-background-white.svg';
import { ReactComponent as NotifyHero } from '../svg/landing-notify.svg';

export default class LandingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasSideEffects: false,
      showingNotifyScreen: false, 
      showingInstructions: false,
    }
  }

  toggleSideEffectsCheck = (event) => {
    this.setState({ hasSideEffects: event.target.checked });
  }

  showNotifyScreen = () => {
    this.setState({ showingNotifyScreen: true })
  }

  render() {
    const { hasSideEffects, showingNotifyScreen, showingInstructions } = this.state;
    let buttonText;
    if (hasSideEffects) {
      buttonText = 'Confirm?'
    } else if (showingInstructions) {
      buttonText = (<Link to="/record" style={{ color: '#fff' }}>
                      Next
                    </Link>)
    } else {
      buttonText = 'Take my pill'
    }
    return (
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <div
          className="position-absolute background"
          style={{ backgroundColor: showingNotifyScreen && '#85A458'  }}>
            { showingNotifyScreen
              ? <WhiteBackground />
              : <BlackBackground />
            }
          </div>
        <p className="position-absolute pt-3 pr-1 font-weight-bold" style={{ top: '0', right: '0', color: showingNotifyScreen && '#fff' }}>9/10 days left</p>
        { showingNotifyScreen
            ? <NotifyScreen/>
            : (
              <>
                { !showingInstructions && <SideEffectsCard
                  onCheck={this.toggleSideEffectsCheck}
                checked={hasSideEffects} /> }
                { showingInstructions && <InstructionsCard /> }
                <button
                  type="button"
                  className={`w-75 rounded-pill mt-3 py-3 ${ hasSideEffects ? 'bg-confirm' : '' }`}
                  onClick={hasSideEffects ? this.showNotifyScreen : showingInstructions ? null : () => this.setState({ showingInstructions: true })}
                  >
                    {buttonText}
                </button>
              </>
            )
        }
      </div>
    );
  }
}

const SideEffectsCard = ({ onCheck, checked }) => (
  <>
    <LandingHero />
    <h4>John Choo</h4>
    {/* <p>S8888888A</p> */}
    <div className="card w-75">
      <div className="card-body px-5">
        <form>
          <p className="text-center">Have you experienced any side effects?</p>
          <div className="form-check text-center">
            <input
              type="checkbox"
              className="form-check-input"
              id="sideEffects"
              checked={checked}
              onChange={onCheck}/>
            <label className="form-check-label" htmlFor="sideEffects">Yes</label>
          </div>
        </form>
      </div>
    </div>
  </>
);

const InstructionsCard = () => {
  const instructions = ['Show your pills', 'Match your mouth to the circle', 'Open your mouth', 'Swallow the pill', 'Say Hello and stick your tongue out']  
  const instructionsText = instructions.map((instruction, idx) => (
    <p className='mb-3' key={instruction}>{++idx}. {instruction}</p>
  ))
  return (
    <>
      <div className="card w-75">
        <div className="card-body" style={{ padding: '10%' }}>
          <form>
            <h5 className="pb-4">Instructions:</h5>
            {instructionsText}
          </form>
        </div>
      </div>
    </>
  )
}

const NotifyScreen = () => {
  return (
    <div className="d-flex flex-column align-items-center">
      <NotifyHero />
      <h4 className="mt-3" style={{ color: 'white' }}>John Choo</h4>
      <p className="text-center" style={{ color: 'white' }}>We notified the nurse. <br />Please wait for the call.</p>
    </div>
  )
}
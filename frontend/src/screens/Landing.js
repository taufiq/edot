import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../svg/landing-person.svg';
import { ReactComponent as Background } from '../svg/landing-background.svg';

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
        <div className="position-absolute background"><Background /></div>
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
    <Logo />
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
    <p>John Choo</p>
  )
}
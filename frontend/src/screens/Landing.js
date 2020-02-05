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
    }
  }

  toggleSideEffectsCheck = (event) => {
    this.setState({ hasSideEffects: event.target.checked });
  }

  showNotifyScreen = () => {
    this.setState({ showingNotifyScreen: true })
  }

  render() {
    const { hasSideEffects, showingNotifyScreen } = this.state;
    return (
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <div className="position-absolute background"><Background /></div>
        { showingNotifyScreen
            ? <NotifyScreen/>
            : (
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
                          checked={hasSideEffects}
                          onChange={this.toggleSideEffectsCheck}/>
                        <label className="form-check-label" htmlFor="sideEffects">Yes</label>
                      </div>
                    </form>
                  </div>
                </div>
                <button
                  type="button"
                  className={`w-75 rounded-pill mt-3 py-3 ${ hasSideEffects ? 'bg-confirm' : '' }`}
                  onClick={hasSideEffects ? this.showNotifyScreen : null}
                  >
                    { hasSideEffects
                      ? 'Confirm?'
                      : <Link to="/record" style={{ color: '#fff' }}>
                          Take my pill
                        </Link>
                    }
                </button>
              </>
            )
        }
      </div>
    );
  }
}

const NotifyScreen = () => {
  return (
    <p>John Choo</p>
  )
}
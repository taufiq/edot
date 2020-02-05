import React from 'react';
import PropTypes from 'prop-types'

/**
 * 
 * @param {String} icon - fontawesome icon (i.e `far fa-lightbulb`, etc.)
 * @param {String} header 
 * @param {String} type - `success`, `failure`, `primary`, `warning`
 * @param {String} message 
 */
const ToastBox = ({ icon, header, type, message}) => {
  const typeColor = {
    success: '#71B112',
    failure: '#FF4E4A',
    primary: '#4D8DFF',
    warning: '#FEB616',
  }

  return (
    <div className="container-fluid d-flex justify-content-center fixed-top mt-3">
      <div className="card w-75 p-3 shadow" style={{ backgroundColor: typeColor[type] }}>
        <div className="d-flex">
          {icon && <i className={`${icon} fa-lg px-3`} style={{ alignSelf: 'center', color: '#fff' }}></i> }
          {header && <h5 className="px-3 m-0" style={{ alignSelf: 'center', color: '#fff' }}>{ header }</h5>}
          <p className="m-0 p-2" style={{ alignSelf: 'center', color: '#fff' }}>{ message }</p>
        </div>
      </div>
    </div>
  )
}

ToastBox.propTypes = {
  icon: PropTypes.string,
  header: PropTypes.string,
  type: PropTypes.oneOf(['success', 'failure', 'primary', 'warning']),
  message: PropTypes.string,
}

ToastBox.defaultProps = {
  type: 'primary'
}

export default ToastBox;
/* eslint no-console:0 */

import React from 'react';
import Trigger from '../src';
import '../assets/index.less';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

const popupBorderStyle = {
  border: '1px solid red',
  padding: 10,
  background: 'rgba(255, 0, 0, 0.1)',
};

function saveRef(name, component) {
  this[name] = component;
}

class Test extends React.Component {
  constructor(props) {
    super(props);

    this.saveContainerRef = saveRef.bind(this, 'containerInstance');
  }

  render() {
    return (
      <div style={{ margin: 200 }}>
        <div>
          <Trigger
            popupPlacement="right"
            action={['hover']}
            builtinPlacements={builtinPlacements}
            popup={
              <div style={popupBorderStyle}>
                i am a hover popup on disabled element
              </div>
            }
          >
            <button type="button" disabled>
              Click Me
            </button>
          </Trigger>
        </div>
      </div>
    );
  }
}

export default Test;

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
    const innerTrigger = (
      <div style={popupBorderStyle}>
        <div ref={this.saveContainerRef} />
        <Trigger
          popupPlacement="bottom"
          action={['click']}
          builtinPlacements={builtinPlacements}
          getPopupContainer={() => this.containerInstance}
          popup={<div style={popupBorderStyle}>I am inner Trigger Popup</div>}
        >
          <span href="#" style={{ margin: 20 }}>
            clickToShowInnerTrigger
          </span>
        </Trigger>
      </div>
    );
    return (
      <div style={{ margin: 200 }}>
        <div>
          <Trigger
            popupPlacement="left"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={<div style={popupBorderStyle}>i am a click popup</div>}
          >
            <span>
              <Trigger
                popupPlacement="bottom"
                action={['hover']}
                builtinPlacements={builtinPlacements}
                popup={<div style={popupBorderStyle}>i am a hover popup</div>}
              >
                <span href="#" style={{ margin: 20 }}>
                  trigger
                </span>
              </Trigger>
            </span>
          </Trigger>
        </div>
        <div style={{ margin: 50 }}>
          <Trigger
            popupPlacement="right"
            action={['hover']}
            builtinPlacements={builtinPlacements}
            popup={innerTrigger}
          >
            <span href="#" style={{ margin: 20 }}>
              trigger
            </span>
          </Trigger>
        </div>
      </div>
    );
  }
}

export default Test;

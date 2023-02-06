/* eslint no-console:0 */

import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

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

class Test extends React.Component {
  render() {
    return (
      <div style={{ margin: 200 }}>
        <div>
          <Trigger
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={
              // Level 2
              <Trigger
                popupPlacement="right"
                action={['click']}
                builtinPlacements={builtinPlacements}
                popup={<div style={popupBorderStyle}>i am a click popup</div>}
              >
                <div style={popupBorderStyle}>
                  i am a click popup{' '}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    I am preventPop
                  </button>
                </div>
              </Trigger>
            }
          >
            <span>Click Me</span>
          </Trigger>
        </div>
      </div>
    );
  }
}

export default Test;

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

class Test extends React.Component {
  render() {
    return (
      <div style={{ margin: 200 }}>
        <div onMouseDown={e => e.stopPropagation()}>
          <Trigger
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={
              <div>popup content</div>
            }
            //effect on react 17
            triggerEventListenerOption={{
              capture: true
            }}
          >
            <span>Click Me1</span>
          </Trigger>
        </div>
        <div onMouseDown={e => e.stopPropagation()}>
          <Trigger
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={
              <div>popup content2 </div>
            }
          >
            <span>Click Me2</span>
          </Trigger>
        </div>
      </div>
    );
  }
}

export default Test;

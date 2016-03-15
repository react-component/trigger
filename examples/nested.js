/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';

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

const Test = React.createClass({
  render() {
    return (
      <div>
        <Trigger
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={<div style={{ border: '1px solid red', padding: 10 }}>i am a click popup</div>}
        >
          <Trigger
            popupPlacement="bottom"
            action={['hover']}
            builtinPlacements={builtinPlacements}
            popup={<div style={{ border: '1px solid red', padding: 10 }}>i am a hover popup</div>}
          >
            <span href="#" style={{ margin: 20 }}>trigger</span>
          </Trigger>
        </Trigger>
      </div>
    );
  },
});

ReactDOM.render(<div style={{ margin: 200 }}>
  <Test />
</div>, document.getElementById('__react-content'));

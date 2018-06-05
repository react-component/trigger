/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';
import './point.less';

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl'],
  },
};

const innerTrigger = (
  <div
    style={{ padding: 20, background: 'rgba(0, 255, 0, 0.3)' }}
  >
    This is popup
  </div>
);

class Test extends React.Component {
  state = {
    action: 'click',
    mouseEnterDelay: 0,
  }

  onActionChange = ({ target: { value } }) => {
    this.setState({ action: value });
  }

  onDelayChange = ({ target: { value } }) => {
    this.setState({ mouseEnterDelay: Number(value) || 0 });
  }

  render() {
    const { action, mouseEnterDelay } = this.state;

    return (
      <div>
        <label>
          Trigger type:
          {' '}
          <select value={action} onChange={this.onActionChange}>
            <option>click</option>
            <option>hover</option>
            <option>contextMenu</option>
          </select>
        </label>

        {' '}

        {action === 'hover' && <label>
          Mouse enter delay:
          {' '}
          <input type="text" value={mouseEnterDelay} onChange={this.onDelayChange} />
        </label>}

        <div style={{ margin: 50 }}>
          <Trigger
            popupPlacement="topLeft"
            action={[action]}
            popupAlign={{
              overflow: {
                adjustX: 1,
                adjustY: 1,
              },
            }}
            mouseEnterDelay={mouseEnterDelay}
            popupClassName="point-popup"
            builtinPlacements={builtinPlacements}
            popup={innerTrigger}
            alignPoint
          >
            <div
              style={{
                border: '1px solid red',
                padding: '100px 0',
                textAlign: 'center',
              }}
            >
              Interactive region
            </div>
          </Trigger>
        </div>
      </div>
    );
  }
}


ReactDOM.render(<Test />, document.getElementById('__react-content'));

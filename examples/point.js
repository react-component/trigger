/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';

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
  render() {
    return (
      <div>
        <div style={{ margin: 50 }}>
          <Trigger
            popupPlacement="topLeft"
            action={['click']}
            popupAlign={{
              overflow: {
                adjustX: 1,
                adjustY: 1,
              },
            }}
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

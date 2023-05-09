/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
};

const popupPlacement = 'top';

export default () => {
  const [scale, setScale] = React.useState('1');

  return (
    <React.StrictMode>
      <div>
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
          }}
        >
          <input
            type="number"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
          />
        </div>

        <div
          style={{
            height: 500,
            width: 500,
            boxSizing: 'border-box',
            background: 'rgba(255,0,0,0.1)',
            border: '50px solid rgba(0,0,255,0.1)',
            overflow: 'clip',
            overflowClipMargin: 50,
            // overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Trigger
            arrow
            action="click"
            popupVisible
            popup={
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: 100,
                  height: 100,
                  opacity: 0.9,
                  boxSizing: 'border-box',
                }}
              >
                Popup
              </div>
            }
            getPopupContainer={(n) => n.parentNode as any}
            popupStyle={{ boxShadow: '0 0 5px red' }}
            popupPlacement={popupPlacement}
            builtinPlacements={builtinPlacements}
            stretch="minWidth"
          >
            <span
              style={{
                background: 'green',
                color: '#FFF',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                position: 'absolute',
                left: 0,
                top: 80,
              }}
            >
              Target
            </span>
          </Trigger>
        </div>
      </div>

      {/* <div style={{ height: '100vh' }} /> */}
    </React.StrictMode>
  );
};

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
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(100vh - 100px - 90px - 50px)`,
          boxShadow: '0 0 1px blue',
          overflow: 'hidden',
          width: 500,
          height: 1000,
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
              top: 90,
            }}
          >
            Target
          </span>
        </Trigger>
      </div>
    </React.StrictMode>
  );
};

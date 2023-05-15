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
      <p>`visible` should not show in hidden region if still scrollable</p>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(100vh - 100px - 90px - 50px)`,
          transform: 'translateX(-50%)',
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
                width: 300,
                height: 100,
                opacity: 0.9,
                boxSizing: 'border-box',
              }}
            >
              Should Always place bottom
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
              left: '50%',
              top: 90,
              transform: 'translateX(-50%)',
            }}
          >
            Target
          </span>
        </Trigger>
      </div>
    </React.StrictMode>
  );
};

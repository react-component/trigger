/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';
import { builtinPlacements } from './inside';

export default () => {
  return (
    <React.StrictMode>
      <div
        style={{
          background: 'rgba(0, 0, 255, 0.1)',
          margin: `64px`,
          height: 200,
          overflow: 'auto',
          // Must have for test
          position: 'static',
        }}
      >
        <Trigger
          arrow
          popup={
            <div
              style={{
                background: 'yellow',
                border: '1px solid blue',
                width: 200,
                height: 60,
                opacity: 0.9,
              }}
            >
              Popup
            </div>
          }
          popupStyle={{ boxShadow: '0 0 5px red' }}
          popupVisible
          builtinPlacements={builtinPlacements}
          popupPlacement="top"
          stretch="minWidth"
          getPopupContainer={(e) => e.parentElement!}
        >
          <span
            style={{
              background: 'green',
              color: '#FFF',
              paddingBlock: 30,
              paddingInline: 70,
              opacity: 0.9,
              transform: 'scale(0.6)',
              display: 'inline-block',
            }}
          >
            Target
          </span>
        </Trigger>
        {new Array(20).fill(null).map((_, index) => (
          <h1 key={index} style={{ width: '200vw' }}>
            Placeholder Line {index}
          </h1>
        ))}
      </div>
    </React.StrictMode>
  );
};

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

const NestPopup = ({ open, setOpen }) => {
  return (
    <Trigger
      popupPlacement="right"
      action={['click']}
      builtinPlacements={builtinPlacements}
      popup={<div style={popupBorderStyle}>i am a click popup</div>}
      popupVisible={open}
      onPopupVisibleChange={setOpen}
    >
      <div style={popupBorderStyle}>
        i am a click popup{' '}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          I am preventPop
        </button>
      </div>
    </Trigger>
  );
};

NestPopup.displayName = '🐞 NestPopup';

const Test = () => {
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  return (
    <div style={{ margin: 200 }}>
      <div>
        <Trigger
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popupVisible={open1}
          onPopupVisibleChange={setOpen1}
          popup={
            // Level 2
            <NestPopup open={open2} setOpen={setOpen2} />
          }
          fresh
        >
          <span>Click Me</span>
        </Trigger>
      </div>
    </div>
  );
};

export default Test;

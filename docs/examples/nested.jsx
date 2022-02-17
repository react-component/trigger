/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
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
};

const OuterContent = ({ getContainer }) => {
  return ReactDOM.createPortal(
    <div>
      I am outer content
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        Stop Pop
      </button>
    </div>,
    getContainer(),
  );
};

const Test = () => {
  const containerRef = React.useRef();
  const outerDivRef = React.useRef();

  const innerTrigger = (
    <div style={popupBorderStyle}>
      <div ref={containerRef} />
      <Trigger
        popupPlacement="bottom"
        action={['click']}
        builtinPlacements={builtinPlacements}
        getPopupContainer={() => containerRef.current}
        popup={<div style={popupBorderStyle}>I am inner Trigger Popup</div>}
      >
        <span href="#" style={{ margin: 20 }}>
          clickToShowInnerTrigger
        </span>
      </Trigger>
    </div>
  );
  return (
    <div style={{ margin: 200 }}>
      <div>
        <Trigger
          popupPlacement="left"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={
            <div style={popupBorderStyle}>
              i am a click popup
              <OuterContent getContainer={() => outerDivRef.current} />
            </div>
          }
        >
          <span>
            <Trigger
              popupPlacement="bottom"
              action={['hover']}
              builtinPlacements={builtinPlacements}
              popup={<div style={popupBorderStyle}>i am a hover popup</div>}
            >
              <span href="#" style={{ margin: 20 }}>
                trigger
              </span>
            </Trigger>
          </span>
        </Trigger>
      </div>
      <div style={{ margin: 50 }}>
        <Trigger
          popupPlacement="right"
          action={['hover']}
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
        >
          <span href="#" style={{ margin: 20 }}>
            trigger
          </span>
        </Trigger>
      </div>

      <div
        ref={outerDivRef}
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: 200,
          height: 200,
          background: 'red',
        }}
      />
    </div>
  );
};

export default Test;

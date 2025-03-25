/* eslint no-console:0 */

import Trigger from '@rc-component/trigger';
import React from 'react';
import { createPortal } from 'react-dom';
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

const PortalPopup = () =>
  createPortal(
    <div
      style={popupBorderStyle}
      onMouseDown={(e) => {
        console.log('Portal Down', e);
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      i am a portal element
    </div>,
    document.body,
  );

const Test = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      button.addEventListener('mousedown', (e) => {
        console.log('button natives down');
        e.stopPropagation();
        e.preventDefault();
      });
    }
  }, []);

  return (
    <div
      style={{
        padding: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 100,
      }}
    >
      <Trigger
        popupPlacement="right"
        action={['click']}
        builtinPlacements={builtinPlacements}
        popup={
          <div style={popupBorderStyle}>
            i am a click popup
            <PortalPopup />
          </div>
        }
        onOpenChange={(visible) => {
          console.log('visible change:', visible);
        }}
      >
        <button>Click Me</button>
      </Trigger>

      <button
        onMouseDown={(e) => {
          console.log('button down');
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        Stop Pop & Prevent Default
      </button>
      <button ref={buttonRef}>Native Stop Pop & Prevent Default</button>
    </div>
  );
};

export default Test;

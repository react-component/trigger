/* eslint no-console:0 */
import React from 'react';
import '../../assets/index.less';
import Trigger from '../../src';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: 0,
      adjustY: true,
    },
    offset: [0, 0],
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
  },
  leftTop: {
    points: ['tr', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  leftBottom: {
    points: ['br', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
  },
};

const popupPlacement = 'leftBottom';

export default () => {
  const containerRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    containerRef.current.scrollLeft = document.defaultView.innerWidth;
    containerRef.current.scrollTop = document.defaultView.innerHeight;
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 64,
        overflow: `auto`,
        border: '1px solid red',
      }}
      ref={containerRef}
    >
      <div
        style={{
          width: `300vw`,
          height: `300vh`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
          popupVisible
          getPopupContainer={() => containerRef.current}
          popupPlacement={popupPlacement}
          builtinPlacements={builtinPlacements}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'green',
              color: '#FFF',
              paddingBlock: 30,
              paddingInline: 70,
              opacity: 0.9,
              transform: 'scale(0.6)',
            }}
          >
            Target
          </span>
        </Trigger>
      </div>
    </div>
  );
};

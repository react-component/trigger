/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: 'shift' as const,
      adjustY: true,
    },
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      adjustY: 'shift' as const,
    },
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      adjustY: 'shift' as const,
    },
  },
};

export default () => {
  console.log('Demo Render!');

  const [scale, setScale] = React.useState('2');

  const rootRef = React.useRef<HTMLDivElement>();
  const popHolderRef = React.useRef<HTMLDivElement>();
  const scrollRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    scrollRef.current.scrollLeft = 200;
  }, []);

  return (
    <div
      id="demo-root"
      ref={rootRef}
      style={{ background: 'rgba(0, 0, 255, 0.1)', padding: 50 }}
    >
      <input
        type="number"
        value={scale}
        onChange={(e) => setScale(e.target.value)}
      />
      <div
        id="demo-holder"
        ref={popHolderRef}
        style={{
          position: 'relative',
          width: 0,
          height: 0,
          zIndex: 999,
          // Transform
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
      <div
        ref={scrollRef}
        style={{
          border: '1px solid red',
          padding: 10,
          height: '100vh',
          background: '#FFF',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: '200vh',
            paddingTop: `100vh`,
            width: 'calc(200vw)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'start',
          }}
        >
          <Trigger
            action="click"
            popup={
              <div
                style={{
                  background: 'yellow',
                  border: '1px solid blue',
                  width: 200,
                  height: 60,
                }}
              >
                Popup
              </div>
            }
            popupVisible
            getPopupContainer={() => popHolderRef.current}
            popupPlacement="left"
            builtinPlacements={builtinPlacements}
          >
            <span
              style={{
                display: 'inline-block',
                background: 'green',
                color: '#FFF',
                paddingBlock: 30,
                paddingInline: 70,
              }}
            >
              Target
            </span>
          </Trigger>
        </div>
      </div>
    </div>
  );
};

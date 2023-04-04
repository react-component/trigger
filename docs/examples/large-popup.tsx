/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
};

export default () => {
  const containerRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    console.clear();
    containerRef.current.scrollTop = document.defaultView.innerHeight * 0.75;
  }, []);

  return (
    <React.StrictMode>
      <div
        id="demo-root"
        style={{ background: 'rgba(0, 0, 255, 0.1)', padding: 16 }}
      >
        <div
          ref={containerRef}
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
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'start',
            }}
          >
            <Trigger
              arrow
              // forceRender
              action="click"
              popup={
                <div
                  style={{
                    background: 'yellow',
                    border: '1px solid blue',
                    width: 200,
                    height: '75vh',
                    opacity: 0.9,
                  }}
                >
                  Popup 75vh
                </div>
              }
              popupStyle={{ boxShadow: '0 0 5px red' }}
              popupVisible
              popupPlacement="top"
              builtinPlacements={builtinPlacements}
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
          </div>
        </div>
      </div>

      {/* <div style={{ height: '100vh' }} /> */}
    </React.StrictMode>
  );
};

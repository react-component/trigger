/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
    targetOffset: [10, 0],
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
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: 24,
    },
    offset: [10, 0],
  },
};

const popupPlacement = 'top';

export default () => {
  console.log('Demo Render!');

  const [visible, setVisible] = React.useState(false);
  const [scale, setScale] = React.useState('1');
  const [targetVisible, setTargetVisible] = React.useState(true);

  const rootRef = React.useRef<HTMLDivElement>();
  const popHolderRef = React.useRef<HTMLDivElement>();
  const scrollRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    scrollRef.current.scrollLeft = window.innerWidth;
    scrollRef.current.scrollTop = window.innerHeight / 2;
  }, []);

  return (
    <React.StrictMode>
      <div
        id="demo-root"
        ref={rootRef}
        style={{ background: 'rgba(0, 0, 255, 0.1)', padding: 16 }}
      >
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 9999,
          }}
        >
          <input
            type="number"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setTargetVisible((v) => !v);
            }}
          >
            Target Visible: ({String(targetVisible)})
          </button>
          <button
            onClick={() => {
              setVisible(true);
            }}
          >
            Trigger Visible
          </button>
        </div>
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
              width: 'calc(300vw)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'start',
            }}
          >
            <Trigger
              arrow={{ content: 'Arrow' }}
              // forceRender
              action="click"
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
              popupTransitionName="rc-trigger-popup-zoom"
              popupStyle={{ boxShadow: '0 0 5px red' }}
              popupVisible={visible}
              onPopupVisibleChange={(nextVisible) => {
                setVisible(nextVisible);
              }}
              // getPopupContainer={() => popHolderRef.current}
              popupPlacement={popupPlacement}
              builtinPlacements={builtinPlacements}
              stretch="minWidth"
              onPopupAlign={(domNode, align) => {
                console.log('onPopupAlign:', domNode, align);
              }}
            >
              <span
                style={{
                  background: 'green',
                  color: '#FFF',
                  paddingBlock: 30,
                  paddingInline: 70,
                  opacity: 0.9,
                  transform: 'scale(0.6)',
                  display: targetVisible ? 'inline-block' : 'none',
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

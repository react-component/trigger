/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

export default () => {
  console.log('Demo Render!');

  const rootRef = React.useRef<HTMLDivElement>();
  const popHolderRef = React.useRef<HTMLDivElement>();

  return (
    <div
      id="demo-root"
      ref={rootRef}
      style={{ background: 'rgba(0, 0, 255, 0.1)', padding: 50 }}
    >
      <div
        id="demo-holder"
        ref={popHolderRef}
        style={{
          position: 'relative',
          zIndex: 999,
          // Transform
          transform: 'scale(2)',
          transformOrigin: 'top left',
        }}
      />
      <div
        style={{
          border: '1px solid red',
          padding: 10,
          height: '100vh',
          background: '#FFF',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <div style={{ height: '150vh', width: '150vw' }}>
          <Trigger
            action="click"
            popup={
              <div style={{ background: 'yellow', border: '1px solid blue' }}>
                Popup
              </div>
            }
            getPopupContainer={() => popHolderRef.current}
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

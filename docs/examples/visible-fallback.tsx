/* eslint no-console:0 */
import type { AlignType, TriggerRef } from 'rc-trigger';
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements: Record<string, AlignType> = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst',
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst',
  },
};

export default () => {
  const [enoughTop, setEnoughTop] = React.useState(true);

  const triggerRef = React.useRef<TriggerRef>();

  React.useEffect(() => {
    triggerRef.current?.forceAlign();
  }, [enoughTop]);

  return (
    <React.StrictMode>
      <p>`visibleFirst` should not show in hidden region if still scrollable</p>

      <label>
        <input
          type="checkbox"
          checked={enoughTop}
          onChange={() => setEnoughTop((v) => !v)}
        />
        Enough Top (Placement: bottom)
      </label>

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
          ref={triggerRef}
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
          popupPlacement={enoughTop ? 'bottom' : 'top'}
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
              top: enoughTop ? 200 : 90,
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

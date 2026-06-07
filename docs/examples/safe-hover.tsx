import Trigger from '@rc-component/trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    offset: [0, -56],
  },
};

const popupStyle: React.CSSProperties = {
  width: 240,
  padding: 12,
  background: '#fff',
  border: '1px solid #d9d9d9',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
};

const SafeHoverDemo = () => {
  return (
    <div style={{ minHeight: 320, padding: '160px 80px 80px' }}>
      <Trigger
        action={['hover']}
        mouseLeaveDelay={0.12}
        popupPlacement="top"
        builtinPlacements={builtinPlacements}
        popupStyle={popupStyle}
        popup={
          <div>
            <strong>Safe hover popup</strong>
            <div style={{ marginTop: 8 }}>
              Move through the gap to reach me.
            </div>
            <button style={{ marginTop: 12 }} type="button">
              Popup action
            </button>
          </div>
        }
      >
        <button style={{ padding: '8px 16px' }} type="button">
          Hover target
        </button>
      </Trigger>

      <div
        style={{
          width: 240,
          marginTop: 16,
          color: '#666',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        The popup is offset upward, leaving a blank hover gap.
      </div>
    </div>
  );
};

export default SafeHoverDemo;

import Trigger from '@rc-component/trigger';
import React, { useState } from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    offset: [0, -8],
  },
};

const DisabledDemo = () => {
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ padding: 100 }}>
      <Trigger
        action="hover"
        builtinPlacements={builtinPlacements}
        disabled={disabled}
        popup={<span>Tooltip content</span>}
        popupPlacement="top"
        popupStyle={{
          padding: '6px 8px',
          color: '#fff',
          background: '#1f1f1f',
          borderRadius: 4,
        }}
      >
        <button type="button" onClick={() => setDisabled((value) => !value)}>
          {disabled ? 'Enable Tooltip' : 'Disable Tooltip'}
        </button>
      </Trigger>
    </div>
  );
};

export default DisabledDemo;

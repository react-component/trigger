import Trigger, { UniqueProvider } from '@rc-component/trigger';
import React, { useState } from 'react';
import '../../assets/index.less';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    offset: [10, 0],
  },
  top: {
    points: ['bc', 'tc'],
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    offset: [0, 10],
  },
};

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

const MovingPopupDemo = () => {
  const [useUniqueProvider, setUseUniqueProvider] = useState(true);
  
  const content = (
    <div style={{ margin: 100 }}>
      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={useUniqueProvider}
            onChange={(e) => setUseUniqueProvider(e.target.checked)}
          />
          使用 UniqueProvider
        </label>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <Trigger
          action={['hover']}
          popupPlacement="top"
          builtinPlacements={builtinPlacements}
          getPopupContainer={getPopupContainer}
          popupMotion={{
            motionName: 'rc-trigger-popup-zoom',
          }}
          popup={<div>这是左侧按钮的提示信息</div>}
          popupStyle={{
            border: '1px solid #ccc',
            padding: 10,
            background: 'white',
            boxSizing: 'border-box',
          }}
        >
          <button type="button">左侧按钮</button>
        </Trigger>
        
        <Trigger
          action={['hover']}
          popupPlacement="top"
          builtinPlacements={builtinPlacements}
          getPopupContainer={getPopupContainer}
          popupMotion={{
            motionName: 'rc-trigger-popup-zoom',
          }}
          popup={<div>This is the tooltip for the right button</div>}
          popupStyle={{
            border: '1px solid #ccc',
            padding: 10,
            background: 'white',
            boxSizing: 'border-box',
          }}
        >
          <button type="button">Right Button</button>
        </Trigger>
      </div>
    </div>
  );
  
  return useUniqueProvider ? <UniqueProvider>{content}</UniqueProvider> : content;
};

export default MovingPopupDemo;

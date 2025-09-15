import Trigger, { UniqueProvider } from '@rc-component/trigger';
import React, { useState } from 'react';
import '../../assets/index.less';

const LEAVE_DELAY = 0.2;

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

const MovingPopupDemo = () => {
  const [useUniqueProvider, setUseUniqueProvider] = useState(true);
  const [triggerControl, setTriggerControl] = useState('none'); // 'button1', 'button2', 'none'

  const getVisible = (name: string) => {
    if (triggerControl === 'none') {
      return undefined;
    }
    if (triggerControl === name) {
      return true;
    }
    return false;
  };

  const content = (
    <div style={{ margin: 100 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <Trigger
          mouseLeaveDelay={LEAVE_DELAY}
          action={['hover']}
          popupPlacement="top"
          builtinPlacements={builtinPlacements}
          popupVisible={getVisible('button1')}
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
          unique
        >
          <button type="button">左侧按钮</button>
        </Trigger>

        <Trigger
          mouseLeaveDelay={LEAVE_DELAY}
          action={['hover']}
          popupPlacement="top"
          builtinPlacements={builtinPlacements}
          popupVisible={getVisible('button2')}
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
          unique
        >
          <button type="button">Right Button</button>
        </Trigger>
      </div>

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

      <div style={{ marginBottom: 20 }}>
        <div>Trigger 控制:</div>
        <label>
          <input
            type="radio"
            name="triggerControl"
            value="button1"
            checked={triggerControl === 'button1'}
            onChange={(e) => setTriggerControl(e.target.value)}
          />
          Button 1 显示 Trigger
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            name="triggerControl"
            value="button2"
            checked={triggerControl === 'button2'}
            onChange={(e) => setTriggerControl(e.target.value)}
          />
          Button 2 显示 Trigger
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            name="triggerControl"
            value="none"
            checked={triggerControl === 'none'}
            onChange={(e) => setTriggerControl(e.target.value)}
          />
          都不受控 (Hover 控制)
        </label>
      </div>
    </div>
  );

  return useUniqueProvider ? (
    <UniqueProvider>{content}</UniqueProvider>
  ) : (
    content
  );
};

export default MovingPopupDemo;

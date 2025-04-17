/**
 * iframe: true
 */

import React from 'react';
import type { CSSMotionProps } from 'rc-motion';
import type { BuildInPlacements, TriggerProps } from 'rc-trigger';
import Trigger from 'rc-trigger';
import './case.less';

const builtinPlacements: BuildInPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

const Motion: CSSMotionProps = {
  motionName: 'case-motion',
};

const MaskMotion: CSSMotionProps = {
  motionName: 'mask-motion',
};

function useControl<T>(valuePropName: string, defaultValue: T): [T, any] {
  const [value, setValue] = React.useState<T>(defaultValue);

  return [
    value,
    {
      value,
      checked: value,
      onChange({ target }) {
        setValue(target[valuePropName]);
      },
    },
  ];
}

const Demo = () => {
  const renderNode = (params: { placement?: TriggerProps['popupPlacement'] }) => {
    const { placement = 'top' } = params;
    return (
      <Trigger
        popupAlign={{
          offset: [0, 0],
          overflow: {
            adjustX: 1,
            adjustY: 1,
          },
        }}
        arrow={false}
        popupPlacement={placement}
        destroyPopupOnHide={true}
        mask={false}
        maskMotion={MaskMotion}
        maskClosable={false}
        stretch={''}
        builtinPlacements={builtinPlacements}
        forceRender={false}
        popupStyle={{
          border: '1px solid red',
          background: 'white',
          boxSizing: 'border-box',
        }}
        popup={<div>3000</div>}
        popupMotion={null}
        onPopupAlign={() => {
          console.warn('Aligned!');
        }}
      >
        <span
          tabIndex={0}
          role="button"
        >
          T
        </span>
      </Trigger>
    )
  }

  return (
    <React.StrictMode>
      <div>
        {renderNode({ placement: 'top' })}
      </div>
      <div style={{position: 'absolute', bottom: 0, right: 0}}>
        {renderNode({ placement: 'right' })}
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0}}>
        {renderNode({ placement: 'top' })}
      </div>
      <div style={{position: 'absolute', top: 0, right: 0}}>
        {renderNode({ placement: 'left' })}
      </div>
    </React.StrictMode>
  );
};

export default Demo;

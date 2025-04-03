import Trigger from '@rc-component/trigger';
import React from 'react';
import '../../assets/index.less';

const builtinPlacements = {
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

const Test = () => {
  const [open1, setOpen1] = React.useState(false);

  return (
    <div style={{ margin: 200 }}>
      <div>
        <Trigger
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popupVisible={open1}
          onOpenChange={setOpen1}
          popup={
            <div>
              <h2>Hello World</h2>
            </div>
          }
          mobile
        >
          <span>Click Me</span>
        </Trigger>
      </div>
    </div>
  );
};

export default Test;

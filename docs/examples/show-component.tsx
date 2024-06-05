import React from 'react';
import Trigger from '@/index';

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl'],
  },
};

const innerTrigger = (
  <div style={{ padding: 20, background: 'rgba(0, 255, 0, 0.3)' }}>This is popup</div>
);

class Test extends React.Component {
  state = {
    mouseX: 600,
    mouseY: 300,
  };

  onMouseXChange = ({ target: { value } }) => {
    this.setState({ mouseX: Number(value) || 0 });
  };

  onMouseYChange = ({ target: { value } }) => {
    this.setState({ mouseY: Number(value) || 0 });
  };

  show = ()=>{
    this.forceUpdate();
  }

  render() {
    const { mouseX,mouseY } = this.state;

    return (
      <div>
        <label>
          Show Point:{' '}
          <input type="text" value={mouseX} onChange={this.onMouseXChange} />
          <input type="text" value={mouseY} onChange={this.onMouseYChange} />
        </label>
        <label>
          <button onClick={this.show}>show</button>
          </label>
        <Trigger
          popupPlacement="topLeft"
          action={['contextMenu']}
          popupAlign={{
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          }}
          popupClassName="point-popup"
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
          alignPoint
          point={[this.state.mouseX,this.state.mouseY]}
        >
          <div
            style={{
              border: '1px solid red',
              padding: '100px 0',
              textAlign: 'center',
            }}
          >
            Interactive region
          </div>
        </Trigger>
      </div>
  );
  }
}

export default Test;

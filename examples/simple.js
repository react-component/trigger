/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';

function getPopupAlign(state) {
  return {
    offset: [state.offsetX, state.offsetY],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  };
}

export const builtinPlacements = {
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

function preventDefault(e) {
  e.preventDefault();
}

class Test extends React.Component {
  state = {
    mask: false,
    maskClosable: false,
    placement: 'right',
    trigger: {
      hover: 1,
    },
    offsetX: undefined,
    offsetY: undefined,
    stretch: '',
  };

  onPlacementChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  }

  onStretch = (e) => {
    this.setState({
      stretch: e.target.value,
    });
  }

  onTransitionChange = (e) => {
    this.setState({
      transitionName: e.target.checked ? e.target.value : '',
    });
  }

  onTriggerChange = (e) => {
    const trigger = { ...this.state.trigger };
    if (e.target.checked) {
      trigger[e.target.value] = 1;
    } else {
      delete trigger[e.target.value];
    }
    this.setState({
      trigger,
    });
  }

  onOffsetXChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetX: targetValue || undefined,
    });
  }

  onOffsetYChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetY: targetValue || undefined,
    });
  }

  onMask = (e) => {
    this.setState({
      mask: e.target.checked,
    });
  }

  onMaskClosable = (e) => {
    this.setState({
      maskClosable: e.target.checked,
    });
  }

  destroy = () => {
    this.setState({
      destroyed: true,
    });
  }

  destroyPopupOnHide = (e) => {
    this.setState({
      destroyPopupOnHide: e.target.checked,
    });
  }

  render() {
    const state = this.state;
    const trigger = state.trigger;
    if (state.destroyed) {
      return null;
    }
    return (<div >
      <div style={{ margin: '10px 20px' }}>
        <label>
          placement:
          <select value={state.placement} onChange={this.onPlacementChange}>
            <option>right</option>
            <option>left</option>
            <option>top</option>
            <option>bottom</option>
            <option>topLeft</option>
            <option>topRight</option>
            <option>bottomRight</option>
            <option>bottomLeft</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          Stretch:
          <select value={state.stretch} onChange={this.onStretch}>
            <option value="">--NONE--</option>
            <option value="width">width</option>
            <option value="minWidth">minWidth</option>
            <option value="height">height</option>
            <option value="minHeight">minHeight</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            value="rc-trigger-popup-zoom"
            type="checkbox"
            onChange={this.onTransitionChange}
            checked={state.transitionName === 'rc-trigger-popup-zoom'}
          />
          transitionName
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;

        trigger:

        <label>
          <input
            value="hover"
            checked={!!trigger.hover}
            type="checkbox"
            onChange={this.onTriggerChange}
          />
          hover
        </label>
        <label>
          <input
            value="focus"
            checked={!!trigger.focus}
            type="checkbox"
            onChange={this.onTriggerChange}
          />
          focus
        </label>
        <label>
          <input
            value="click"
            checked={!!trigger.click}
            type="checkbox"
            onChange={this.onTriggerChange}
          />
          click
        </label>
        <label>
          <input
            value="contextMenu"
            checked={!!trigger.contextMenu}
            type="checkbox"
            onChange={this.onTriggerChange}
          />
          contextMenu
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.destroyPopupOnHide}
            type="checkbox"
            onChange={this.destroyPopupOnHide}
          />
          destroyPopupOnHide
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.mask}
            type="checkbox"
            onChange={this.onMask}
          />
          mask
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!this.state.maskClosable}
            type="checkbox"
            onChange={this.onMaskClosable}
          />
          maskClosable
        </label>

        <br />
        <label>
          offsetX:
          <input
            type="text"
            onChange={this.onOffsetXChange}
            style={{ width: 50 }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input
            type="text"
            onChange={this.onOffsetYChange}
            style={{ width: 50 }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={this.destroy}>destroy</button>
      </div>
      <div style={{ margin: 120, position: 'relative' }}>
        <Trigger
          popupAlign={getPopupAlign(state)}
          popupPlacement={state.placement}
          destroyPopupOnHide={this.state.destroyPopupOnHide}
          // zIndex={40}
          mask={this.state.mask}
          maskClosable={this.state.maskClosable}
          stretch={this.state.stretch}
          // maskAnimation="fade"
          // mouseEnterDelay={0.1}
          // mouseLeaveDelay={0.1}
          action={Object.keys(state.trigger)}
          builtinPlacements={builtinPlacements}
          popupStyle={{
            border: '1px solid red',
            padding: 10,
            background: 'white',
            boxSizing: 'border-box',
          }}
          popup={
            <div>
              i am a popup
            </div>
          }
          popupTransitionName={state.transitionName}
        >
          <a
            style={{ margin: 20, display: 'inline-block', background: `rgba(255, 0, 0, 0.05)` }}
            href="#"
            onClick={preventDefault}
          >
            <p>This is a example of trigger usage.</p>
            <p>You can adjust the value above</p>
            <p>which will also change the behaviour of popup.</p>
          </a>
        </Trigger>
      </div>
    </div>);
  }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));

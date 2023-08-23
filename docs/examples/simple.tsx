/* eslint no-console:0 */

import Trigger from 'rc-trigger';
import React from 'react';
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
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -10],
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -10],
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 10],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 10],
  },
};

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

const InnerTarget = (props) => (
  <div
    style={{
      margin: 20,
      display: 'inline-block',
      background: 'rgba(255, 0, 0, 0.05)',
    }}
    tabIndex={0}
    role="button"
    {...props}
  >
    <p>This is a example of trigger usage.</p>
    <p>You can adjust the value above</p>
    <p>which will also change the behaviour of popup.</p>
  </div>
);

const RefTarget = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({}));

  return <InnerTarget {...props} />;
});

interface TestState {
  mask: boolean;
  maskClosable: boolean;
  placement: string;
  trigger: {
    click?: boolean;
    focus?: boolean;
    hover?: boolean;
    contextMenu?: boolean;
  };
  offsetX: number;
  offsetY: number;
  stretch: string;
  transitionName: string;
  destroyed?: boolean;
  destroyPopupOnHide?: boolean;
  autoDestroy?: boolean;
  mobile?: boolean;
}

class Test extends React.Component<any, TestState> {
  state: TestState = {
    mask: true,
    maskClosable: true,
    placement: 'bottom',
    trigger: {
      click: true,
    },
    offsetX: undefined,
    offsetY: undefined,
    stretch: 'minWidth',
    transitionName: 'rc-trigger-popup-zoom',
  };

  onPlacementChange = (e) => {
    this.setState({
      placement: e.target.value,
    });
  };

  onStretch = (e) => {
    this.setState({
      stretch: e.target.value,
    });
  };

  onTransitionChange = (e) => {
    this.setState({
      transitionName: e.target.checked ? e.target.value : '',
    });
  };

  onTriggerChange = ({ target: { checked, value } }) => {
    this.setState(({ trigger }) => {
      const clone = { ...trigger };

      if (checked) {
        clone[value] = 1;
      } else {
        delete clone[value];
      }

      return {
        trigger: clone,
      };
    });
  };

  onOffsetXChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetX: targetValue || undefined,
    });
  };

  onOffsetYChange = (e) => {
    const targetValue = e.target.value;
    this.setState({
      offsetY: targetValue || undefined,
    });
  };

  onVisibleChange = (visible) => {
    console.log('tooltip', visible);
  };

  onMask = (e) => {
    this.setState({
      mask: e.target.checked,
    });
  };

  onMaskClosable = (e) => {
    this.setState({
      maskClosable: e.target.checked,
    });
  };

  getPopupAlign = () => {
    const { offsetX, offsetY } = this.state;
    return {
      offset: [offsetX, offsetY],
      overflow: {
        adjustX: 1,
        adjustY: 1,
      },
    };
  };

  destroy = () => {
    this.setState({
      destroyed: true,
    });
  };

  destroyPopupOnHide = (e) => {
    this.setState({
      destroyPopupOnHide: e.target.checked,
    });
  };

  autoDestroy = (e) => {
    this.setState({
      autoDestroy: e.target.checked,
    });
  };

  render() {
    const { state } = this;
    const { trigger } = state;
    if (state.destroyed) {
      return null;
    }
    return (
      <div>
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
          &nbsp;&nbsp;&nbsp;&nbsp; trigger:
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
              checked={!!this.state.autoDestroy}
              type="checkbox"
              onChange={this.autoDestroy}
            />
            autoDestroy
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
          &nbsp;&nbsp;&nbsp;&nbsp;
          <label>
            <input
              checked={!!this.state.mobile}
              type="checkbox"
              onChange={() => {
                this.setState(({ mobile }) => ({
                  mobile: !mobile,
                }));
              }}
            />
            mobile
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
          <button type="button" onClick={this.destroy}>
            destroy
          </button>
        </div>
        <div style={{ margin: 120, position: 'relative' }}>
          <Trigger
            getPopupContainer={getPopupContainer}
            popupAlign={this.getPopupAlign()}
            popupPlacement={state.placement}
            destroyPopupOnHide={this.state.destroyPopupOnHide}
            autoDestroy={this.state.autoDestroy}
            // zIndex={40}
            mask={this.state.mask}
            maskClosable={this.state.maskClosable}
            stretch={this.state.stretch}
            maskAnimation="fade"
            // mouseEnterDelay={0.1}
            // mouseLeaveDelay={0.1}
            action={Object.keys(state.trigger)}
            builtinPlacements={builtinPlacements}
            arrow
            popupStyle={{
              border: '1px solid red',
              padding: 10,
              background: 'white',
              boxSizing: 'border-box',
            }}
            popup={<div>i am a popup</div>}
            popupTransitionName={state.transitionName}
            mobile={
              state.mobile
                ? {
                    popupMotion: {
                      motionName: 'rc-trigger-popup-mobile-fade',
                    },
                    popupClassName: 'rc-trigger-popup-mobile',
                    popupStyle: {
                      padding: 16,
                      borderTop: '1px solid red',
                      background: '#FFF',
                      textAlign: 'center',
                    },
                    popupRender: (node) => (
                      <>
                        <div>
                          <input
                            style={{ width: '100%' }}
                            placeholder="additional content"
                          />
                        </div>
                        {node}
                      </>
                    ),
                  }
                : null
            }
          >
            <RefTarget />
          </Trigger>
        </div>
      </div>
    );
  }
}

export default Test;

import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {createChainedFunction, Dom} from 'rc-util';
import Popup from './Popup';

function noop() {
}

function returnEmptyString() {
  return '';
}

const Trigger = React.createClass({
  propTypes: {
    action: PropTypes.any,
    getPopupClassNameFromAlign: PropTypes.any,
    onPopupVisibleChange: PropTypes.func,
    afterPopupVisibleChange: PropTypes.func,
    popup: PropTypes.node.isRequired,
    popupStyle: PropTypes.object,
    popupClassName: PropTypes.string,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    getPopupContainer: PropTypes.func,
    destroyPopupOnHide: PropTypes.bool,
    popupAlign: PropTypes.object,
    popupVisible: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      onPopupVisibleChange: noop,
      afterPopupVisibleChange: noop,
      popupClassName: '',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0.1,
      popupStyle: {},
      destroyPopupOnHide: false,
      popupAlign: {},
      defaultPopupVisible: false,
      action: [],
    };
  },

  getInitialState() {
    const props = this.props;
    let popupVisible;
    if ('popupVisible' in props) {
      popupVisible = props.popupVisible;
    } else {
      popupVisible = props.defaultPopupVisible;
    }
    return {popupVisible};
  },

  componentDidMount() {
    this.componentDidUpdate({}, {
      popupVisible: false,
    });
  },

  componentWillReceiveProps(nextProps) {
    if ('popupVisible' in nextProps) {
      this.setState({
        popupVisible: !!nextProps.popupVisible,
      });
    }
  },

  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const state = this.state;
    if (prevState.popupVisible !== state.popupVisible) {
      const self = this;
      ReactDOM.unstable_renderSubtreeIntoContainer(this, this.getPopupElement(), this.getPopupContainer(), function renderPopup() {
        if (this.isMounted()) {
          self.popupDomNode = ReactDOM.findDOMNode(this);
        } else {
          self.popupDomNode = null;
        }
        props.afterPopupVisibleChange(state.popupVisible);
      });
      if (props.action.indexOf('click') !== -1) {
        if (state.popupVisible) {
          if (!this.clickOutsideHandler) {
            this.clickOutsideHandler = Dom.addEventListener(document, 'mousedown', this.onDocumentClick);
            this.touchOutsideHandler = Dom.addEventListener(document, 'touchstart', this.onDocumentClick);
          }
          return;
        }
      }
      if (this.clickOutsideHandler) {
        this.clickOutsideHandler.remove();
        this.touchOutsideHandler.remove();
        this.clickOutsideHandler = null;
        this.touchOutsideHandler = null;
      }
    }
  },

  componentWillUnmount() {
    const popupContainer = this.popupContainer;
    if (popupContainer) {
      ReactDOM.unmountComponentAtNode(popupContainer);
      if (this.props.getPopupContainer) {
        const mountNode = this.props.getPopupContainer();
        mountNode.removeChild(popupContainer);
      } else {
        document.body.removeChild(popupContainer);
      }
      this.popupContainer = null;
    }
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (this.clickOutsideHandler) {
      this.clickOutsideHandler.remove();
      this.touchOutsideHandler.remove();
      this.clickOutsideHandler = null;
      this.touchOutsideHandler = null;
    }
  },

  onMouseEnter() {
    this.delaySetPopupVisible(true, this.props.mouseEnterDelay);
  },

  onMouseLeave() {
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
  },

  onFocus() {
    this.focusTime = Date.now();
    this.setPopupVisible(true);
  },

  onMouseDown() {
    this.preClickTime = Date.now();
  },

  onTouchStart() {
    this.preTouchTime = Date.now();
  },

  onBlur() {
    this.setPopupVisible(false);
  },

  onClick(event) {
    // focus will trigger click
    if (this.focusTime) {
      let preTime;
      if (this.preClickTime && this.preTouchTime) {
        preTime = Math.min(this.preClickTime, this.preTouchTime);
      } else if (this.preClickTime) {
        preTime = this.preClickTime;
      } else if (this.preTouchTime) {
        preTime = this.preTouchTime;
      }
      if (Math.abs(preTime - this.focusTime) < 20) {
        return;
      }
      this.focusTime = 0;
    }
    this.preClickTime = 0;
    this.preTouchTime = 0;
    event.preventDefault();
    this.setPopupVisible(!this.state.popupVisible);
  },

  onAnimateLeave() {
    if (this.props.destroyPopupOnHide) {
      ReactDOM.unmountComponentAtNode(this.getPopupContainer());
      this.popupDomNode = null;
    }
  },

  onDocumentClick(event) {
    const target = event.target;
    const root = ReactDOM.findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!Dom.contains(root, target) && !Dom.contains(popupNode, target)) {
      this.setPopupVisible(false);
    }
  },

  getPopupDomNode() {
    // for test
    return this.popupDomNode;
  },

  getPopupContainer() {
    if (!this.popupContainer) {
      this.popupContainer = document.createElement('div');
      if (this.props.getPopupContainer) {
        const mountNode = this.props.getPopupContainer();
        mountNode.appendChild(this.popupContainer);
      } else {
        document.body.appendChild(this.popupContainer);
      }
    }
    return this.popupContainer;
  },

  getPopupElement() {
    if (!this.popupRendered) {
      return null;
    }
    const props = this.props;
    const state = this.state;
    const mouseProps = {};
    if (props.action.indexOf('hover') !== -1) {
      mouseProps.onMouseEnter = this.onMouseEnter;
      mouseProps.onMouseLeave = this.onMouseLeave;
    }
    return (<Popup prefixCls={props.prefixCls}
                   visible={state.popupVisible}
                   className={props.popupClassName}
                   action={props.action}
                   align={props.popupAlign}
                   animation={props.popupAnimation}
                   onAnimateLeave={this.onAnimateLeave}
                   getClassNameFromAlign={props.getPopupClassNameFromAlign}
      {...mouseProps}
                   wrap={this}
                   style={props.popupStyle}
                   transitionName={props.popupTransitionName}>
      {props.popup}
    </Popup>);
  },

  setPopupVisible(popupVisible) {
    if (this.state.popupVisible !== popupVisible) {
      if (!('popupVisible' in this.props)) {
        this.setState({
          popupVisible,
        });
      }
      this.props.onPopupVisibleChange(popupVisible);
    }
  },

  delaySetPopupVisible(visible, delayS) {
    const delay = delayS * 1000;
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (delay) {
      this.delayTimer = setTimeout(() => {
        this.setPopupVisible(visible);
        this.delayTimer = null;
      }, delay);
    } else {
      this.setPopupVisible(visible);
    }
  },

  render() {
    if (this.state.popupVisible) {
      this.popupRendered = true;
    }
    const props = this.props;
    const children = props.children;
    const child = React.Children.only(children);
    const childProps = child.props || {};
    const newChildProps = {};
    const trigger = props.action;
    if (trigger.indexOf('click') !== -1) {
      newChildProps.onClick = createChainedFunction(this.onClick, childProps.onClick);
      newChildProps.onMouseDown = createChainedFunction(this.onMouseDown, childProps.onMouseDown);
      newChildProps.onTouchStart = createChainedFunction(this.onTouchStart, childProps.onTouchStart);
    }
    if (trigger.indexOf('hover') !== -1) {
      newChildProps.onMouseEnter = createChainedFunction(this.onMouseEnter, childProps.onMouseEnter);
      newChildProps.onMouseLeave = createChainedFunction(this.onMouseLeave, childProps.onMouseLeave);
    }
    if (trigger.indexOf('focus') !== -1) {
      newChildProps.onFocus = createChainedFunction(this.onFocus, childProps.onFocus);
      newChildProps.onBlur = createChainedFunction(this.onBlur, childProps.onBlur);
    }

    return React.cloneElement(child, newChildProps);
  },
});

export default Trigger;

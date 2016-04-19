import React, { PropTypes } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import { createChainedFunction, Dom } from 'rc-util';
import Popup from './Popup';
import { getAlignFromPlacement, getPopupClassNameFromAlign } from './utils';

function noop() {
}

function returnEmptyString() {
  return '';
}

const ALL_HANDLERS = ['onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter',
  'onMouseLeave', 'onFocus', 'onBlur'];

const Trigger = React.createClass({
  propTypes: {
    action: PropTypes.any,
    showAction: PropTypes.any,
    hideAction: PropTypes.any,
    getPopupClassNameFromAlign: PropTypes.any,
    onPopupVisibleChange: PropTypes.func,
    afterPopupVisibleChange: PropTypes.func,
    popup: PropTypes.node.isRequired,
    popupStyle: PropTypes.object,
    prefixCls: PropTypes.string,
    popupClassName: PropTypes.string,
    popupPlacement: PropTypes.string,
    builtinPlacements: PropTypes.object,
    popupTransitionName: PropTypes.string,
    popupAnimation: PropTypes.any,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    zIndex: PropTypes.number,
    focusDelay: PropTypes.number,
    blurDelay: PropTypes.number,
    getPopupContainer: PropTypes.func,
    destroyPopupOnHide: PropTypes.bool,
    mask: PropTypes.bool,
    onPopupAlign: PropTypes.func,
    popupAlign: PropTypes.object,
    popupVisible: PropTypes.bool,
    maskTransitionName: PropTypes.string,
    maskAnimation: PropTypes.string,
  },

  getDefaultProps() {
    return {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      onPopupVisibleChange: noop,
      afterPopupVisibleChange: noop,
      onPopupAlign: noop,
      popupClassName: '',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0.1,
      focusDelay: 0,
      blurDelay: 0.15,
      popupStyle: {},
      destroyPopupOnHide: false,
      popupAlign: {},
      defaultPopupVisible: false,
      mask: false,
      action: [],
      showAction: [],
      hideAction: [],
    };
  },

  getInitialState() {
    const props = this.props;
    let popupVisible;
    if ('popupVisible' in props) {
      popupVisible = !!props.popupVisible;
    } else {
      popupVisible = !!props.defaultPopupVisible;
    }
    return {
      popupVisible,
    };
  },

  componentDidMount() {
    this.componentDidUpdate({}, {
      popupVisible: this.state.popupVisible,
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
    if (this.popupRendered) {
      const self = this;
      ReactDOM.unstable_renderSubtreeIntoContainer(this, this.getPopupElement(),
        this.getPopupContainer(), function renderPopup() {
          /* eslint react/no-is-mounted:0 */
          if (this.isMounted()) {
            self.popupDomNode = this.getPopupDomNode();
          } else {
            self.popupDomNode = null;
          }
          if (prevState.popupVisible !== state.popupVisible) {
            props.afterPopupVisibleChange(state.popupVisible);
          }
        });
      if (this.isClickToHide()) {
        if (state.popupVisible) {
          if (!this.clickOutsideHandler) {
            this.clickOutsideHandler = Dom.addEventListener(document,
              'mousedown', this.onDocumentClick);
            this.touchOutsideHandler = Dom.addEventListener(document,
              'touchstart', this.onDocumentClick);
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
      popupContainer.parentNode.removeChild(popupContainer);
      this.popupContainer = null;
    }
    this.clearDelayTimer();
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
    // incase focusin and focusout
    this.clearDelayTimer();
    if (this.isFocusToShow()) {
      this.focusTime = Date.now();
      this.delaySetPopupVisible(true, this.props.focusDelay);
    }
  },

  onMouseDown() {
    this.preClickTime = Date.now();
  },

  onTouchStart() {
    this.preTouchTime = Date.now();
  },

  onBlur() {
    this.clearDelayTimer();
    if (this.isBlurToHide()) {
      this.delaySetPopupVisible(false, this.props.blurDelay);
    }
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
    const nextVisible = !this.state.popupVisible;
    if (this.isClickToHide() && !nextVisible || nextVisible && this.isClickToShow()) {
      this.setPopupVisible(!this.state.popupVisible);
    }
  },

  onDocumentClick(event) {
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!Dom.contains(root, target) && !Dom.contains(popupNode, target)) {
      this.setPopupVisible(false);
    }
  },

  getPopupDomNode() {
    // for test
    return this.popupDomNode;
  },

  getRootDomNode() {
    return ReactDOM.findDOMNode(this);
  },

  getPopupContainer() {
    if (!this.popupContainer) {
      this.popupContainer = document.createElement('div');
      const mountNode = this.props.getPopupContainer ?
        this.props.getPopupContainer(findDOMNode(this)) : document.body;
      mountNode.appendChild(this.popupContainer);
    }
    return this.popupContainer;
  },

  getPopupClassNameFromAlign(align) {
    const className = [];
    const props = this.props;
    const { popupPlacement, builtinPlacements, prefixCls } = props;
    if (popupPlacement && builtinPlacements) {
      className.push(getPopupClassNameFromAlign(builtinPlacements, prefixCls, align));
    }
    if (props.getPopupClassNameFromAlign) {
      className.push(props.getPopupClassNameFromAlign(align));
    }
    return className.join(' ');
  },

  getPopupAlign() {
    const props = this.props;
    const { popupPlacement, popupAlign, builtinPlacements } = props;
    if (popupPlacement && builtinPlacements) {
      return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
    }
    return popupAlign;
  },

  getPopupElement() {
    const props = this.props;
    const state = this.state;
    const mouseProps = {};
    if (props.action.indexOf('hover') !== -1) {
      mouseProps.onMouseEnter = this.onMouseEnter;
      mouseProps.onMouseLeave = this.onMouseLeave;
    }
    return (<Popup
      prefixCls={props.prefixCls}
      destroyPopupOnHide={props.destroyPopupOnHide}
      visible={state.popupVisible}
      className={props.popupClassName}
      action={props.action}
      align={this.getPopupAlign()}
      onAlign={props.onPopupAlign}
      animation={props.popupAnimation}
      getClassNameFromAlign={this.getPopupClassNameFromAlign}
      {...mouseProps}
      getRootDomNode={this.getRootDomNode}
      style={props.popupStyle}
      mask={props.mask}
      zIndex={props.zIndex}
      transitionName={props.popupTransitionName}
      maskAnimation={props.maskAnimation}
      maskTransitionName={props.maskTransitionName}
    >
      {props.popup}
    </Popup>);
  },

  setPopupVisible(popupVisible) {
    this.clearDelayTimer();
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
    this.clearDelayTimer();
    if (delay) {
      this.delayTimer = setTimeout(() => {
        this.setPopupVisible(visible);
        this.clearDelayTimer();
      }, delay);
    } else {
      this.setPopupVisible(visible);
    }
  },

  clearDelayTimer() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  },

  isClickToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
  },

  isClickToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
  },

  isMouseEnterToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('hover') !== -1 || showAction.indexOf('mouseEnter') !== -1;
  },

  isMouseLeaveToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseLeave') !== -1;
  },

  isFocusToShow() {
    const { action, showAction } = this.props;
    return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
  },

  isBlurToHide() {
    const { action, hideAction } = this.props;
    return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
  },

  render() {
    this.popupRendered = this.popupRendered || this.state.popupVisible;
    const props = this.props;
    const children = props.children;
    const child = React.Children.only(children);
    const childProps = child.props || {};
    const newChildProps = {};

    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.onClick = createChainedFunction(this.onClick, childProps.onClick);
      newChildProps.onMouseDown = createChainedFunction(this.onMouseDown,
        childProps.onMouseDown);
      newChildProps.onTouchStart = createChainedFunction(this.onTouchStart,
        childProps.onTouchStart);
    }
    if (this.isMouseEnterToShow()) {
      newChildProps.onMouseEnter = createChainedFunction(this.onMouseEnter,
        childProps.onMouseEnter);
    }
    if (this.isMouseLeaveToHide()) {
      newChildProps.onMouseLeave = createChainedFunction(this.onMouseLeave,
        childProps.onMouseLeave);
    }
    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.onFocus = createChainedFunction(this.onFocus,
        childProps.onFocus);
      newChildProps.onBlur = createChainedFunction(this.onBlur,
        childProps.onBlur);
    }

    ALL_HANDLERS.forEach(handler => {
      let newFn;
      if (props[handler] && newChildProps[handler]) {
        newFn = createChainedFunction(props[handler], newChildProps[handler]);
      } else {
        newFn = props[handler] || newChildProps[handler];
      }
      if (newFn) {
        newChildProps[handler] = newFn;
      }
    });

    return React.cloneElement(child, newChildProps);
  },
});

export default Trigger;

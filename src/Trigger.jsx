import React, { PropTypes } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import createChainedFunction from 'rc-util/lib/createChainedFunction';
import contains from 'rc-util/lib/Dom/contains';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Popup from './Popup';
import { getAlignFromPlacement, getPopupClassNameFromAlign } from './utils';
import getContainerRenderMixin from 'rc-util/lib/getContainerRenderMixin';

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
    popup: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
    ]).isRequired,
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

  mixins: [
    getContainerRenderMixin({
      autoMount: false,

      isVisible(instance) {
        return instance.state.popupVisible;
      },

      getContainer(instance) {
        const popupContainer = document.createElement('div');
        const mountNode = instance.props.getPopupContainer ?
          instance.props.getPopupContainer(findDOMNode(instance)) : document.body;
        mountNode.appendChild(popupContainer);
        return popupContainer;
      },

      getComponent(instance) {
        const { props, state } = instance;
        const mouseProps = {};
        if (instance.isMouseEnterToShow()) {
          mouseProps.onMouseEnter = instance.onMouseEnter;
        }
        if (instance.isMouseLeaveToHide()) {
          mouseProps.onMouseLeave = instance.onMouseLeave;
        }
        return (<Popup
          prefixCls={props.prefixCls}
          destroyPopupOnHide={props.destroyPopupOnHide}
          visible={state.popupVisible}
          className={props.popupClassName}
          action={props.action}
          align={instance.getPopupAlign()}
          onAlign={props.onPopupAlign}
          animation={props.popupAnimation}
          getClassNameFromAlign={instance.getPopupClassNameFromAlign}
          {...mouseProps}
          getRootDomNode={instance.getRootDomNode}
          style={props.popupStyle}
          mask={props.mask}
          zIndex={props.zIndex}
          transitionName={props.popupTransitionName}
          maskAnimation={props.maskAnimation}
          maskTransitionName={props.maskTransitionName}
        >
          {typeof props.popup === 'function' ? props.popup() : props.popup}
        </Popup>);
      },
    }),
  ],

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

  componentWillReceiveProps({ popupVisible }) {
    if (popupVisible !== undefined) {
      this.setState({
        popupVisible,
      });
    }
  },

  componentDidUpdate(_, prevState) {
    const props = this.props;
    const state = this.state;
    this.renderComponent(() => {
      if (prevState.popupVisible !== state.popupVisible) {
        props.afterPopupVisibleChange(state.popupVisible);
      }
    });
    if (this.isClickToHide()) {
      if (state.popupVisible) {
        if (!this.clickOutsideHandler) {
          this.clickOutsideHandler = addEventListener(document,
            'mousedown', this.onDocumentClick);
          this.touchOutsideHandler = addEventListener(document,
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
  },

  componentWillUnmount() {
    this.clearDelayTimer();
    if (this.clickOutsideHandler) {
      this.clickOutsideHandler.remove();
      this.touchOutsideHandler.remove();
      this.clickOutsideHandler = null;
      this.touchOutsideHandler = null;
    }
  },

  onMouseEnter(event) {
    this.delaySetPopupVisible(true, this.props.mouseEnterDelay, event);
  },

  onMouseLeave(event) {
    // https://github.com/react-component/trigger/pull/13
    // react bug?
    if (event.relatedTarget && !event.relatedTarget.setTimeout &&
      contains(this.popupContainer, event.relatedTarget)) {
      return;
    }
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay, event);
  },

  onFocus(event) {
    // incase focusin and focusout
    this.clearDelayTimer();
    if (this.isFocusToShow()) {
      this.focusTime = Date.now();
      this.delaySetPopupVisible(true, this.props.focusDelay, event);
    }
  },

  onMouseDown() {
    this.preClickTime = Date.now();
  },

  onTouchStart() {
    this.preTouchTime = Date.now();
  },

  onBlur(event) {
    this.clearDelayTimer();
    if (this.isBlurToHide()) {
      this.delaySetPopupVisible(false, this.props.blurDelay, event);
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
      this.setPopupVisible(!this.state.popupVisible, event);
    }
  },

  onDocumentClick(event) {
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!contains(root, target) && !contains(popupNode, target)) {
      this.setPopupVisible(false, event);
    }
  },

  getPopupDomNode() {
    // for test
    if (this._component) {
      return this._component.isMounted() ? this._component.getPopupDomNode() : null;
    }
    return null;
  },

  getRootDomNode() {
    return ReactDOM.findDOMNode(this);
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

  setPopupVisible(popupVisible, event) {
    this.clearDelayTimer();
    if (this.state.popupVisible !== popupVisible) {
      if (!('popupVisible' in this.props)) {
        this.setState({
          popupVisible,
        });
      }
      this.props.onPopupVisibleChange(popupVisible, event);
    }
  },

  delaySetPopupVisible(visible, delayS, event) {
    const delay = delayS * 1000;
    this.clearDelayTimer();
    if (delay) {
      this.delayTimer = setTimeout(() => {
        this.setPopupVisible(visible, event);
        this.clearDelayTimer();
      }, delay);
    } else {
      this.setPopupVisible(visible, event);
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
  forcePopupAlign() {
    if (this.state.popupVisible && this.popupInstance && this.popupInstance.alignInstance) {
      this.popupInstance.alignInstance.forceAlign();
    }
  },

  render() {
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

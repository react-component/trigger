import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import createReactClass from 'create-react-class';
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

function returnDocument() {
  return window.document;
}

const ALL_HANDLERS = ['onClick', 'onMouseDown', 'onTouchStart', 'onMouseEnter',
  'onMouseLeave', 'onFocus', 'onBlur'];

const Trigger = createReactClass({
  displayName: 'Trigger',
  propTypes: {
    children: PropTypes.any,
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
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
    popupTransitionName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    popupAnimation: PropTypes.any,
    mouseEnterDelay: PropTypes.number,
    mouseLeaveDelay: PropTypes.number,
    zIndex: PropTypes.number,
    focusDelay: PropTypes.number,
    blurDelay: PropTypes.number,
    getPopupContainer: PropTypes.func,
    getDocument: PropTypes.func,
    destroyPopupOnHide: PropTypes.bool,
    mask: PropTypes.bool,
    maskClosable: PropTypes.bool,
    onPopupAlign: PropTypes.func,
    popupAlign: PropTypes.object,
    popupVisible: PropTypes.bool,
    maskTransitionName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    maskAnimation: PropTypes.string,
  },

  mixins: [
    getContainerRenderMixin({
      autoMount: false,

      isVisible(instance) {
        return instance.state.popupVisible;
      },

      getContainer(instance) {
        const { props } = instance;
        const popupContainer = document.createElement('div');
        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        const mountNode = props.getPopupContainer ?
          props.getPopupContainer(findDOMNode(instance)) : props.getDocument().body;
        mountNode.appendChild(popupContainer);
        return popupContainer;
      },
    }),
  ],

  getDefaultProps() {
    return {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      getDocument: returnDocument,
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
      maskClosable: true,
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

  componentWillMount() {
    ALL_HANDLERS.forEach((h) => {
      this[`fire${h}`] = (e) => {
        this.fireEvents(h, e);
      };
    });
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
    this.renderComponent(null, () => {
      if (prevState.popupVisible !== state.popupVisible) {
        props.afterPopupVisibleChange(state.popupVisible);
      }
    });

    // We must listen to `mousedown` or `touchstart`, edge case:
    // https://github.com/ant-design/ant-design/issues/5804
    // https://github.com/react-component/calendar/issues/250
    // https://github.com/react-component/trigger/issues/50
    if (state.popupVisible) {
      let currentDocument;
      if (!this.clickOutsideHandler && this.isClickToHide()) {
        currentDocument = props.getDocument();
        this.clickOutsideHandler = addEventListener(currentDocument,
          'mousedown', this.onDocumentClick);
      }
      // always hide on mobile
      if (!this.touchOutsideHandler) {
        currentDocument = currentDocument || props.getDocument();
        this.touchOutsideHandler = addEventListener(currentDocument,
          'touchstart', this.onDocumentClick);
      }
      return;
    }

    this.clearOutsideHandler();
  },

  componentWillUnmount() {
    this.clearDelayTimer();
    this.clearOutsideHandler();
  },

  onMouseEnter(e) {
    this.fireEvents('onMouseEnter', e);
    this.delaySetPopupVisible(true, this.props.mouseEnterDelay);
  },

  onMouseLeave(e) {
    this.fireEvents('onMouseLeave', e);
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
  },

  onPopupMouseEnter() {
    this.clearDelayTimer();
  },

  onPopupMouseLeave(e) {
    // https://github.com/react-component/trigger/pull/13
    // react bug?
    if (e.relatedTarget && !e.relatedTarget.setTimeout &&
      this._component &&
      contains(this._component.getPopupDomNode(), e.relatedTarget)) {
      return;
    }
    this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
  },

  onFocus(e) {
    this.fireEvents('onFocus', e);
    // incase focusin and focusout
    this.clearDelayTimer();
    if (this.isFocusToShow()) {
      this.focusTime = Date.now();
      this.delaySetPopupVisible(true, this.props.focusDelay);
    }
  },

  onMouseDown(e) {
    this.fireEvents('onMouseDown', e);
    this.preClickTime = Date.now();
  },

  onTouchStart(e) {
    this.fireEvents('onTouchStart', e);
    this.preTouchTime = Date.now();
  },

  onBlur(e) {
    this.fireEvents('onBlur', e);
    this.clearDelayTimer();
    if (this.isBlurToHide()) {
      this.delaySetPopupVisible(false, this.props.blurDelay);
    }
  },

  onClick(event) {
    this.fireEvents('onClick', event);
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
    if (this.props.mask && !this.props.maskClosable && this.isClickedOnScrollBar(event.clientX)) {
      return;
    }
    const target = event.target;
    const root = findDOMNode(this);
    const popupNode = this.getPopupDomNode();
    if (!contains(root, target) && !contains(popupNode, target)) {
      this.close();
    }
  },

  getPopupDomNode() {
    // for test
    if (this._component && this._component.getPopupDomNode) {
      return this._component.getPopupDomNode();
    }
    return null;
  },

  getRootDomNode() {
    return findDOMNode(this);
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

  getComponent() {
    const { props, state } = this;
    const mouseProps = {};
    if (this.isMouseEnterToShow()) {
      mouseProps.onMouseEnter = this.onPopupMouseEnter;
    }
    if (this.isMouseLeaveToHide()) {
      mouseProps.onMouseLeave = this.onPopupMouseLeave;
    }
    return (
      <Popup
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
        {typeof props.popup === 'function' ? props.popup() : props.popup}
      </Popup>
    );
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

  clearOutsideHandler() {
    if (this.clickOutsideHandler) {
      this.clickOutsideHandler.remove();
      this.clickOutsideHandler = null;
    }

    if (this.touchOutsideHandler) {
      this.touchOutsideHandler.remove();
      this.touchOutsideHandler = null;
    }
  },

  createTwoChains(event) {
    const childPros = this.props.children.props;
    const props = this.props;
    if (childPros[event] && props[event]) {
      return this[`fire${event}`];
    }
    return childPros[event] || props[event];
  },
    
  isClickedOnScrollBar(clientX) {
    return clientX >= document.documentElement.offsetWidth;
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
    if (this.state.popupVisible && this._component && this._component.alignInstance) {
      this._component.alignInstance.forceAlign();
    }
  },

  fireEvents(type, e) {
    const childCallback = this.props.children.props[type];
    if (childCallback) {
      childCallback(e);
    }
    const callback = this.props[type];
    if (callback) {
      callback(e);
    }
  },

  close() {
    this.setPopupVisible(false);
  },

  render() {
    const props = this.props;
    const children = props.children;
    const child = React.Children.only(children);
    const newChildProps = {};
    if (this.isClickToHide() || this.isClickToShow()) {
      newChildProps.onClick = this.onClick;
      newChildProps.onMouseDown = this.onMouseDown;
      newChildProps.onTouchStart = this.onTouchStart;
    } else {
      newChildProps.onClick = this.createTwoChains('onClick');
      newChildProps.onMouseDown = this.createTwoChains('onMouseDown');
      newChildProps.onTouchStart = this.createTwoChains('onTouchStart');
    }
    if (this.isMouseEnterToShow()) {
      newChildProps.onMouseEnter = this.onMouseEnter;
    } else {
      newChildProps.onMouseEnter = this.createTwoChains('onMouseEnter');
    }
    if (this.isMouseLeaveToHide()) {
      newChildProps.onMouseLeave = this.onMouseLeave;
    } else {
      newChildProps.onMouseLeave = this.createTwoChains('onMouseLeave');
    }
    if (this.isFocusToShow() || this.isBlurToHide()) {
      newChildProps.onFocus = this.onFocus;
      newChildProps.onBlur = this.onBlur;
    } else {
      newChildProps.onFocus = this.createTwoChains('onFocus');
      newChildProps.onBlur = this.createTwoChains('onBlur');
    }

    return React.cloneElement(child, newChildProps);
  },
});

export default Trigger;

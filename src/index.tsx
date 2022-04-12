import * as React from 'react';
import type { HTMLAttributes } from 'react';
import ReactDOM from 'react-dom';
import raf from 'rc-util/lib/raf';
import contains from 'rc-util/lib/Dom/contains';
import findDOMNode from 'rc-util/lib/Dom/findDOMNode';
import { composeRef, supportRef } from 'rc-util/lib/ref';
import type { CSSMotionProps } from 'rc-motion';
import addEventListener from 'rc-util/lib/Dom/addEventListener';
import Portal from 'rc-util/lib/Portal';
import classNames from 'classnames';

import {
  getAlignFromPlacement,
  getAlignPopupClassName,
} from './utils/alignUtil';
import Popup from './Popup';
import type { PopupInnerRef } from './Popup/PopupInner';
import TriggerContext from './context';
import type {
  ActionType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  CommonEventHandler,
  MobileConfig,
} from './interface';
import { BuildInPlacements } from './interface';

function noop() {}

function returnEmptyString() {
  return '';
}

function returnDocument(element?: HTMLElement) {
  if (element) {
    return element.ownerDocument;
  }
  return window.document;
}

const ALL_HANDLERS = [
  'onClick',
  'onMouseDown',
  'onTouchStart',
  'onMouseEnter',
  'onMouseLeave',
  'onFocus',
  'onBlur',
  'onContextMenu',
];

export interface TriggerProps {
  children: React.ReactElement;
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  onPopupVisibleChange?: (visible: boolean) => void;
  afterPopupVisibleChange?: (visible: boolean) => void;
  popup: React.ReactNode | (() => React.ReactNode);
  popupStyle?: React.CSSProperties;
  prefixCls?: string;
  popupClassName?: string;
  className?: string;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  focusDelay?: number;
  blurDelay?: number;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  getDocument?: (element?: HTMLElement) => HTMLDocument;
  forceRender?: boolean;
  destroyPopupOnHide?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  popupAlign?: AlignType;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  autoDestroy?: boolean;

  stretch?: string;
  alignPoint?: boolean; // Maybe we can support user pass position in the future

  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  /** @deprecated Please us `popupMotion` instead. */
  popupTransitionName?: TransitionNameType;
  /** @deprecated Please us `popupMotion` instead. */
  popupAnimation?: AnimationType;
  /** @deprecated Please us `maskMotion` instead. */
  maskTransitionName?: TransitionNameType;
  /** @deprecated Please us `maskMotion` instead. */
  maskAnimation?: string;

  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: React.ReactInstance) => HTMLElement;

  // ========================== Mobile ==========================
  /** @private Bump fixed position at bottom in mobile.
   * This is internal usage currently, do not use in your prod */
  mobile?: MobileConfig;
}

interface TriggerState {
  prevPopupVisible: boolean;
  popupVisible: boolean;
  point?: Point;
}

/**
 * Internal usage. Do not use in your code since this will be removed.
 */
export function generateTrigger(
  PortalComponent: any,
): React.ComponentClass<TriggerProps> {
  class Trigger extends React.Component<TriggerProps, TriggerState> {
    static contextType = TriggerContext;

    static defaultProps = {
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
      autoDestroy: false,
    };

    popupRef = React.createRef<PopupInnerRef>();

    triggerRef = React.createRef<React.ReactInstance>();

    // ensure `getContainer` will be called only once
    portalContainer?: HTMLElement;

    attachId?: number;

    clickOutsideHandler: CommonEventHandler;

    touchOutsideHandler: CommonEventHandler;

    contextMenuOutsideHandler1: CommonEventHandler;

    contextMenuOutsideHandler2: CommonEventHandler;

    mouseDownTimeout: number;

    focusTime: number;

    preClickTime: number;

    preTouchTime: number;

    delayTimer: number;

    hasPopupMouseDown: boolean;

    constructor(props: TriggerProps) {
      super(props);

      let popupVisible: boolean;
      if ('popupVisible' in props) {
        popupVisible = !!props.popupVisible;
      } else {
        popupVisible = !!props.defaultPopupVisible;
      }

      this.state = {
        prevPopupVisible: popupVisible,
        popupVisible,
      };

      ALL_HANDLERS.forEach((h) => {
        this[`fire${h}`] = (e) => {
          this.fireEvents(h, e);
        };
      });
    }

    componentDidMount() {
      this.componentDidUpdate();
    }

    componentDidUpdate() {
      const { props } = this;
      const { state } = this;

      // We must listen to `mousedown` or `touchstart`, edge case:
      // https://github.com/ant-design/ant-design/issues/5804
      // https://github.com/react-component/calendar/issues/250
      // https://github.com/react-component/trigger/issues/50
      if (state.popupVisible) {
        let currentDocument;
        if (
          !this.clickOutsideHandler &&
          (this.isClickToHide() || this.isContextMenuToShow())
        ) {
          currentDocument = props.getDocument(this.getRootDomNode());
          this.clickOutsideHandler = addEventListener(
            currentDocument,
            'mousedown',
            this.onDocumentClick,
          );
        }
        // always hide on mobile
        if (!this.touchOutsideHandler) {
          currentDocument =
            currentDocument || props.getDocument(this.getRootDomNode());
          this.touchOutsideHandler = addEventListener(
            currentDocument,
            'touchstart',
            this.onDocumentClick,
          );
        }
        // close popup when trigger type contains 'onContextMenu' and document is scrolling.
        if (!this.contextMenuOutsideHandler1 && this.isContextMenuToShow()) {
          currentDocument =
            currentDocument || props.getDocument(this.getRootDomNode());
          this.contextMenuOutsideHandler1 = addEventListener(
            currentDocument,
            'scroll',
            this.onContextMenuClose,
          );
        }
        // close popup when trigger type contains 'onContextMenu' and window is blur.
        if (!this.contextMenuOutsideHandler2 && this.isContextMenuToShow()) {
          this.contextMenuOutsideHandler2 = addEventListener(
            window,
            'blur',
            this.onContextMenuClose,
          );
        }
        return;
      }

      this.clearOutsideHandler();
    }

    componentWillUnmount() {
      this.clearDelayTimer();
      this.clearOutsideHandler();
      clearTimeout(this.mouseDownTimeout);
      raf.cancel(this.attachId);
    }

    onMouseEnter = (e) => {
      const { mouseEnterDelay } = this.props;
      this.fireEvents('onMouseEnter', e);
      this.delaySetPopupVisible(
        true,
        mouseEnterDelay,
        mouseEnterDelay ? null : e,
      );
    };

    onMouseMove = (e) => {
      this.fireEvents('onMouseMove', e);
      this.setPoint(e);
    };

    onMouseLeave = (e) => {
      this.fireEvents('onMouseLeave', e);
      this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
    };

    onPopupMouseEnter = () => {
      this.clearDelayTimer();
    };

    onPopupMouseLeave = (e) => {
      // https://github.com/react-component/trigger/pull/13
      // react bug?
      if (
        e.relatedTarget &&
        !e.relatedTarget.setTimeout &&
        contains(this.popupRef.current?.getElement(), e.relatedTarget)
      ) {
        return;
      }
      this.delaySetPopupVisible(false, this.props.mouseLeaveDelay);
    };

    onFocus = (e) => {
      this.fireEvents('onFocus', e);
      // incase focusin and focusout
      this.clearDelayTimer();
      if (this.isFocusToShow()) {
        this.focusTime = Date.now();
        this.delaySetPopupVisible(true, this.props.focusDelay);
      }
    };

    onMouseDown = (e) => {
      this.fireEvents('onMouseDown', e);
      this.preClickTime = Date.now();
    };

    onTouchStart = (e) => {
      this.fireEvents('onTouchStart', e);
      this.preTouchTime = Date.now();
    };

    onBlur = (e) => {
      this.fireEvents('onBlur', e);
      this.clearDelayTimer();
      if (this.isBlurToHide()) {
        this.delaySetPopupVisible(false, this.props.blurDelay);
      }
    };

    onContextMenu = (e) => {
      e.preventDefault();
      this.fireEvents('onContextMenu', e);
      this.setPopupVisible(true, e);
    };

    onContextMenuClose = () => {
      if (this.isContextMenuToShow()) {
        this.close();
      }
    };

    onClick = (event) => {
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

      // Only prevent default when all the action is click.
      // https://github.com/ant-design/ant-design/issues/17043
      // https://github.com/ant-design/ant-design/issues/17291
      if (
        this.isClickToShow() &&
        (this.isClickToHide() || this.isBlurToHide()) &&
        event &&
        event.preventDefault
      ) {
        event.preventDefault();
      }
      const nextVisible = !this.state.popupVisible;
      if (
        (this.isClickToHide() && !nextVisible) ||
        (nextVisible && this.isClickToShow())
      ) {
        this.setPopupVisible(!this.state.popupVisible, event);
      }
    };

    onPopupMouseDown = (...args) => {
      this.hasPopupMouseDown = true;

      clearTimeout(this.mouseDownTimeout);
      this.mouseDownTimeout = window.setTimeout(() => {
        this.hasPopupMouseDown = false;
      }, 0);

      if (this.context) {
        this.context.onPopupMouseDown(...args);
      }
    };

    onDocumentClick = (event) => {
      if (this.props.mask && !this.props.maskClosable) {
        return;
      }

      const { target } = event;
      const root = this.getRootDomNode();
      const popupNode = this.getPopupDomNode();
      if (
        // mousedown on the target should also close popup when action is contextMenu.
        // https://github.com/ant-design/ant-design/issues/29853
        (!contains(root, target) || this.isContextMenuOnly()) &&
        !contains(popupNode, target) &&
        !this.hasPopupMouseDown
      ) {
        this.close();
      }
    };

    static getDerivedStateFromProps(
      { popupVisible }: TriggerProps,
      prevState: TriggerState,
    ) {
      const newState: Partial<TriggerState> = {};

      if (
        popupVisible !== undefined &&
        prevState.popupVisible !== popupVisible
      ) {
        newState.popupVisible = popupVisible;
        newState.prevPopupVisible = prevState.popupVisible;
      }

      return newState;
    }

    getPopupDomNode() {
      // for test
      return this.popupRef.current?.getElement() || null;
    }

    getRootDomNode = (): HTMLElement => {
      const { getTriggerDOMNode } = this.props;
      if (getTriggerDOMNode) {
        return getTriggerDOMNode(this.triggerRef.current);
      }

      try {
        const domNode = findDOMNode<HTMLElement>(this.triggerRef.current);
        if (domNode) {
          return domNode;
        }
      } catch (err) {
        // Do nothing
      }

      return ReactDOM.findDOMNode(this) as HTMLElement;
    };

    getPopupClassNameFromAlign = (align) => {
      const className = [];
      const {
        popupPlacement,
        builtinPlacements,
        prefixCls,
        alignPoint,
        getPopupClassNameFromAlign,
      } = this.props;
      if (popupPlacement && builtinPlacements) {
        className.push(
          getAlignPopupClassName(
            builtinPlacements,
            prefixCls,
            align,
            alignPoint,
          ),
        );
      }
      if (getPopupClassNameFromAlign) {
        className.push(getPopupClassNameFromAlign(align));
      }
      return className.join(' ');
    };

    getPopupAlign() {
      const { props } = this;
      const { popupPlacement, popupAlign, builtinPlacements } = props;
      if (popupPlacement && builtinPlacements) {
        return getAlignFromPlacement(
          builtinPlacements,
          popupPlacement,
          popupAlign,
        );
      }
      return popupAlign;
    }

    getComponent = () => {
      const {
        prefixCls,
        destroyPopupOnHide,
        popupClassName,
        onPopupAlign,
        popupMotion,
        popupAnimation,
        popupTransitionName,
        popupStyle,
        mask,
        maskAnimation,
        maskTransitionName,
        maskMotion,
        zIndex,
        popup,
        stretch,
        alignPoint,
        mobile,
        forceRender,
      } = this.props;
      const { popupVisible, point } = this.state;

      const align = this.getPopupAlign();

      const mouseProps: HTMLAttributes<HTMLElement> = {};
      if (this.isMouseEnterToShow()) {
        mouseProps.onMouseEnter = this.onPopupMouseEnter;
      }
      if (this.isMouseLeaveToHide()) {
        mouseProps.onMouseLeave = this.onPopupMouseLeave;
      }

      mouseProps.onMouseDown = this.onPopupMouseDown;
      mouseProps.onTouchStart = this.onPopupMouseDown;

      return (
        <Popup
          prefixCls={prefixCls}
          destroyPopupOnHide={destroyPopupOnHide}
          visible={popupVisible}
          point={alignPoint && point}
          className={popupClassName}
          align={align}
          onAlign={onPopupAlign}
          animation={popupAnimation}
          getClassNameFromAlign={this.getPopupClassNameFromAlign}
          {...mouseProps}
          stretch={stretch}
          getRootDomNode={this.getRootDomNode}
          style={popupStyle}
          mask={mask}
          zIndex={zIndex}
          transitionName={popupTransitionName}
          maskAnimation={maskAnimation}
          maskTransitionName={maskTransitionName}
          maskMotion={maskMotion}
          ref={this.popupRef}
          motion={popupMotion}
          mobile={mobile}
          forceRender={forceRender}
        >
          {typeof popup === 'function' ? popup() : popup}
        </Popup>
      );
    };

    attachParent = (popupContainer: HTMLDivElement) => {
      raf.cancel(this.attachId);

      const { getPopupContainer, getDocument } = this.props;
      const domNode = this.getRootDomNode();

      let mountNode: HTMLElement;
      if (!getPopupContainer) {
        mountNode = getDocument(this.getRootDomNode()).body;
      } else if (domNode || getPopupContainer.length === 0) {
        // Compatible for legacy getPopupContainer with domNode argument.
        // If no need `domNode` argument, will call directly.
        // https://codesandbox.io/s/eloquent-mclean-ss93m?file=/src/App.js
        mountNode = getPopupContainer(domNode);
      }

      if (mountNode) {
        mountNode.appendChild(popupContainer);
      } else {
        // Retry after frame render in case parent not ready
        this.attachId = raf(() => {
          this.attachParent(popupContainer);
        });
      }
    };

    getContainer = () => {
      if (!this.portalContainer) {
        // In React.StrictMode component will call render multiple time in first mount.
        // When you want to refactor with FC, useRef will also init multiple time and
        // point to different useRef instance which will create multiple element
        // (This multiple render will not trigger effect so you can not clean up this
        // in effect). But this is safe with class component since it always point to same class instance.
        const { getDocument } = this.props;
        const popupContainer = getDocument(this.getRootDomNode()).createElement(
          'div',
        );
        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';
        this.attachParent(popupContainer);

        this.portalContainer = popupContainer;
      }

      return this.portalContainer;
    };

    /**
     * @param popupVisible    Show or not the popup element
     * @param event           SyntheticEvent, used for `pointAlign`
     */
    setPopupVisible(
      popupVisible: boolean,
      event?: { pageX: number; pageY: number },
    ) {
      const { alignPoint } = this.props;
      const { popupVisible: prevPopupVisible } = this.state;

      this.clearDelayTimer();

      if (prevPopupVisible !== popupVisible) {
        if (!('popupVisible' in this.props)) {
          this.setState({ popupVisible, prevPopupVisible });
        }
        this.props.onPopupVisibleChange(popupVisible);
      }

      // Always record the point position since mouseEnterDelay will delay the show
      if (alignPoint && event && popupVisible) {
        this.setPoint(event);
      }
    }

    setPoint = (point) => {
      const { alignPoint } = this.props;
      if (!alignPoint || !point) return;

      this.setState({
        point: {
          pageX: point.pageX,
          pageY: point.pageY,
        },
      });
    };

    handlePortalUpdate = () => {
      if (this.state.prevPopupVisible !== this.state.popupVisible) {
        this.props.afterPopupVisibleChange(this.state.popupVisible);
      }
    };

    delaySetPopupVisible(visible: boolean, delayS: number, event?: MouseEvent) {
      const delay = delayS * 1000;
      this.clearDelayTimer();
      if (delay) {
        const point = event ? { pageX: event.pageX, pageY: event.pageY } : null;
        this.delayTimer = window.setTimeout(() => {
          this.setPopupVisible(visible, point);
          this.clearDelayTimer();
        }, delay);
      } else {
        this.setPopupVisible(visible, event);
      }
    }

    clearDelayTimer() {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
    }

    clearOutsideHandler() {
      if (this.clickOutsideHandler) {
        this.clickOutsideHandler.remove();
        this.clickOutsideHandler = null;
      }

      if (this.contextMenuOutsideHandler1) {
        this.contextMenuOutsideHandler1.remove();
        this.contextMenuOutsideHandler1 = null;
      }

      if (this.contextMenuOutsideHandler2) {
        this.contextMenuOutsideHandler2.remove();
        this.contextMenuOutsideHandler2 = null;
      }

      if (this.touchOutsideHandler) {
        this.touchOutsideHandler.remove();
        this.touchOutsideHandler = null;
      }
    }

    createTwoChains(event: string) {
      const childPros = this.props.children.props;
      const { props } = this;
      if (childPros[event] && props[event]) {
        return this[`fire${event}`];
      }
      return childPros[event] || props[event];
    }

    isClickToShow() {
      const { action, showAction } = this.props;
      return (
        action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1
      );
    }

    isContextMenuOnly() {
      const { action } = this.props;
      return (
        action === 'contextMenu' ||
        (action.length === 1 && action[0] === 'contextMenu')
      );
    }

    isContextMenuToShow() {
      const { action, showAction } = this.props;
      return (
        action.indexOf('contextMenu') !== -1 ||
        showAction.indexOf('contextMenu') !== -1
      );
    }

    isClickToHide() {
      const { action, hideAction } = this.props;
      return (
        action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1
      );
    }

    isMouseEnterToShow() {
      const { action, showAction } = this.props;
      return (
        action.indexOf('hover') !== -1 ||
        showAction.indexOf('mouseEnter') !== -1
      );
    }

    isMouseLeaveToHide() {
      const { action, hideAction } = this.props;
      return (
        action.indexOf('hover') !== -1 ||
        hideAction.indexOf('mouseLeave') !== -1
      );
    }

    isFocusToShow() {
      const { action, showAction } = this.props;
      return (
        action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1
      );
    }

    isBlurToHide() {
      const { action, hideAction } = this.props;
      return (
        action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1
      );
    }

    forcePopupAlign() {
      if (this.state.popupVisible) {
        this.popupRef.current?.forceAlign();
      }
    }

    fireEvents(type: string, e: Event) {
      const childCallback = (this.props.children as React.ReactElement).props[
        type
      ];
      if (childCallback) {
        childCallback(e);
      }
      const callback = this.props[type];
      if (callback) {
        callback(e);
      }
    }

    close() {
      this.setPopupVisible(false);
    }

    triggerContextValue = { onPopupMouseDown: this.onPopupMouseDown };

    render() {
      const { popupVisible } = this.state;
      const { children, forceRender, alignPoint, className, autoDestroy } =
        this.props;
      const child = React.Children.only(children) as React.ReactElement;
      const newChildProps: HTMLAttributes<HTMLElement> & { key: string } = {
        key: 'trigger',
      };

      // ============================== Visible Handlers ==============================
      // >>> ContextMenu
      if (this.isContextMenuToShow()) {
        newChildProps.onContextMenu = this.onContextMenu;
      } else {
        newChildProps.onContextMenu = this.createTwoChains('onContextMenu');
      }

      // >>> Click
      if (this.isClickToHide() || this.isClickToShow()) {
        newChildProps.onClick = this.onClick;
        newChildProps.onMouseDown = this.onMouseDown;
        newChildProps.onTouchStart = this.onTouchStart;
      } else {
        newChildProps.onClick = this.createTwoChains('onClick');
        newChildProps.onMouseDown = this.createTwoChains('onMouseDown');
        newChildProps.onTouchStart = this.createTwoChains('onTouchStart');
      }

      // >>> Hover(enter)
      if (this.isMouseEnterToShow()) {
        newChildProps.onMouseEnter = this.onMouseEnter;

        // Point align
        if (alignPoint) {
          newChildProps.onMouseMove = this.onMouseMove;
        }
      } else {
        newChildProps.onMouseEnter = this.createTwoChains('onMouseEnter');
      }

      // >>> Hover(leave)
      if (this.isMouseLeaveToHide()) {
        newChildProps.onMouseLeave = this.onMouseLeave;
      } else {
        newChildProps.onMouseLeave = this.createTwoChains('onMouseLeave');
      }

      // >>> Focus
      if (this.isFocusToShow() || this.isBlurToHide()) {
        newChildProps.onFocus = this.onFocus;
        newChildProps.onBlur = this.onBlur;
      } else {
        newChildProps.onFocus = this.createTwoChains('onFocus');
        newChildProps.onBlur = this.createTwoChains('onBlur');
      }

      // =================================== Render ===================================
      const childrenClassName = classNames(
        child && child.props && child.props.className,
        className,
      );
      if (childrenClassName) {
        newChildProps.className = childrenClassName;
      }

      const cloneProps: any = {
        ...newChildProps,
      };
      if (supportRef(child)) {
        cloneProps.ref = composeRef(this.triggerRef, (child as any).ref);
      }
      const trigger = React.cloneElement(child, cloneProps);

      let portal: React.ReactElement;
      // prevent unmounting after it's rendered
      if (popupVisible || this.popupRef.current || forceRender) {
        portal = (
          <PortalComponent
            key="portal"
            getContainer={this.getContainer}
            didUpdate={this.handlePortalUpdate}
          >
            {this.getComponent()}
          </PortalComponent>
        );
      }

      if (!popupVisible && autoDestroy) {
        portal = null;
      }

      return (
        <TriggerContext.Provider value={this.triggerContextValue}>
          {trigger}
          {portal}
        </TriggerContext.Provider>
      );
    }
  }

  return Trigger;
}

export { BuildInPlacements };

export default generateTrigger(Portal);

import findDOMNode from 'rc-util/lib/Dom/findDOMNode';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { useComposeRef } from 'rc-util/lib/ref';
import * as React from 'react';
import DOMWrapper from './DOMWrapper';
import useAction from './hooks/useAction';
import type { ActionType, BuildInPlacements, Placement } from './interface';
import Popup from './Popup';

export interface TriggerRef {
  forceAlign: VoidFunction;
}

export interface TriggerProps {
  children: React.ReactElement;
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];
  // getPopupClassNameFromAlign?: (align: AlignType) => string;
  // onPopupVisibleChange?: (visible: boolean) => void;
  // onPopupClick?: React.MouseEventHandler<HTMLDivElement>;
  // afterPopupVisibleChange?: (visible: boolean) => void;
  popup: React.ReactNode | (() => React.ReactNode);
  popupStyle?: React.CSSProperties;
  prefixCls?: string;
  popupClassName?: string;
  // className?: string;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  // zIndex?: number;
  // focusDelay?: number;
  // blurDelay?: number;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  // getDocument?: (element?: HTMLElement) => HTMLDocument;
  // forceRender?: boolean;
  // destroyPopupOnHide?: boolean;
  // mask?: boolean;
  // maskClosable?: boolean;
  // onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  // popupAlign?: AlignType;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  // autoDestroy?: boolean;

  // stretch?: string;
  // alignPoint?: boolean; // Maybe we can support user pass position in the future

  // /** Set popup motion. You can ref `rc-motion` for more info. */
  // popupMotion?: CSSMotionProps;
  // /** Set mask motion. You can ref `rc-motion` for more info. */
  // maskMotion?: CSSMotionProps;

  // /** @deprecated Please us `popupMotion` instead. */
  // popupTransitionName?: TransitionNameType;
  // /** @deprecated Please us `popupMotion` instead. */
  // popupAnimation?: AnimationType;
  // /** @deprecated Please us `maskMotion` instead. */
  // maskTransitionName?: TransitionNameType;
  // /** @deprecated Please us `maskMotion` instead. */
  // maskAnimation?: string;

  // /**
  //  * @private Get trigger DOM node.
  //  * Used for some component is function component which can not access by `findDOMNode`
  //  */
  // getTriggerDOMNode?: (node: React.ReactInstance) => HTMLElement;

  // // ========================== Mobile ==========================
  // /** @private Bump fixed position at bottom in mobile.
  //  * This is internal usage currently, do not use in your prod */
  // mobile?: MobileConfig;
}

const Trigger = React.forwardRef<TriggerRef, TriggerProps>((props) => {
  const {
    prefixCls = 'rc-trigger-popup',
    children,

    // Action
    action = 'hover',
    showAction,
    hideAction,

    mouseEnterDelay,
    mouseLeaveDelay = 0.1,

    // Open
    popupVisible,
    defaultPopupVisible,

    // Popup
    popup,
    popupClassName,
    popupStyle,
    getPopupContainer,
    popupPlacement,
    builtinPlacements,
  } = props;

  // =========================== Popup ============================
  const popupRef = React.useRef<HTMLDivElement>();

  // =========================== Target ===========================
  // Use state to control here since `useRef` update not trigger render
  const [childEle, setChildEle] = React.useState<HTMLElement>(null);
  const [domWrapper, setDomWrapper] = React.useState<DOMWrapper>(null);

  const setChildEleRef = React.useCallback((node: HTMLElement) => {
    setChildEle(node);
  }, []);

  const setDomWrapperRef = React.useCallback((node: DOMWrapper) => {
    setDomWrapper(node);
  }, []);

  const targetEle = (findDOMNode(childEle) ||
    findDOMNode(domWrapper)) as HTMLElement;

  // ========================== Children ==========================
  const child = React.Children.only(children) as React.ReactElement;
  const originChildProps = child?.props || {};
  const cloneProps: typeof originChildProps = {};

  const inPopupOrChild = useEvent((ele: any) => {
    const childDOM = targetEle;
    return (
      childDOM?.contains(ele) ||
      ele === childDOM ||
      popupRef.current?.contains(ele) ||
      ele === popupRef.current
    );
  });

  // ============================ Open ============================
  const [mergedOpen, setMergedOpen] = useMergedState(
    defaultPopupVisible || false,
    {
      value: popupVisible,
    },
  );
  const openRef = React.useRef(mergedOpen);
  openRef.current = mergedOpen;

  const internalTriggerOpen = useEvent((nextOpen: boolean) => {
    if (mergedOpen !== nextOpen) {
      setMergedOpen(nextOpen);
    }
  });

  // Trigger for delay
  const delayRef = React.useRef<any>();

  const clearDelay = () => {
    clearTimeout(delayRef.current);
  };

  const triggerOpen = (nextOpen: boolean, delay = 0) => {
    clearDelay();

    if (delay === 0) {
      internalTriggerOpen(nextOpen);
    } else {
      delayRef.current = setTimeout(() => {
        internalTriggerOpen(nextOpen);
      }, delay * 1000);
    }
  };

  React.useEffect(() => clearDelay, []);

  // =========================== Action ===========================
  const [showActions, hideActions] = useAction(action, showAction, hideAction);

  // Util wrapper for trigger action
  const wrapperAction = (
    eventName: string,
    nextOpen: boolean,
    delay?: number,
  ) => {
    cloneProps[eventName] = (...args: any[]) => {
      triggerOpen(nextOpen, delay);

      // Pass to origin
      originChildProps[eventName]?.(...args);
    };
  };

  // ======================= Action: Click ========================
  const clickToShow = showActions.has('click');
  const clickToHide = hideActions.has('click');

  if (clickToShow || clickToHide) {
    cloneProps.onClick = (...args: any[]) => {
      if (openRef.current && clickToHide) {
        triggerOpen(false);
      } else if (!openRef.current && clickToShow) {
        triggerOpen(true);
      }

      // Pass to origin
      originChildProps.onClick?.(...args);
    };
  }

  // Click to hide is special action since click popup element should not hide
  React.useEffect(() => {
    if (clickToHide) {
      const onWindowClick = ({ target }: MouseEvent) => {
        if (openRef.current && !inPopupOrChild(target)) {
          triggerOpen(false);
        }
      };

      window.addEventListener('click', onWindowClick);

      return () => {
        window.removeEventListener('click', onWindowClick);
      };
    }
  }, [clickToHide]);

  // ======================= Action: Hover ========================
  const hoverToShow = showActions.has('hover');
  const hoverToHide = hideActions.has('hover');

  let onPopupMouseEnter: VoidFunction;
  let onPopupMouseLeave: VoidFunction;

  if (hoverToShow) {
    wrapperAction('onMouseEnter', true, mouseEnterDelay);
    onPopupMouseEnter = () => {
      triggerOpen(true, mouseEnterDelay);
    };
  }

  if (hoverToHide) {
    wrapperAction('onMouseLeave', false, mouseLeaveDelay);
    onPopupMouseLeave = () => {
      triggerOpen(false, mouseLeaveDelay);
    };
  }

  // ======================= Action: Focus ========================
  if (showActions.has('focus')) {
    wrapperAction('onFocus', true);
  }

  if (hideActions.has('focus')) {
    wrapperAction('onBlur', false);
  }

  // =========================== Render ===========================
  // Child Node
  const mergedRef = useComposeRef(setChildEleRef, (child as any).ref);
  const triggerNode = React.cloneElement(child, {
    ...originChildProps,
    ...cloneProps,
    ref: mergedRef,
  });

  // Render
  return (
    <>
      <Popup
        ref={popupRef}
        prefixCls={prefixCls}
        open={mergedOpen}
        popup={popup}
        className={popupClassName}
        style={popupStyle}
        target={targetEle}
        getPopupContainer={getPopupContainer}
        onMouseEnter={onPopupMouseEnter}
        onMouseLeave={onPopupMouseLeave}
        placement={popupPlacement}
        builtinPlacements={builtinPlacements}
      />
      <DOMWrapper ref={setDomWrapperRef}>{triggerNode}</DOMWrapper>
    </>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Trigger.displayName = 'Trigger';
}

export default Trigger;

import Portal from '@rc-component/portal';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { useComposeRef } from 'rc-util/lib/ref';
import * as React from 'react';
import useAction from './hooks/useAction';
import type { ActionType } from './interface';

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
  // popup: React.ReactNode | (() => React.ReactNode);
  // popupStyle?: React.CSSProperties;
  // prefixCls?: string;
  // popupClassName?: string;
  // className?: string;
  // popupPlacement?: string;
  // builtinPlacements?: BuildInPlacements;
  // mouseEnterDelay?: number;
  // mouseLeaveDelay?: number;
  // zIndex?: number;
  // focusDelay?: number;
  // blurDelay?: number;
  // getPopupContainer?: (node: HTMLElement) => HTMLElement;
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
    children,

    // Action
    action = 'hover',
    showAction,
    hideAction,

    // Open
    popupVisible,
    defaultPopupVisible,
  } = props;

  // ========================== Children ==========================
  const childRef = React.useRef<HTMLElement>();
  const child = React.Children.only(children) as React.ReactElement;
  const originChildProps = child?.props || {};
  const cloneProps: typeof originChildProps = {};

  // ============================ Open ============================
  const [mergedOpen, setMergedOpen] = useMergedState(
    defaultPopupVisible || false,
    {
      value: popupVisible,
    },
  );

  const triggerOpen = useEvent((nextOpen: boolean) => {
    if (mergedOpen !== nextOpen) {
      setMergedOpen(nextOpen);
    }
  });

  // =========================== Action ===========================
  const [showActions, hideActions] = useAction(action, showAction, hideAction);

  // Util wrapper for trigger action
  const wrapperAction = (eventName: string, nextOpen: boolean) => {
    cloneProps[eventName] = (...args: any[]) => {
      triggerOpen(nextOpen);

      // Pass to origin
      originChildProps[eventName]?.(...args);
    };
  };

  // ======================= Action: Click ========================
  if (showActions.has('click')) {
    wrapperAction('onClick', true);
  }

  // Click to hide is special action since use click popup element should not hide

  // ======================= Action: Hover ========================
  if (showActions.has('hover')) {
    wrapperAction('onMouseEnter', true);
  }

  if (hideActions.has('hover')) {
    wrapperAction('onMouseLeave', false);
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
  const mergedRef = useComposeRef(childRef, (child as any).ref);
  const triggerNode = React.cloneElement(child, {
    ...originChildProps,
    ...cloneProps,
    ref: mergedRef,
  });

  // Render
  return (
    <>
      <Portal open={mergedOpen}>Hello</Portal>
      {triggerNode}
    </>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Trigger.displayName = 'Trigger';
}

export default Trigger;

import Portal from '@rc-component/portal';
import { clsx } from 'clsx';
import type { CSSMotionProps } from '@rc-component/motion';
import ResizeObserver from '@rc-component/resize-observer';
import { isDOM } from '@rc-component/util/lib/Dom/findDOMNode';
import { getShadowRoot } from '@rc-component/util/lib/Dom/shadow';
import useEvent from '@rc-component/util/lib/hooks/useEvent';
import useId from '@rc-component/util/lib/hooks/useId';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import Popup, { type MobileConfig } from './Popup';
import type { TriggerContextProps } from './context';
import TriggerContext, { UniqueContext } from './context';
import useAction from './hooks/useAction';
import useAlign from './hooks/useAlign';
import useDelay from './hooks/useDelay';
import useWatch from './hooks/useWatch';
import useWinClick from './hooks/useWinClick';
import type {
  ActionType,
  AlignType,
  ArrowPos,
  ArrowTypeOuter,
  BuildInPlacements,
} from './interface';
import { getAlignPopupClassName } from './util';

export type {
  ActionType,
  AlignType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
};

import UniqueProvider, { type UniqueProviderProps } from './UniqueProvider';

export { UniqueProvider };
export type { UniqueProviderProps };

export interface TriggerRef {
  nativeElement: HTMLElement;
  popupElement: HTMLDivElement;
  forceAlign: VoidFunction;
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export interface TriggerProps {
  children: React.ReactElement<any>;
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];

  prefixCls?: string;

  zIndex?: number;

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;

  stretch?: string;

  // ==================== Open =====================
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  onOpenChange?: (visible: boolean) => void;
  afterOpenChange?: (visible: boolean) => void;
  /** @deprecated Use `onOpenChange` instead */
  onPopupVisibleChange?: (visible: boolean) => void;
  /** @deprecated Use `afterOpenChange` instead */
  afterPopupVisibleChange?: (visible: boolean) => void;

  // =================== Portal ====================
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  forceRender?: boolean;
  autoDestroy?: boolean;

  // ==================== Mask =====================
  mask?: boolean;
  maskClosable?: boolean;

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  // ==================== Delay ====================
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;

  focusDelay?: number;
  blurDelay?: number;

  // ==================== Popup ====================
  popup: React.ReactNode | (() => React.ReactNode);
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  popupAlign?: AlignType;
  popupClassName?: string;
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerClassName?: string;
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerStyle?: React.CSSProperties;
  popupStyle?: React.CSSProperties;
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  onPopupClick?: React.MouseEventHandler<HTMLDivElement>;

  alignPoint?: boolean; // Maybe we can support user pass position in the future

  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean;

  /**
   * Config with UniqueProvider to shared the floating popup.
   */
  unique?: boolean;

  // ==================== Arrow ====================
  arrow?: boolean | ArrowTypeOuter;

  // // ========================== Mobile ==========================
  /**
   * @private Bump fixed position at bottom in mobile.
   * Will replace the config of root props.
   * This will directly trade as mobile view which will not check what real is.
   * This is internal usage currently, do not use in your prod.
   */
  mobile?: MobileConfig;
}

export function generateTrigger(
  PortalComponent: React.ComponentType<any> = Portal,
) {
  const Trigger = React.forwardRef<TriggerRef, TriggerProps>((props, ref) => {
    const {
      prefixCls = 'rc-trigger-popup',
      children,

      // Action
      action = 'hover',
      showAction,
      hideAction,

      // Open
      popupVisible,
      defaultPopupVisible,
      onOpenChange,
      afterOpenChange,
      onPopupVisibleChange,
      afterPopupVisibleChange,

      // Delay
      mouseEnterDelay,
      mouseLeaveDelay = 0.1,

      focusDelay,
      blurDelay,

      // Mask
      mask,
      maskClosable = true,

      // Portal
      getPopupContainer,
      forceRender,
      autoDestroy,

      // Popup
      popup,
      popupClassName,
      uniqueContainerClassName,
      uniqueContainerStyle,
      popupStyle,

      popupPlacement,
      builtinPlacements = {},
      popupAlign,
      zIndex,
      stretch,
      getPopupClassNameFromAlign,
      fresh,
      unique,

      alignPoint,

      onPopupClick,
      onPopupAlign,

      // Arrow
      arrow,

      // Motion
      popupMotion,
      maskMotion,

      // Private
      mobile,

      ...restProps
    } = props;

    const mergedAutoDestroy = autoDestroy || false;
    const openUncontrolled = popupVisible === undefined;

    // =========================== Mobile ===========================
    const isMobile = !!mobile;

    // ========================== Context ===========================
    const subPopupElements = React.useRef<Record<string, HTMLElement>>({});

    const parentContext = React.useContext(TriggerContext);
    const context = React.useMemo<TriggerContextProps>(() => {
      return {
        registerSubPopup: (id, subPopupEle) => {
          subPopupElements.current[id] = subPopupEle;

          parentContext?.registerSubPopup(id, subPopupEle);
        },
      };
    }, [parentContext]);

    // ======================== UniqueContext =========================
    const uniqueContext = React.useContext(UniqueContext);

    // =========================== Popup ============================
    const id = useId();
    const [popupEle, setPopupEle] = React.useState<HTMLDivElement>(null);

    // Used for forwardRef popup. Not use internal
    const externalPopupRef = React.useRef<HTMLDivElement>(null);

    const setPopupRef = useEvent((node: HTMLDivElement) => {
      externalPopupRef.current = node;

      if (isDOM(node) && popupEle !== node) {
        setPopupEle(node);
      }

      parentContext?.registerSubPopup(id, node);
    });

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    const [targetEle, setTargetEle] = React.useState<HTMLElement>(null);

    // Used for forwardRef target. Not use internal
    const externalForwardRef = React.useRef<HTMLElement>(null);

    const setTargetRef = useEvent((node: HTMLElement) => {
      if (isDOM(node) && targetEle !== node) {
        setTargetEle(node);
        externalForwardRef.current = node;
      }
    });

    // ========================== Children ==========================
    const child = React.Children.only(children);
    const originChildProps = child?.props || {};
    const cloneProps: Pick<
      React.HTMLAttributes<HTMLElement>,
      | 'onClick'
      | 'onTouchStart'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onMouseMove'
      | 'onPointerEnter'
      | 'onPointerLeave'
      | 'onFocus'
      | 'onBlur'
      | 'onContextMenu'
    > = {};

    const inPopupOrChild = useEvent((ele: EventTarget) => {
      const childDOM = targetEle;

      return (
        childDOM?.contains(ele as HTMLElement) ||
        getShadowRoot(childDOM)?.host === ele ||
        ele === childDOM ||
        popupEle?.contains(ele as HTMLElement) ||
        getShadowRoot(popupEle)?.host === ele ||
        ele === popupEle ||
        Object.values(subPopupElements.current).some(
          (subPopupEle) =>
            subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
        )
      );
    });

    // =========================== Arrow ============================
    const innerArrow: ArrowTypeOuter = arrow
      ? {
          // true and Object likely
          ...(arrow !== true ? arrow : {}),
        }
      : null;

    // ============================ Open ============================
    const [internalOpen, setInternalOpen] = React.useState(
      defaultPopupVisible || false,
    );

    // Render still use props as first priority
    const mergedOpen = popupVisible ?? internalOpen;

    // We use effect sync here in case `popupVisible` back to `undefined`
    const setMergedOpen = useEvent((nextOpen: boolean) => {
      if (openUncontrolled) {
        setInternalOpen(nextOpen);
      }
    });

    // Support ref
    const isOpen = useEvent(() => mergedOpen);

    useLayoutEffect(() => {
      setInternalOpen(popupVisible || false);
    }, [popupVisible]);

    // Extract common options for UniqueProvider
    const getUniqueOptions = useEvent((delay: number = 0) => ({
      popup,
      target: targetEle,
      delay,
      prefixCls,
      popupClassName,
      uniqueContainerClassName,
      uniqueContainerStyle,
      popupStyle,
      popupPlacement,
      builtinPlacements,
      popupAlign,
      zIndex,
      mask,
      maskClosable,
      popupMotion,
      maskMotion,
      arrow: innerArrow,
      getPopupContainer,
      getPopupClassNameFromAlign,
      id,
    }));

    // Handle controlled state changes for UniqueProvider
    // Only sync to UniqueProvider when it's controlled mode
    // If there is a parentContext, don't call uniqueContext methods
    useLayoutEffect(() => {
      if (
        uniqueContext &&
        unique &&
        targetEle &&
        !openUncontrolled &&
        !parentContext
      ) {
        if (mergedOpen) {
          uniqueContext.show(getUniqueOptions(mouseEnterDelay), isOpen);
        } else {
          uniqueContext.hide(mouseLeaveDelay);
        }
      }
    }, [mergedOpen, targetEle]);

    const openRef = React.useRef(mergedOpen);
    openRef.current = mergedOpen;

    const lastTriggerRef = React.useRef<boolean[]>([]);
    lastTriggerRef.current = [];

    const internalTriggerOpen = useEvent((nextOpen: boolean) => {
      setMergedOpen(nextOpen);

      // Enter or Pointer will both trigger open state change
      // We only need take one to avoid duplicated change event trigger
      // Use `lastTriggerRef` to record last open type
      if (
        (lastTriggerRef.current[lastTriggerRef.current.length - 1] ??
          mergedOpen) !== nextOpen
      ) {
        lastTriggerRef.current.push(nextOpen);
        onOpenChange?.(nextOpen);
        onPopupVisibleChange?.(nextOpen);
      }
    });

    // Trigger for delay
    const delayInvoke = useDelay();

    const triggerOpen = (nextOpen: boolean, delay = 0) => {
      // If it's controlled mode, always use internal trigger logic
      // UniqueProvider will be synced through useLayoutEffect
      if (popupVisible !== undefined) {
        delayInvoke(() => {
          internalTriggerOpen(nextOpen);
        }, delay);
        return;
      }

      // If UniqueContext exists and not controlled, pass delay to Provider instead of handling it internally
      // If there is a parentContext, don't call uniqueContext methods
      if (uniqueContext && unique && openUncontrolled && !parentContext) {
        if (nextOpen) {
          uniqueContext.show(getUniqueOptions(delay), isOpen);
        } else {
          uniqueContext.hide(delay);
        }
        return;
      }

      delayInvoke(() => {
        internalTriggerOpen(nextOpen);
      }, delay);
    };

    // ========================== Motion ============================
    const [inMotion, setInMotion] = React.useState(false);

    useLayoutEffect(
      (firstMount) => {
        if (!firstMount || mergedOpen) {
          setInMotion(true);
        }
      },
      [mergedOpen],
    );

    const [motionPrepareResolve, setMotionPrepareResolve] =
      React.useState<VoidFunction>(null);

    // =========================== Align ============================
    const [mousePos, setMousePos] = React.useState<
      [x: number, y: number] | null
    >(null);

    const setMousePosByEvent = (
      event: Pick<React.MouseEvent, 'clientX' | 'clientY'>,
    ) => {
      setMousePos([event.clientX, event.clientY]);
    };

    const [
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      arrowX,
      arrowY,
      scaleX,
      scaleY,
      alignInfo,
      onAlign,
    ] = useAlign(
      mergedOpen,
      popupEle,
      alignPoint && mousePos !== null ? mousePos : targetEle,
      popupPlacement,
      builtinPlacements,
      popupAlign,
      onPopupAlign,
      isMobile,
    );

    const [showActions, hideActions] = useAction(
      action,
      showAction,
      hideAction,
    );

    const clickToShow = showActions.has('click');
    const clickToHide =
      hideActions.has('click') || hideActions.has('contextMenu');

    const triggerAlign = useEvent(() => {
      if (!inMotion) {
        onAlign();
      }
    });

    const onScroll = () => {
      if (openRef.current && alignPoint && clickToHide) {
        triggerOpen(false);
      }
    };

    useWatch(mergedOpen, targetEle, popupEle, triggerAlign, onScroll);

    useLayoutEffect(() => {
      triggerAlign();
    }, [mousePos, popupPlacement]);

    // When no builtinPlacements and popupAlign changed
    useLayoutEffect(() => {
      if (mergedOpen && !builtinPlacements?.[popupPlacement]) {
        triggerAlign();
      }
    }, [JSON.stringify(popupAlign)]);

    const alignedClassName = React.useMemo(() => {
      const baseClassName = getAlignPopupClassName(
        builtinPlacements,
        prefixCls,
        alignInfo,
        alignPoint,
      );

      return clsx(baseClassName, getPopupClassNameFromAlign?.(alignInfo));
    }, [
      alignInfo,
      getPopupClassNameFromAlign,
      builtinPlacements,
      prefixCls,
      alignPoint,
    ]);

    // ============================ Refs ============================
    React.useImperativeHandle(ref, () => ({
      nativeElement: externalForwardRef.current,
      popupElement: externalPopupRef.current,
      forceAlign: triggerAlign,
    }));

    // ========================== Stretch ===========================
    const [targetWidth, setTargetWidth] = React.useState(0);
    const [targetHeight, setTargetHeight] = React.useState(0);

    const syncTargetSize = () => {
      if (stretch && targetEle) {
        const rect = targetEle.getBoundingClientRect();
        setTargetWidth(rect.width);
        setTargetHeight(rect.height);
      }
    };

    const onTargetResize = () => {
      syncTargetSize();
      triggerAlign();
    };

    // ========================== Motion ============================
    const onVisibleChanged = (visible: boolean) => {
      setInMotion(false);
      onAlign();
      afterOpenChange?.(visible);
      afterPopupVisibleChange?.(visible);
    };

    // We will trigger align when motion is in prepare
    const onPrepare = () =>
      new Promise<void>((resolve) => {
        syncTargetSize();
        setMotionPrepareResolve(() => resolve);
      });

    useLayoutEffect(() => {
      if (motionPrepareResolve) {
        onAlign();
        motionPrepareResolve();
        setMotionPrepareResolve(null);
      }
    }, [motionPrepareResolve]);

    // =========================== Action ===========================
    /**
     * Util wrapper for trigger action
     * @param eventName  Listen event name
     * @param nextOpen  Next open state after trigger
     * @param delay Delay to trigger open change
     * @param callback Callback if current event need additional action
     * @param ignoreCheck  Ignore current event if check return true
     */
    function wrapperAction<Event extends React.SyntheticEvent>(
      eventName: string,
      nextOpen: boolean,
      delay?: number,
      callback?: (event: Event) => void,
      ignoreCheck?: () => boolean,
    ) {
      cloneProps[eventName] = (event: any, ...args: any[]) => {
        if (!ignoreCheck || !ignoreCheck()) {
          callback?.(event);
          triggerOpen(nextOpen, delay);
        }

        // Pass to origin
        originChildProps[eventName]?.(event, ...args);
      };
    }

    // ======================= Action: Touch ========================
    const touchToShow = showActions.has('touch');
    const touchToHide = hideActions.has('touch');

    /** Used for prevent `hover` event conflict with mobile env */
    const touchedRef = React.useRef(false);

    if (touchToShow || touchToHide) {
      cloneProps.onTouchStart = (...args: any[]) => {
        touchedRef.current = true;

        if (openRef.current && touchToHide) {
          triggerOpen(false);
        } else if (!openRef.current && touchToShow) {
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.onTouchStart?.(...args);
      };
    }

    // ======================= Action: Click ========================
    if (clickToShow || clickToHide) {
      cloneProps.onClick = (
        event: React.MouseEvent<HTMLElement>,
        ...args: any[]
      ) => {
        if (openRef.current && clickToHide) {
          triggerOpen(false);
        } else if (!openRef.current && clickToShow) {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        // Pass to origin
        originChildProps.onClick?.(event, ...args);
        touchedRef.current = false;
      };
    }

    // Click to hide is special action since click popup element should not hide
    const onPopupPointerDown = useWinClick(
      mergedOpen,
      clickToHide || touchToHide,
      targetEle,
      popupEle,
      mask,
      maskClosable,
      inPopupOrChild,
      triggerOpen,
    );

    // ======================= Action: Hover ========================
    const hoverToShow = showActions.has('hover');
    const hoverToHide = hideActions.has('hover');

    let onPopupMouseEnter: React.MouseEventHandler<HTMLDivElement>;
    let onPopupMouseLeave: VoidFunction;

    const ignoreMouseTrigger = () => {
      return touchedRef.current;
    };

    if (hoverToShow) {
      const onMouseEnterCallback = (event: React.MouseEvent) => {
        setMousePosByEvent(event);
      };

      // Compatible with old browser which not support pointer event
      wrapperAction<React.MouseEvent>(
        'onMouseEnter',
        true,
        mouseEnterDelay,
        onMouseEnterCallback,
        ignoreMouseTrigger,
      );
      wrapperAction<React.PointerEvent>(
        'onPointerEnter',
        true,
        mouseEnterDelay,
        onMouseEnterCallback,
        ignoreMouseTrigger,
      );

      onPopupMouseEnter = (event) => {
        // Only trigger re-open when popup is visible
        if (
          (mergedOpen || inMotion) &&
          popupEle?.contains(event.target as HTMLElement)
        ) {
          triggerOpen(true, mouseEnterDelay);
        }
      };

      // Align Point
      if (alignPoint) {
        cloneProps.onMouseMove = (event: React.MouseEvent) => {
          originChildProps.onMouseMove?.(event);
        };
      }
    }

    if (hoverToHide) {
      wrapperAction(
        'onMouseLeave',
        false,
        mouseLeaveDelay,
        undefined,
        ignoreMouseTrigger,
      );
      wrapperAction(
        'onPointerLeave',
        false,
        mouseLeaveDelay,
        undefined,
        ignoreMouseTrigger,
      );

      onPopupMouseLeave = () => {
        triggerOpen(false, mouseLeaveDelay);
      };
    }

    // ======================= Action: Focus ========================
    if (showActions.has('focus')) {
      wrapperAction('onFocus', true, focusDelay);
    }

    if (hideActions.has('focus')) {
      wrapperAction('onBlur', false, blurDelay);
    }

    // ==================== Action: ContextMenu =====================
    if (showActions.has('contextMenu')) {
      cloneProps.onContextMenu = (event: React.MouseEvent, ...args: any[]) => {
        if (openRef.current && hideActions.has('contextMenu')) {
          triggerOpen(false);
        } else {
          setMousePosByEvent(event);
          triggerOpen(true);
        }

        event.preventDefault();

        // Pass to origin
        originChildProps.onContextMenu?.(event, ...args);
      };
    }

    // ============================ Perf ============================
    const rendedRef = React.useRef(false);
    rendedRef.current ||= forceRender || mergedOpen || inMotion;

    // =========================== Render ===========================
    const mergedChildrenProps = {
      ...originChildProps,
      ...cloneProps,
    };

    // Pass props into cloneProps for nest usage
    const passedProps: Record<string, any> = {};
    const passedEventList = [
      'onContextMenu',
      'onClick',
      'onMouseDown',
      'onTouchStart',
      'onMouseEnter',
      'onMouseLeave',
      'onFocus',
      'onBlur',
    ];

    passedEventList.forEach((eventName) => {
      if (restProps[eventName]) {
        passedProps[eventName] = (...args: any[]) => {
          mergedChildrenProps[eventName]?.(...args);
          restProps[eventName](...args);
        };
      }
    });

    const arrowPos: ArrowPos = {
      x: arrowX,
      y: arrowY,
    };

    // Child Node
    const triggerNode = React.cloneElement(child, {
      ...mergedChildrenProps,
      ...passedProps,
    });

    // Render
    return (
      <>
        <ResizeObserver
          disabled={!mergedOpen}
          ref={setTargetRef}
          onResize={onTargetResize}
        >
          {triggerNode}
        </ResizeObserver>
        {rendedRef.current && (!uniqueContext || !unique) && (
          <TriggerContext.Provider value={context}>
            <Popup
              portal={PortalComponent}
              ref={setPopupRef}
              prefixCls={prefixCls}
              popup={popup}
              className={clsx(popupClassName, !isMobile && alignedClassName)}
              style={popupStyle}
              target={targetEle}
              onMouseEnter={onPopupMouseEnter}
              onMouseLeave={onPopupMouseLeave}
              // https://github.com/ant-design/ant-design/issues/43924
              onPointerEnter={onPopupMouseEnter}
              zIndex={zIndex}
              // Open
              open={mergedOpen}
              keepDom={inMotion}
              fresh={fresh}
              // Click
              onClick={onPopupClick}
              onPointerDownCapture={onPopupPointerDown}
              // Mask
              mask={mask}
              // Motion
              motion={popupMotion}
              maskMotion={maskMotion}
              onVisibleChanged={onVisibleChanged}
              onPrepare={onPrepare}
              // Portal
              forceRender={forceRender}
              autoDestroy={mergedAutoDestroy}
              getPopupContainer={getPopupContainer}
              // Arrow
              align={alignInfo}
              arrow={innerArrow}
              arrowPos={arrowPos}
              // Align
              ready={ready}
              offsetX={offsetX}
              offsetY={offsetY}
              offsetR={offsetR}
              offsetB={offsetB}
              onAlign={triggerAlign}
              // Stretch
              stretch={stretch}
              targetWidth={targetWidth / scaleX}
              targetHeight={targetHeight / scaleY}
              // Mobile
              mobile={mobile}
            />
          </TriggerContext.Provider>
        )}
      </>
    );
  });

  if (process.env.NODE_ENV !== 'production') {
    Trigger.displayName = 'Trigger';
  }

  return Trigger;
}

export default generateTrigger(Portal);

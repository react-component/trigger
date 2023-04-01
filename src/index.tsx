import Portal from '@rc-component/portal';
import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import ResizeObserver from 'rc-resize-observer';
import { isDOM } from 'rc-util/lib/Dom/findDOMNode';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useId from 'rc-util/lib/hooks/useId';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import isMobile from 'rc-util/lib/isMobile';
import warning from 'rc-util/lib/warning';
import * as React from 'react';
import type { TriggerContextProps } from './context';
import TriggerContext from './context';
import useAction from './hooks/useAction';
import useAlign from './hooks/useAlign';
import useWatch from './hooks/useWatch';
import type {
  ActionType,
  AlignType,
  AnimationType,
  BuildInPlacements,
  TransitionNameType,
} from './interface';
import Popup from './Popup';
import TriggerWrapper from './TriggerWrapper';
import { getAlignPopupClassName, getMotion, getWin } from './util';

export type { BuildInPlacements, AlignType, ActionType };

export interface TriggerRef {
  forceAlign: VoidFunction;
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export interface TriggerProps {
  children: React.ReactElement;
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
  onPopupVisibleChange?: (visible: boolean) => void;
  afterPopupVisibleChange?: (visible: boolean) => void;

  // =================== Portal ====================
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  forceRender?: boolean;
  autoDestroy?: boolean;

  /** @deprecated Please use `autoDestroy` instead */
  destroyPopupOnHide?: boolean;

  // ==================== Mask =====================
  mask?: boolean;
  maskClosable?: boolean;

  // =================== Motion ====================
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
  maskAnimation?: AnimationType;

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
  popupStyle?: React.CSSProperties;
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  onPopupClick?: React.MouseEventHandler<HTMLDivElement>;

  alignPoint?: boolean; // Maybe we can support user pass position in the future

  // ==================== Arrow ====================
  arrow?: boolean;

  // ================= Deprecated ==================
  /** @deprecated Add `className` on `children`. Please add `className` directly instead. */
  className?: string;

  // =================== Private ===================
  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: React.ReactInstance) => HTMLElement;

  // // ========================== Mobile ==========================
  // /** @private Bump fixed position at bottom in mobile.
  //  * This is internal usage currently, do not use in your prod */
  // mobile?: MobileConfig;
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
      destroyPopupOnHide,

      // Popup
      popup,
      popupClassName,
      popupStyle,

      popupPlacement,
      builtinPlacements = {},
      popupAlign,
      zIndex,
      stretch,
      getPopupClassNameFromAlign,

      alignPoint,

      onPopupClick,
      onPopupAlign,

      // Arrow
      arrow,

      // Motion
      popupMotion,
      maskMotion,
      popupTransitionName,
      popupAnimation,
      maskTransitionName,
      maskAnimation,

      // Deprecated
      className,

      // Private
      getTriggerDOMNode,

      ...restProps
    } = props;

    const mergedAutoDestroy = autoDestroy || destroyPopupOnHide || false;

    // =========================== Mobile ===========================
    const [mobile, setMobile] = React.useState(false);
    useLayoutEffect(() => {
      setMobile(isMobile());
    }, []);

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

    // =========================== Popup ============================
    const id = useId();
    const [popupEle, setPopupEle] = React.useState<HTMLDivElement>(null);

    const setPopupRef = useEvent((node: HTMLDivElement) => {
      if (isDOM(node) && popupEle !== node) {
        setPopupEle(node);
      }

      parentContext?.registerSubPopup(id, node);
    });

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    const [targetEle, setTargetEle] = React.useState<HTMLElement>(null);

    const setTargetRef = useEvent((node: HTMLElement) => {
      if (isDOM(node) && targetEle !== node) {
        setTargetEle(node);
      }
    });

    // ========================== Children ==========================
    const child = React.Children.only(children) as React.ReactElement;
    const originChildProps = child?.props || {};
    const cloneProps: typeof originChildProps = {};

    const inPopupOrChild = useEvent((ele: any) => {
      const childDOM = targetEle;

      return (
        childDOM?.contains(ele) ||
        (childDOM?.getRootNode() as ShadowRoot)?.host === ele ||
        ele === childDOM ||
        popupEle?.contains(ele) ||
        (popupEle?.getRootNode() as ShadowRoot)?.host === ele ||
        ele === popupEle ||
        Object.values(subPopupElements.current).some(
          (subPopupEle) => subPopupEle?.contains(ele) || ele === subPopupEle,
        )
      );
    });

    // =========================== Motion ===========================
    const mergePopupMotion = getMotion(
      prefixCls,
      popupMotion,
      popupAnimation,
      popupTransitionName,
    );

    const mergeMaskMotion = getMotion(
      prefixCls,
      maskMotion,
      maskAnimation,
      maskTransitionName,
    );

    // ============================ Open ============================
    const [internalOpen, setInternalOpen] = React.useState(
      defaultPopupVisible || false,
    );

    // Render still use props as first priority
    const mergedOpen = popupVisible ?? internalOpen;

    // We use effect sync here in case `popupVisible` back to `undefined`
    const setMergedOpen = useEvent((nextOpen: boolean) => {
      if (popupVisible === undefined) {
        setInternalOpen(nextOpen);
      }
    });

    useLayoutEffect(() => {
      setInternalOpen(popupVisible || false);
    }, [popupVisible]);

    const openRef = React.useRef(mergedOpen);
    openRef.current = mergedOpen;

    const internalTriggerOpen = useEvent((nextOpen: boolean) => {
      if (mergedOpen !== nextOpen) {
        setMergedOpen(nextOpen);
        onPopupVisibleChange?.(nextOpen);
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

    // ========================== Motion ============================
    const [inMotion, setInMotion] = React.useState(false);
    const mountRef = React.useRef(true);

    useLayoutEffect(() => {
      if (!mountRef.current || mergedOpen) {
        setInMotion(true);
      }
      mountRef.current = true;
    }, [mergedOpen]);

    const [motionPrepareResolve, setMotionPrepareResolve] =
      React.useState<VoidFunction>(null);

    // =========================== Align ============================
    const [mousePos, setMousePos] = React.useState<[x: number, y: number]>([
      0, 0,
    ]);

    const setMousePosByEvent = (event: React.MouseEvent) => {
      setMousePos([event.clientX, event.clientY]);
    };

    const [
      ready,
      offsetX,
      offsetY,
      arrowX,
      arrowY,
      scaleX,
      scaleY,
      alignInfo,
      onAlign,
    ] = useAlign(
      mergedOpen,
      popupEle,
      alignPoint ? mousePos : targetEle,
      popupPlacement,
      builtinPlacements,
      popupAlign,
      onPopupAlign,
    );

    const triggerAlign = useEvent(() => {
      if (!inMotion) {
        onAlign();
      }
    });

    useWatch(mergedOpen, targetEle, popupEle, triggerAlign);

    useLayoutEffect(() => {
      triggerAlign();
    }, [mousePos]);

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

      return classNames(baseClassName, getPopupClassNameFromAlign?.(alignInfo));
    }, [
      alignInfo,
      getPopupClassNameFromAlign,
      builtinPlacements,
      prefixCls,
      alignPoint,
    ]);

    React.useImperativeHandle(ref, () => ({
      forceAlign: triggerAlign,
    }));

    // ========================== Motion ============================
    const onVisibleChanged = (visible: boolean) => {
      setInMotion(false);
      onAlign();
      afterPopupVisibleChange?.(visible);
    };

    // We will trigger align when motion is in prepare
    const onPrepare = () =>
      new Promise<void>((resolve) => {
        setMotionPrepareResolve(() => resolve);
      });

    useLayoutEffect(() => {
      if (motionPrepareResolve) {
        onAlign();
        motionPrepareResolve();
        setMotionPrepareResolve(null);
      }
    }, [motionPrepareResolve]);

    // ========================== Stretch ===========================
    const [targetWidth, setTargetWidth] = React.useState(0);
    const [targetHeight, setTargetHeight] = React.useState(0);

    const onTargetResize = (_: object, ele: HTMLElement) => {
      triggerAlign();

      if (stretch) {
        const rect = ele.getBoundingClientRect();
        setTargetWidth(rect.width);
        setTargetHeight(rect.height);
      }
    };

    // =========================== Action ===========================
    const [showActions, hideActions] = useAction(
      mobile,
      action,
      showAction,
      hideAction,
    );

    // Util wrapper for trigger action
    const wrapperAction = (
      eventName: string,
      nextOpen: boolean,
      delay?: number,
      preEvent?: (event: any) => void,
    ) => {
      cloneProps[eventName] = (event: any, ...args: any[]) => {
        preEvent?.(event);
        triggerOpen(nextOpen, delay);

        // Pass to origin
        originChildProps[eventName]?.(event, ...args);
      };
    };

    // ======================= Action: Click ========================
    const clickToShow = showActions.has('click');
    const clickToHide =
      hideActions.has('click') || hideActions.has('contextMenu');

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
      };
    }

    // Click to hide is special action since click popup element should not hide
    React.useEffect(() => {
      if (clickToHide && popupEle && (!mask || maskClosable)) {
        const onWindowClick = ({ target }: MouseEvent) => {
          if (openRef.current && !inPopupOrChild(target)) {
            triggerOpen(false);
          }
        };

        const win = getWin(popupEle);

        const targetRoot = targetEle?.getRootNode();

        win.addEventListener('click', onWindowClick);

        // shadow root
        const inShadow = targetRoot && targetRoot !== targetEle.ownerDocument;
        if (inShadow) {
          (targetRoot as ShadowRoot).addEventListener('click', onWindowClick);
        }

        // Warning if target and popup not in same root
        if (process.env.NODE_ENV !== 'production') {
          const popupRoot = popupEle.getRootNode();

          warning(
            targetRoot === popupRoot,
            `trigger element and popup element should in same shadow root.`,
          );
        }

        return () => {
          win.removeEventListener('click', onWindowClick);

          if (inShadow) {
            (targetRoot as ShadowRoot).removeEventListener(
              'click',
              onWindowClick,
            );
          }
        };
      }
    }, [clickToHide, targetEle, popupEle, mask, maskClosable]);

    // ======================= Action: Hover ========================
    const hoverToShow = showActions.has('hover');
    const hoverToHide = hideActions.has('hover');

    let onPopupMouseEnter: VoidFunction;
    let onPopupMouseLeave: VoidFunction;

    if (hoverToShow) {
      wrapperAction('onMouseEnter', true, mouseEnterDelay, (event) => {
        setMousePosByEvent(event);
      });
      onPopupMouseEnter = () => {
        triggerOpen(true, mouseEnterDelay);
      };

      // Align Point
      if (alignPoint) {
        cloneProps.onMouseMove = (event: React.MouseEvent) => {
          // setMousePosByEvent(event);
          originChildProps.onMouseMove?.(event);
        };
      }
    }

    if (hoverToHide) {
      wrapperAction('onMouseLeave', false, mouseLeaveDelay);
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
        setMousePosByEvent(event);
        triggerOpen(true);
        event.preventDefault();

        // Pass to origin
        originChildProps.onContextMenu?.(event, ...args);
      };
    }

    // ========================= ClassName ==========================
    if (className) {
      cloneProps.className = classNames(originChildProps.className, className);
    }

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
          <TriggerWrapper getTriggerDOMNode={getTriggerDOMNode}>
            {triggerNode}
          </TriggerWrapper>
        </ResizeObserver>
        <TriggerContext.Provider value={context}>
          <Popup
            portal={PortalComponent}
            ref={setPopupRef}
            prefixCls={prefixCls}
            popup={popup}
            className={classNames(popupClassName, alignedClassName)}
            style={popupStyle}
            target={targetEle}
            onMouseEnter={onPopupMouseEnter}
            onMouseLeave={onPopupMouseLeave}
            zIndex={zIndex}
            // Open
            open={mergedOpen}
            keepDom={inMotion}
            // Click
            onClick={onPopupClick}
            // Mask
            mask={mask}
            // Motion
            motion={mergePopupMotion}
            maskMotion={mergeMaskMotion}
            onVisibleChanged={onVisibleChanged}
            onPrepare={onPrepare}
            // Portal
            forceRender={forceRender}
            autoDestroy={mergedAutoDestroy}
            getPopupContainer={getPopupContainer}
            // Arrow
            align={alignInfo}
            arrow={arrow}
            // Align
            ready={ready}
            offsetX={offsetX}
            offsetY={offsetY}
            arrowX={arrowX}
            arrowY={arrowY}
            onAlign={triggerAlign}
            // Stretch
            stretch={stretch}
            targetWidth={targetWidth / scaleX}
            targetHeight={targetHeight / scaleY}
          />
        </TriggerContext.Provider>
      </>
    );
  });

  if (process.env.NODE_ENV !== 'production') {
    Trigger.displayName = 'Trigger';
  }

  return Trigger;
}

export default generateTrigger(Portal);

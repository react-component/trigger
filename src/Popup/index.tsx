import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import CSSMotion from 'rc-motion';
import ResizeObserver from 'rc-resize-observer';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import { composeRef } from 'rc-util/lib/ref';
import * as React from 'react';
import type { TriggerProps } from '../';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';
import Arrow from './Arrow';
import Mask from './Mask';
import PopupContent from './PopupContent';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onPointerEnter?: React.MouseEventHandler<HTMLDivElement>;
  zIndex?: number;

  mask?: boolean;
  onVisibleChanged: (visible: boolean) => void;

  // Arrow
  align?: AlignType;
  arrow?: ArrowTypeOuter;
  arrowPos: ArrowPos;

  // Open
  open: boolean;
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean;
  fresh?: boolean;

  // Click
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  // Motion
  motion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;

  // Portal
  forceRender?: boolean;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  autoDestroy?: boolean;
  portal: React.ComponentType<any>;

  // Align
  ready: boolean;
  offsetX: number;
  offsetY: number;
  offsetR: number;
  offsetB: number;
  onAlign: VoidFunction;
  onPrepare: () => Promise<void>;

  // stretch
  stretch?: string;
  targetWidth?: number;
  targetHeight?: number;
}

const Popup = React.forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const {
    popup,
    className,
    prefixCls,
    style,
    target,

    onVisibleChanged,

    // Open
    open,
    keepDom,
    fresh,

    // Click
    onClick,

    // Mask
    mask,

    // Arrow
    arrow,
    arrowPos,
    align,

    // Motion
    motion,
    maskMotion,

    // Portal
    forceRender,
    getPopupContainer,
    autoDestroy,
    portal: Portal,

    zIndex,

    onMouseEnter,
    onMouseLeave,
    onPointerEnter,

    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    onAlign,
    onPrepare,

    stretch,
    targetWidth,
    targetHeight,
  } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;

  // We can not remove holder only when motion finished.
  const isNodeVisible = open || keepDom;

  // ======================= Container ========================
  const getPopupContainerNeedParams = getPopupContainer?.length > 0;

  const [show, setShow] = React.useState(
    !getPopupContainer || !getPopupContainerNeedParams,
  );

  // Delay to show since `getPopupContainer` need target element
  useLayoutEffect(() => {
    if (!show && getPopupContainerNeedParams && target) {
      setShow(true);
    }
  }, [show, getPopupContainerNeedParams, target]);

  // ========================= Render =========================
  if (!show) {
    return null;
  }

  // >>>>> Offset
  const AUTO = 'auto' as const;

  const offsetStyle: React.CSSProperties = {
    left: '-1000vw',
    top: '-1000vh',
    right: AUTO,
    bottom: AUTO,
  };

  // Set align style
  if (ready || !open) {
    const { points } = align;
    const dynamicInset =
      align.dynamicInset || (align as any)._experimental?.dynamicInset;
    const alignRight = dynamicInset && points[0][1] === 'r';
    const alignBottom = dynamicInset && points[0][0] === 'b';

    if (alignRight) {
      offsetStyle.right = offsetR;
      offsetStyle.left = AUTO;
    } else {
      offsetStyle.left = offsetX;
      offsetStyle.right = AUTO;
    }

    if (alignBottom) {
      offsetStyle.bottom = offsetB;
      offsetStyle.top = AUTO;
    } else {
      offsetStyle.top = offsetY;
      offsetStyle.bottom = AUTO;
    }
  }

  // >>>>> Misc
  const miscStyle: React.CSSProperties = {};
  if (stretch) {
    if (stretch.includes('height') && targetHeight) {
      miscStyle.height = targetHeight;
    } else if (stretch.includes('minHeight') && targetHeight) {
      miscStyle.minHeight = targetHeight;
    }
    if (stretch.includes('width') && targetWidth) {
      miscStyle.width = targetWidth;
    } else if (stretch.includes('minWidth') && targetWidth) {
      miscStyle.minWidth = targetWidth;
    }
  }

  if (!open) {
    miscStyle.pointerEvents = 'none';
  }

  return (
    <Portal
      open={forceRender || isNodeVisible}
      getContainer={getPopupContainer && (() => getPopupContainer(target))}
      autoDestroy={autoDestroy}
    >
      <Mask
        prefixCls={prefixCls}
        open={open}
        zIndex={zIndex}
        mask={mask}
        motion={maskMotion}
      />
      <ResizeObserver onResize={onAlign} disabled={!open}>
        {(resizeObserverRef) => {
          return (
            <CSSMotion
              motionAppear
              motionEnter
              motionLeave
              removeOnLeave={false}
              forceRender={forceRender}
              leavedClassName={`${prefixCls}-hidden`}
              {...motion}
              onAppearPrepare={onPrepare}
              onEnterPrepare={onPrepare}
              visible={open}
              onVisibleChanged={(nextVisible) => {
                motion?.onVisibleChanged?.(nextVisible);
                onVisibleChanged(nextVisible);
              }}
            >
              {(
                { className: motionClassName, style: motionStyle },
                motionRef,
              ) => {
                const cls = classNames(prefixCls, motionClassName, className);

                return (
                  <div
                    ref={composeRef(resizeObserverRef, ref, motionRef)}
                    className={cls}
                    style={
                      {
                        '--arrow-x': `${arrowPos.x || 0}px`,
                        '--arrow-y': `${arrowPos.y || 0}px`,
                        ...offsetStyle,
                        ...miscStyle,
                        ...motionStyle,
                        boxSizing: 'border-box',
                        zIndex,
                        ...style,
                      } as React.CSSProperties
                    }
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onPointerEnter={onPointerEnter}
                    onClick={onClick}
                  >
                    {arrow && (
                      <Arrow
                        prefixCls={prefixCls}
                        arrow={arrow}
                        arrowPos={arrowPos}
                        align={align}
                      />
                    )}
                    <PopupContent cache={!open && !fresh}>
                      {childNode}
                    </PopupContent>
                  </div>
                );
              }}
            </CSSMotion>
          );
        }}
      </ResizeObserver>
    </Portal>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}

export default Popup;

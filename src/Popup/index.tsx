import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import CSSMotion from 'rc-motion';
import ResizeObserver from 'rc-resize-observer';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import { composeRef } from 'rc-util/lib/ref';
import * as React from 'react';
import type { TriggerProps } from '../';
import type { AlignType } from '../interface';
import Arrow from './Arrow';
import Mask from './Mask';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  zIndex?: number;

  mask?: boolean;
  onVisibleChanged: (visible: boolean) => void;

  // Arrow
  align?: AlignType;
  arrow?: boolean;
  arrowX?: number;
  arrowY?: number;

  // Open
  open: boolean;
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean;

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

    // Click
    onClick,

    // Mask
    mask,

    // Arrow
    arrow,
    align,
    arrowX,
    arrowY,

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

    ready,
    offsetX,
    offsetY,
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
  const offsetStyle: React.CSSProperties =
    ready || !open
      ? {
          left: offsetX,
          top: offsetY,
        }
      : {
          left: '-1000vw',
          top: '-1000vh',
        };

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
                    style={{
                      ...offsetStyle,
                      ...miscStyle,
                      ...motionStyle,
                      boxSizing: 'border-box',
                      zIndex,
                      ...style,
                    }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={onClick}
                  >
                    {arrow && (
                      <Arrow
                        prefixCls={prefixCls}
                        align={align}
                        arrowX={arrowX}
                        arrowY={arrowY}
                      />
                    )}
                    {childNode}
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

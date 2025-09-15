import classNames from 'classnames';
import type { CSSMotionProps } from '@rc-component/motion';
import CSSMotion from '@rc-component/motion';
import ResizeObserver from '@rc-component/resize-observer';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import { composeRef } from '@rc-component/util/lib/ref';
import * as React from 'react';
import type { TriggerProps } from '../';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';
import Arrow from './Arrow';
import Mask from './Mask';
import PopupContent from './PopupContent';

export interface MobileConfig {
  mask?: boolean;
  /** Set popup motion. You can ref `rc-motion` for more info. */
  motion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;
}

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onPointerEnter?: React.MouseEventHandler<HTMLDivElement>;
  onPointerDownCapture?: React.MouseEventHandler<HTMLDivElement>;
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

  children?: React.ReactElement;

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

  // Mobile
  mobile?: MobileConfig;
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

    // Mobile
    mobile,

    // Portal
    forceRender,
    getPopupContainer,
    autoDestroy,
    portal: Portal,
    children,

    zIndex,

    onMouseEnter,
    onMouseLeave,
    onPointerEnter,
    onPointerDownCapture,

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

  const popupContent = typeof popup === 'function' ? popup() : popup;

  // We can not remove holder only when motion finished.
  const isNodeVisible = open || keepDom;

  // ========================= Mobile =========================
  const isMobile = !!mobile;

  // ========================== Mask ==========================
  const [mergedMask, mergedMaskMotion, mergedPopupMotion] = React.useMemo<
    [
      mask: boolean,
      maskMotion: CSSMotionProps | undefined,
      popupMotion: CSSMotionProps | undefined,
    ]
  >(() => {
    if (mobile) {
      return [mobile.mask, mobile.maskMotion, mobile.motion];
    }

    return [mask, maskMotion, motion];
  }, [mobile, mask, maskMotion, motion]);

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

  // TODO: Move offsetStyle logic to useOffsetStyle.ts hooks
  // >>>>> Offset
  const AUTO = 'auto' as const;

  const offsetStyle: React.CSSProperties = isMobile
    ? {}
    : {
        left: '-1000vw',
        top: '-1000vh',
        right: AUTO,
        bottom: AUTO,
      };

  // Set align style
  if (!isMobile && (ready || !open)) {
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
        mask={mergedMask}
        motion={mergedMaskMotion}
        mobile={isMobile}
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
              {...mergedPopupMotion}
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
                const cls = classNames(prefixCls, motionClassName, className, {
                  [`${prefixCls}-mobile`]: isMobile,
                });

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
                    onPointerDownCapture={onPointerDownCapture}
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
                      {popupContent}
                    </PopupContent>
                  </div>
                );
              }}
            </CSSMotion>
          );
        }}
      </ResizeObserver>
      {children}
    </Portal>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}

export default Popup;

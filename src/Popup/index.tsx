import Portal from '@rc-component/portal';
import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import CSSMotion from 'rc-motion';
import ResizeObserver from 'rc-resize-observer';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '../';
import Mask from './Mask';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  zIndex?: number;

  mask?: boolean;

  // Motion
  motion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;

  // Portal
  forceRender?: boolean;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  autoDestroy?: boolean;

  // Align
  ready: boolean;
  offsetX: number;
  offsetY: number;
  onAlign: VoidFunction;

  // stretch
  stretch?: string;
  targetWidth?: number;
  targetHeight?: number;
}

const Popup = React.forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const {
    open,
    popup,
    className,
    prefixCls,
    style,
    target,

    // Mask
    mask,

    // Motion
    motion,
    maskMotion,

    // Portal
    forceRender,
    getPopupContainer,
    autoDestroy,

    zIndex,

    onMouseEnter,
    onMouseLeave,

    ready,
    offsetX,
    offsetY,
    onAlign,

    stretch,
    targetWidth,
    targetHeight,
  } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;

  // ========================== Open ==========================
  const [inMotion, setInMotion] = React.useState(false);

  useLayoutEffect(() => {
    setInMotion(true);
  }, [open]);

  // We can not remove holder only when motion finished.
  const isNodeVisible = open || inMotion;

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
  const offsetStyle: React.CSSProperties = ready
    ? {
        left: offsetX,
        top: offsetY,
      }
    : {
        left: '-1000vw',
        top: '-1000vh',
      };

  // >>>>> Stretch
  const stretchStyle: React.CSSProperties = {};
  if (stretch) {
    if (stretch.includes('height') && targetHeight) {
      stretchStyle.height = targetHeight;
    } else if (stretch.includes('minHeight') && targetHeight) {
      stretchStyle.minHeight = targetHeight;
    }
    if (stretch.includes('width') && targetWidth) {
      stretchStyle.width = targetWidth;
    } else if (stretch.includes('minWidth') && targetWidth) {
      stretchStyle.minWidth = targetWidth;
    }
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
        <CSSMotion
          motionAppear
          motionEnter
          motionLeave
          removeOnLeave={false}
          {...motion}
          leavedClassName={`${prefixCls}-hidden`}
          visible={open}
          onVisibleChanged={(nextVisible) => {
            motion?.onVisibleChanged?.(nextVisible);
            setInMotion(false);
          }}
        >
          {({ className: motionClassName, style: motionStyle }) => {
            return (
              <div
                ref={ref}
                className={classNames(prefixCls, motionClassName, className)}
                style={{
                  ...offsetStyle,
                  ...stretchStyle,
                  ...motionStyle,
                  boxSizing: 'border-box',
                  zIndex,
                  ...style,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                {childNode}
              </div>
            );
          }}
        </CSSMotion>
      </ResizeObserver>
    </Portal>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}

export default Popup;

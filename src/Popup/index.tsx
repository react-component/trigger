import Portal from '@rc-component/portal';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '../';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  getPopupContainer?: TriggerProps['getPopupContainer'];
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  zIndex?: number;

  ready: boolean;
  offsetX: number;
  offsetY: number;
  onAlign: VoidFunction;
}

const Popup = React.forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const {
    open,
    popup,
    className,
    prefixCls,
    style,
    target,

    getPopupContainer,
    zIndex,

    onMouseEnter,
    onMouseLeave,

    ready,
    offsetX,
    offsetY,
    onAlign,
  } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;

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

  const offsetStyle: React.CSSProperties = ready
    ? {
        left: offsetX,
        top: offsetY,
      }
    : {
        left: '-100vw',
        top: '-100vh',
        visibility: 'hidden',
      };

  return (
    <Portal
      open={open}
      getContainer={getPopupContainer && (() => getPopupContainer(target))}
    >
      <ResizeObserver onResize={onAlign} disabled={!open}>
        <div
          ref={ref}
          className={classNames(prefixCls, className)}
          style={{
            ...offsetStyle,
            boxSizing: 'border-box',
            zIndex,
            ...style,
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {childNode}
        </div>
      </ResizeObserver>
    </Portal>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}

export default Popup;

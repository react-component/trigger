import Portal from '@rc-component/portal';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '../';
import useWatch from '../hooks/useWatch';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  placement?: TriggerProps['popupPlacement'];
  getPopupContainer?: TriggerProps['getPopupContainer'];
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
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
    placement = 'top',

    onMouseEnter,
    onMouseLeave,
  } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;

  // ========================== Ref ===========================
  const [popupEle, setPopupEle] = React.useState<HTMLDivElement>(null);
  const setPopupRef = React.useCallback((node: HTMLDivElement) => {
    setPopupEle(node);
  }, []);

  React.useImperativeHandle(ref, () => popupEle);

  // ========================= Align ==========================
  const [offsetX, setOffsetX] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);
  const alignCountRef = React.useRef(0);

  const onAlign = useEvent(() => {
    const popupElement = popupEle;

    const originLeft = popupElement.style.left;
    const originTop = popupElement.style.top;

    // Reset first
    popupElement.style.left = '0';
    popupElement.style.top = '0';

    // Calculate align style, we should consider `transform` case
    const targetRect = target.getBoundingClientRect();
    const popupRect = popupElement.getBoundingClientRect();
    const { width, height } = getComputedStyle(popupElement);
    const { clientWidth, clientHeight } = document.documentElement;

    // Reset back
    popupElement.style.left = originLeft;
    popupElement.style.top = originTop;

    // Calculate scale
    const scaleX =
      Math.round((popupRect.width / parseFloat(width)) * 1000) / 1000;
    const scaleY =
      Math.round((popupRect.height / parseFloat(height)) * 1000) / 1000;

    // console.log(
    //   'Popup Scale:',
    //   scaleX,
    //   scaleY,
    //   // popupRect.width,
    //   // popupRect.height,
    //   // width,
    //   // height,
    // );

    // Placement
    let nextOffsetX = targetRect.x - popupRect.x;
    let nextOffsetY = targetRect.y - popupRect.y;

    let placementOffsetX = nextOffsetX;
    let placementOffsetY = nextOffsetY;

    switch (placement) {
      case 'top':
        placementOffsetY -= popupRect.height;
        break;

      case 'bottom':
        placementOffsetY += targetRect.height;
        break;

      case 'left':
        placementOffsetX -= popupRect.width;
        break;

      case 'right':
        placementOffsetX += targetRect.width;
        break;

      default:
        break;
    }

    // Check if in the screen
    const nextPopupX = popupRect.x + placementOffsetX;
    const nextPopupY = popupRect.y + placementOffsetY;
    const nextPopupRight = nextPopupX + popupRect.width;
    const nextPopupBottom = nextPopupY + popupRect.height;

    if (
      // In viewport
      nextPopupX >= 0 &&
      nextPopupRight <= clientWidth &&
      nextPopupY >= 0 &&
      nextPopupBottom <= clientHeight
    ) {
      nextOffsetX = placementOffsetX;
      nextOffsetY = placementOffsetY;
    }

    setOffsetX(nextOffsetX / scaleX);
    setOffsetY(nextOffsetY / scaleY);
  });

  const triggerAlign = () => {
    alignCountRef.current += 1;
    const id = alignCountRef.current;

    // Merge all align requirement into one frame
    Promise.resolve().then(() => {
      if (alignCountRef.current === id) {
        onAlign();
      }
    });
  };

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

  // ========================= Watch ==========================
  useWatch(open, target, popupEle, triggerAlign);

  // ========================= Render =========================
  if (!show) {
    return null;
  }

  return (
    <Portal
      open={open}
      getContainer={getPopupContainer && (() => getPopupContainer(target))}
    >
      <ResizeObserver onResize={triggerAlign} disabled={!open}>
        <div
          ref={setPopupRef}
          className={classNames(prefixCls, className)}
          style={{
            left: offsetX,
            top: offsetY,
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

import Portal from '@rc-component/portal';
import classNames from 'classnames';
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
  getPopupContainer?: TriggerProps['getPopupContainer'];
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
  } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;
  const popupRef = React.useRef<HTMLDivElement>(null);

  // ========================== Ref ===========================
  React.useImperativeHandle(ref, () => popupRef.current);

  // ========================= Align ==========================
  const [offsetX, setOffsetX] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);
  const alignCountRef = React.useRef(0);

  const onAlign = useEvent(() => {
    const popupElement = popupRef.current;

    // Reset first
    const originTransform = popupElement.style.transform;
    popupElement.style.transform = '';

    // Calculate align style, we should consider `transform` case
    const targetRect = target.getBoundingClientRect();
    const popupRect = popupElement.getBoundingClientRect();
    const { width, height } = getComputedStyle(popupElement);

    popupElement.style.transform = originTransform;

    const scaleX =
      Math.round((popupRect.width / parseFloat(width)) * 1000) / 1000;
    const scaleY =
      Math.round((popupRect.height / parseFloat(height)) * 1000) / 1000;

    console.log(
      'Popup Scale:',
      scaleX,
      scaleY,
      // popupRect.width,
      // popupRect.height,
      // width,
      // height,
    );

    const nextOffsetX = targetRect.x - popupRect.x;
    const nextOffsetY = targetRect.y - popupRect.y;

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
  useWatch(open, target, () => popupRef.current, triggerAlign);

  // ========================= Render =========================
  if (!show) {
    return null;
  }

  return (
    <Portal
      open={open}
      getContainer={
        getPopupContainer &&
        (() => {
          console.log('get target!', target);
          return getPopupContainer(target);
        })
      }
    >
      <div
        ref={popupRef}
        className={classNames(prefixCls, className)}
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
          ...style,
        }}
        onMouseEnter={null}
        onMouseLeave={null}
      >
        {childNode}
      </div>
    </Portal>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Popup.displayName = 'Popup';
}

export default Popup;

import Portal from '@rc-component/portal';
import classNames from 'classnames';
import useEvent from 'rc-util/lib/hooks/useEvent';
import * as React from 'react';
import useWatch from '../hooks/useWatch';

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  popup?: React.ReactNode | (() => React.ReactNode);
  target: () => HTMLElement;
}

const Popup = React.forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const { open, popup, className, prefixCls, style, target } = props;

  const childNode = typeof popup === 'function' ? popup() : popup;
  const popupRef = React.useRef<HTMLDivElement>(null);

  // ========================= Align ==========================
  const [offsetX, setOffsetX] = React.useState(0);
  const [offsetY, setOffsetY] = React.useState(0);
  const alignCountRef = React.useRef(0);

  const onAlign = useEvent(() => {
    const popupElement = popupRef.current;
    const targetElement = target();

    // Reset first
    const originTransform = popupElement.style.transform;
    popupElement.style.transform = '';

    // Calculate align style, we should consider `transform` case
    const targetRect = targetElement.getBoundingClientRect();
    const popupRect = popupElement.getBoundingClientRect();
    const { width, height } = getComputedStyle(popupElement);

    popupElement.style.transform = originTransform;

    const scaleX =
      Math.floor((popupRect.width / parseFloat(width)) * 100) / 100;
    const scaleY =
      Math.floor((popupRect.height / parseFloat(height)) * 100) / 100;

    // console.log(
    //   'Popup:',
    //   scaleX,
    //   scaleY,
    //   popupRect.width,
    //   popupRect.height,
    //   width,
    //   height,
    // );

    const nextOffsetX = targetRect.x - popupRect.x;
    const nextOffsetY = targetRect.y - popupRect.y;

    setOffsetX(nextOffsetX);
    setOffsetY(nextOffsetY);
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

  // ========================= Watch ==========================
  useWatch(open, target, () => popupRef.current, triggerAlign);

  // ========================= Render =========================
  return (
    <Portal open={open}>
      <div
        ref={popupRef}
        className={classNames(prefixCls, className)}
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
          ...style,
        }}
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

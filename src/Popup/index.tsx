import Portal from '@rc-component/portal';
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '../';
import useWatch from '../hooks/useWatch';
import type { AlignPointLeftRight, AlignPointTopBottom } from '../interface';

type Points = [topBottom: AlignPointTopBottom, leftRight: AlignPointLeftRight];

function splitPoints(points: string = ''): Points {
  return [points[0] as any, points[1] as any];
}

function getAlignPoint(rect: DOMRect, points: Points) {
  const topBottom = points[0];
  const leftRight = points[1];

  let x: number;
  let y: number;

  // Top & Bottom
  if (topBottom === 't') {
    y = rect.y;
  } else if (topBottom === 'b') {
    y = rect.y + rect.height;
  } else {
    y = rect.y + rect.height / 2;
  }

  // Left & Right
  if (leftRight === 'l') {
    x = rect.x;
  } else if (leftRight === 'r') {
    x = rect.x + rect.width;
  } else {
    x = rect.x + rect.width / 2;
  }

  return { x, y };
}

export interface PopupProps {
  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  open: boolean;
  popup?: TriggerProps['popup'];
  target: HTMLElement;
  placement?: TriggerProps['popupPlacement'];
  builtinPlacements?: TriggerProps['builtinPlacements'];
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
    placement,
    builtinPlacements,

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

    const popupHeight = popupRect.height;
    const popupWidth = popupRect.width;

    // Reset back
    popupElement.style.left = originLeft;
    popupElement.style.top = originTop;

    // Calculate scale
    const scaleX = Math.round((popupWidth / parseFloat(width)) * 1000) / 1000;
    const scaleY = Math.round((popupHeight / parseFloat(height)) * 1000) / 1000;

    // Placement
    const placementInfo = builtinPlacements[placement] || {};
    const [popupPoint, targetPoint] = placementInfo.points || [];
    const targetPoints = splitPoints(targetPoint);
    const popupPoints = splitPoints(popupPoint);

    const targetAlignPoint = getAlignPoint(targetRect, targetPoints);
    const popupAlignPoint = getAlignPoint(popupRect, popupPoints);

    // Offset
    const { offset } = placementInfo;
    const [popupOffsetX = 0, popupOffsetY = 0] = offset || [];
    console.log('offset', offset, popupOffsetX, popupOffsetY);

    // Placement
    let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
    let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;

    // ================ Overflow =================
    const targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l']);
    const popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l']);
    const targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r']);
    const popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r']);

    const overflow = placementInfo.overflow || {};
    const { adjustX, adjustY } = overflow;

    // >>>>>>>>>> Top & Bottom
    const nextPopupY = popupRect.y + nextOffsetY;
    const nextPopupBottom = nextPopupY + popupHeight;

    const needAdjustY = adjustY === true || adjustY >= 0;

    // Bottom to Top
    if (
      needAdjustY &&
      popupPoints[0] === 't' &&
      nextPopupBottom > clientHeight
    ) {
      const measureNextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y;

      nextOffsetY = measureNextOffsetY;
    }

    // Top to Bottom
    if (needAdjustY && popupPoints[0] === 'b' && nextPopupY < 0) {
      const measureNextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y;

      nextOffsetY = measureNextOffsetY;
    }

    // >>>>>>>>>> Left & Right
    const nextPopupX = popupRect.x + nextOffsetX;
    const nextPopupRight = nextPopupX + popupWidth;

    const needAdjustX = adjustX === true || adjustX >= 0;

    // >>>>> Flip
    // Right to Left
    if (needAdjustX && popupPoints[1] === 'l' && nextPopupRight > clientWidth) {
      const measureNextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x;

      nextOffsetX = measureNextOffsetX;
    }

    // Left to Right
    if (needAdjustX && popupPoints[1] === 'r' && nextPopupX < 0) {
      const measureNextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x;

      nextOffsetX = measureNextOffsetX;
    }

    // >>>>> Shift
    if (adjustX === 'shift') {
      // Left
      if (nextPopupX < 0) {
        console.log('no!');
        nextOffsetX -= nextPopupX;
      }

      // Right
      if (nextPopupRight > clientWidth) {
        nextOffsetX -= nextPopupRight - clientWidth;
      }
    }

    if (adjustY === 'shift') {
      // Top
      if (nextPopupY < 0) {
        nextOffsetY -= nextPopupY;
      }

      // Bottom
      if (nextPopupBottom > clientHeight) {
        nextOffsetY -= nextPopupBottom - clientHeight;
      }
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

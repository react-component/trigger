import { isDOM } from 'rc-util/lib/Dom/findDOMNode';
import isVisible from 'rc-util/lib/Dom/isVisible';
import useEvent from 'rc-util/lib/hooks/useEvent';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '..';
import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
} from '../interface';
import { collectScroller, getVisibleArea, getWin, toNum } from '../util';

type Rect = Record<'x' | 'y' | 'width' | 'height', number>;

type Points = [topBottom: AlignPointTopBottom, leftRight: AlignPointLeftRight];

function splitPoints(points: string = ''): Points {
  return [points[0] as any, points[1] as any];
}

function getAlignPoint(rect: Rect, points: Points) {
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

function reversePoints(points: Points, index: number): string {
  const reverseMap = {
    t: 'b',
    b: 't',
    l: 'r',
    r: 'l',
  };

  return points
    .map((point, i) => {
      if (i === index) {
        return reverseMap[point] || 'c';
      }
      return point;
    })
    .join('');
}

export default function useAlign(
  open: boolean,
  popupEle: HTMLElement,
  target: HTMLElement | [x: number, y: number],
  placement: string,
  builtinPlacements: any,
  popupAlign?: AlignType,
  onPopupAlign?: TriggerProps['onPopupAlign'],
): [
  ready: boolean,
  offsetX: number,
  offsetY: number,
  arrowX: number,
  arrowY: number,
  scaleX: number,
  scaleY: number,
  align: AlignType,
  onAlign: VoidFunction,
] {
  const [offsetInfo, setOffsetInfo] = React.useState<{
    ready: boolean;
    offsetX: number;
    offsetY: number;
    arrowX: number;
    arrowY: number;
    scaleX: number;
    scaleY: number;
    align: AlignType;
  }>({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    arrowX: 0,
    arrowY: 0,
    scaleX: 1,
    scaleY: 1,
    align: builtinPlacements[placement] || {},
  });
  const alignCountRef = React.useRef(0);

  const scrollerList = React.useMemo(() => {
    if (!popupEle) {
      return [];
    }

    return collectScroller(popupEle);
  }, [popupEle]);

  // ========================= Flip ==========================
  // We will memo flip info.
  // If size change to make flip, it will memo the flip info and use it in next align.
  const prevFlipRef = React.useRef<{
    tb?: boolean;
    bt?: boolean;
    lr?: boolean;
    rl?: boolean;
  }>({});

  const resetFlipCache = () => {
    prevFlipRef.current = {};
  };

  if (!open) {
    resetFlipCache();
  }

  // ========================= Align =========================
  const onAlign = useEvent(() => {
    if (popupEle && target && open) {
      const popupElement = popupEle;

      const originLeft = popupElement.style.left;
      const originTop = popupElement.style.top;

      const doc = popupElement.ownerDocument;
      const win = getWin(popupElement);

      // Placement
      const placementInfo: AlignType = {
        ...builtinPlacements[placement],
        ...popupAlign,
      };

      // Reset first
      popupElement.style.left = '0';
      popupElement.style.top = '0';

      // Calculate align style, we should consider `transform` case
      let targetRect: Rect;
      if (Array.isArray(target)) {
        targetRect = {
          x: target[0],
          y: target[1],
          width: 0,
          height: 0,
        };
      } else {
        const rect = target.getBoundingClientRect();
        targetRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }
      const popupRect = popupElement.getBoundingClientRect();
      const { width, height } = win.getComputedStyle(popupElement);
      const {
        clientWidth,
        clientHeight,
        scrollWidth,
        scrollHeight,
        scrollTop,
        scrollLeft,
      } = doc.documentElement;

      const popupHeight = popupRect.height;
      const popupWidth = popupRect.width;

      const targetHeight = targetRect.height;
      const targetWidth = targetRect.width;

      // Get bounding of visible area
      let visibleArea =
        placementInfo.htmlRegion === 'scroll'
          ? // Scroll region should take scrollLeft & scrollTop into account
            {
              left: -scrollLeft,
              top: -scrollTop,
              right: scrollWidth - scrollLeft,
              bottom: scrollHeight - scrollTop,
            }
          : {
              left: 0,
              top: 0,
              right: clientWidth,
              bottom: clientHeight,
            };

      visibleArea = getVisibleArea(visibleArea, scrollerList);

      // Reset back
      popupElement.style.left = originLeft;
      popupElement.style.top = originTop;

      // Calculate scale
      const scaleX = toNum(
        Math.round((popupWidth / parseFloat(width)) * 1000) / 1000,
      );
      const scaleY = toNum(
        Math.round((popupHeight / parseFloat(height)) * 1000) / 1000,
      );

      // No need to align since it's not visible in view
      if (
        scaleX === 0 ||
        scaleY === 0 ||
        (isDOM(target) && !isVisible(target))
      ) {
        return;
      }

      // Offset
      const { offset, targetOffset } = placementInfo;
      const [popupOffsetX = 0, popupOffsetY = 0] = offset || [];
      const [targetOffsetX = 0, targetOffsetY = 0] = targetOffset || [];

      targetRect.x += targetOffsetX;
      targetRect.y += targetOffsetY;

      // Points
      const [popupPoint, targetPoint] = placementInfo.points || [];
      const targetPoints = splitPoints(targetPoint);
      const popupPoints = splitPoints(popupPoint);

      const targetAlignPoint = getAlignPoint(targetRect, targetPoints);
      const popupAlignPoint = getAlignPoint(popupRect, popupPoints);

      // Real align info may not same as origin one
      const nextAlignInfo = {
        ...placementInfo,
      };

      // Next Offset
      let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
      let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;

      // ============== Intersection ===============
      // Get area by position. Used for check if flip area is better
      function getIntersectionVisibleArea(offsetX: number, offsetY: number) {
        const l = popupRect.x + offsetX;
        const t = popupRect.y + offsetY;

        const r = l + popupWidth;
        const b = t + popupHeight;

        const visibleL = Math.max(l, visibleArea.left);
        const visibleT = Math.max(t, visibleArea.top);
        const visibleR = Math.min(r, visibleArea.right);
        const visibleB = Math.min(b, visibleArea.bottom);

        return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT));
      }

      const originIntersectionVisibleArea = getIntersectionVisibleArea(
        nextOffsetX,
        nextOffsetY,
      );

      // ========================== Overflow ===========================
      const targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l']);
      const popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l']);
      const targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r']);
      const popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r']);

      const overflow = placementInfo.overflow || {};
      const { adjustX, adjustY, shiftX, shiftY } = overflow;

      const supportAdjust = (val: boolean | number) => {
        if (typeof val === 'boolean') {
          return val;
        }
        return val >= 0;
      };

      // Prepare position
      let nextPopupY: number;
      let nextPopupBottom: number;
      let nextPopupX: number;
      let nextPopupRight: number;

      function syncNextPopupPosition() {
        nextPopupY = popupRect.y + nextOffsetY;
        nextPopupBottom = nextPopupY + popupHeight;
        nextPopupX = popupRect.x + nextOffsetX;
        nextPopupRight = nextPopupX + popupWidth;
      }
      syncNextPopupPosition();

      // >>>>>>>>>> Top & Bottom
      const needAdjustY = supportAdjust(adjustY);

      const sameTB = popupPoints[0] === targetPoints[0];

      // Bottom to Top
      if (
        needAdjustY &&
        popupPoints[0] === 't' &&
        (nextPopupBottom > visibleArea.bottom || prevFlipRef.current.bt)
      ) {
        let tmpNextOffsetY: number = nextOffsetY;

        if (sameTB) {
          tmpNextOffsetY -= popupHeight - targetHeight;
        } else {
          tmpNextOffsetY =
            targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;
        }

        if (
          getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY) >=
          originIntersectionVisibleArea
        ) {
          prevFlipRef.current.bt = true;
          nextOffsetY = tmpNextOffsetY;

          nextAlignInfo.points = [
            reversePoints(popupPoints, 0),
            reversePoints(targetPoints, 0),
          ];
        } else {
          prevFlipRef.current.bt = false;
        }
      }

      // Top to Bottom
      if (
        needAdjustY &&
        popupPoints[0] === 'b' &&
        (nextPopupY < visibleArea.top || prevFlipRef.current.tb)
      ) {
        let tmpNextOffsetY: number = nextOffsetY;

        if (sameTB) {
          tmpNextOffsetY += popupHeight - targetHeight;
        } else {
          tmpNextOffsetY =
            targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;
        }

        if (
          getIntersectionVisibleArea(nextOffsetX, tmpNextOffsetY) >=
          originIntersectionVisibleArea
        ) {
          prevFlipRef.current.tb = true;
          nextOffsetY = tmpNextOffsetY;

          nextAlignInfo.points = [
            reversePoints(popupPoints, 0),
            reversePoints(targetPoints, 0),
          ];
        } else {
          prevFlipRef.current.tb = false;
        }
      }

      // >>>>>>>>>> Left & Right
      const needAdjustX = supportAdjust(adjustX);

      // >>>>> Flip
      const sameLR = popupPoints[1] === targetPoints[1];

      // Right to Left
      if (
        needAdjustX &&
        popupPoints[1] === 'l' &&
        (nextPopupRight > visibleArea.right || prevFlipRef.current.rl)
      ) {
        let tmpNextOffsetX: number = nextOffsetX;

        if (sameLR) {
          tmpNextOffsetX -= popupWidth - targetWidth;
        } else {
          tmpNextOffsetX =
            targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;
        }

        if (
          getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY) >=
          originIntersectionVisibleArea
        ) {
          prevFlipRef.current.rl = true;
          nextOffsetX = tmpNextOffsetX;

          nextAlignInfo.points = [
            reversePoints(popupPoints, 1),
            reversePoints(targetPoints, 1),
          ];
        } else {
          prevFlipRef.current.rl = false;
        }
      }

      // Left to Right
      if (
        needAdjustX &&
        popupPoints[1] === 'r' &&
        (nextPopupX < visibleArea.left || prevFlipRef.current.lr)
      ) {
        let tmpNextOffsetX: number = nextOffsetX;

        if (sameLR) {
          tmpNextOffsetX += popupWidth - targetWidth;
        } else {
          tmpNextOffsetX =
            targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;
        }

        if (
          getIntersectionVisibleArea(tmpNextOffsetX, nextOffsetY) >=
          originIntersectionVisibleArea
        ) {
          prevFlipRef.current.lr = true;
          nextOffsetX = tmpNextOffsetX;

          nextAlignInfo.points = [
            reversePoints(popupPoints, 1),
            reversePoints(targetPoints, 1),
          ];
        } else {
          prevFlipRef.current.lr = false;
        }
      }

      // ============================ Shift ============================
      syncNextPopupPosition();

      const numShiftX = shiftX === true ? 0 : shiftX;
      if (typeof numShiftX === 'number') {
        // Left
        if (nextPopupX < visibleArea.left) {
          nextOffsetX -= nextPopupX - visibleArea.left;

          if (targetRect.x + targetWidth < visibleArea.left + numShiftX) {
            nextOffsetX +=
              targetRect.x - visibleArea.left + targetWidth - numShiftX;
          }
        }

        // Right
        if (nextPopupRight > visibleArea.right) {
          nextOffsetX -= nextPopupRight - visibleArea.right;

          if (targetRect.x > visibleArea.right - numShiftX) {
            nextOffsetX += targetRect.x - visibleArea.right + numShiftX;
          }
        }
      }

      const numShiftY = shiftY === true ? 0 : shiftY;
      if (typeof numShiftY === 'number') {
        // Top
        if (nextPopupY < visibleArea.top) {
          nextOffsetY -= nextPopupY - visibleArea.top;

          if (targetRect.y + targetHeight < visibleArea.top + numShiftY) {
            nextOffsetY +=
              targetRect.y - visibleArea.top + targetHeight - numShiftY;
          }
        }

        // Bottom
        if (nextPopupBottom > visibleArea.bottom) {
          nextOffsetY -= nextPopupBottom - visibleArea.bottom;

          if (targetRect.y > visibleArea.bottom - numShiftY) {
            nextOffsetY += targetRect.y - visibleArea.bottom + numShiftY;
          }
        }
      }

      // ============================ Arrow ============================
      // Arrow center align
      const popupLeft = popupRect.x + nextOffsetX;
      const popupRight = popupLeft + popupWidth;
      const popupTop = popupRect.y + nextOffsetY;
      const popupBottom = popupTop + popupHeight;

      const targetLeft = targetRect.x;
      const targetRight = targetLeft + targetWidth;
      const targetTop = targetRect.y;
      const targetBottom = targetTop + targetHeight;

      const maxLeft = Math.max(popupLeft, targetLeft);
      const minRight = Math.min(popupRight, targetRight);

      const xCenter = (maxLeft + minRight) / 2;
      const nextArrowX = xCenter - popupLeft;

      const maxTop = Math.max(popupTop, targetTop);
      const minBottom = Math.min(popupBottom, targetBottom);

      const yCenter = (maxTop + minBottom) / 2;
      const nextArrowY = yCenter - popupTop;

      onPopupAlign?.(popupEle, nextAlignInfo);

      setOffsetInfo({
        ready: true,
        offsetX: nextOffsetX / scaleX,
        offsetY: nextOffsetY / scaleY,
        arrowX: nextArrowX / scaleX,
        arrowY: nextArrowY / scaleY,
        scaleX,
        scaleY,
        align: nextAlignInfo,
      });
    }
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

  // Reset ready status when placement & open changed
  const resetReady = () => {
    setOffsetInfo((ori) => ({
      ...ori,
      ready: false,
    }));
  };

  useLayoutEffect(resetReady, [placement]);

  useLayoutEffect(() => {
    if (!open) {
      resetReady();
    }
  }, [open]);

  return [
    offsetInfo.ready,
    offsetInfo.offsetX,
    offsetInfo.offsetY,
    offsetInfo.arrowX,
    offsetInfo.arrowY,
    offsetInfo.scaleX,
    offsetInfo.scaleY,
    offsetInfo.align,
    triggerAlign,
  ];
}

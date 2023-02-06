import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
} from '../interface';
import { getWin } from '../util';

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
  popupEle: HTMLElement,
  target: HTMLElement,
  placement: string,
  builtinPlacements: any,
  popupAlign?: AlignType,
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

  const onAlign = () => {
    if (popupEle && target) {
      const popupElement = popupEle;

      const originLeft = popupElement.style.left;
      const originTop = popupElement.style.top;

      const doc = popupElement.ownerDocument;
      const win = getWin(popupElement);

      // Reset first
      popupElement.style.left = '0';
      popupElement.style.top = '0';

      // Calculate align style, we should consider `transform` case
      const targetRect = target.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect();
      const { width, height } = win.getComputedStyle(popupElement);
      const { clientWidth, clientHeight } = doc.documentElement;

      const popupHeight = popupRect.height;
      const popupWidth = popupRect.width;

      // Reset back
      popupElement.style.left = originLeft;
      popupElement.style.top = originTop;

      // Calculate scale
      const scaleX = Math.round((popupWidth / parseFloat(width)) * 1000) / 1000;
      const scaleY =
        Math.round((popupHeight / parseFloat(height)) * 1000) / 1000;

      // Placement
      const placementInfo: AlignType = builtinPlacements[placement] || popupAlign || {};
      const [popupPoint, targetPoint] = placementInfo.points || [];
      const targetPoints = splitPoints(targetPoint);
      const popupPoints = splitPoints(popupPoint);

      const targetAlignPoint = getAlignPoint(targetRect, targetPoints);
      const popupAlignPoint = getAlignPoint(popupRect, popupPoints);

      // Real align info may not same as origin one
      const nextAlignInfo = {
        ...placementInfo,
      };

      // Offset
      const { offset } = placementInfo;
      const [popupOffsetX = 0, popupOffsetY = 0] = offset || [];

      // Placement
      let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX;
      let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY;

      // ================ Overflow =================
      const targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l']);
      const popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l']);
      const targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r']);
      const popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r']);

      const overflow = placementInfo.overflow || {};
      const { adjustX, adjustY, shiftX, shiftY } = overflow;

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
        nextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;

        nextAlignInfo.points = [
          reversePoints(popupPoints, 0),
          reversePoints(targetPoints, 0),
        ];
      }

      // Top to Bottom
      if (needAdjustY && popupPoints[0] === 'b' && nextPopupY < 0) {
        nextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;

        nextAlignInfo.points = [
          reversePoints(popupPoints, 0),
          reversePoints(targetPoints, 0),
        ];
      }

      // >>>>>>>>>> Left & Right
      const nextPopupX = popupRect.x + nextOffsetX;
      const nextPopupRight = nextPopupX + popupWidth;

      const needAdjustX = adjustX === true || adjustX >= 0;

      // >>>>> Flip
      // Right to Left
      if (
        needAdjustX &&
        popupPoints[1] === 'l' &&
        nextPopupRight > clientWidth
      ) {
        nextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;

        nextAlignInfo.points = [
          reversePoints(popupPoints, 1),
          reversePoints(targetPoints, 1),
        ];
      }

      // Left to Right
      if (needAdjustX && popupPoints[1] === 'r' && nextPopupX < 0) {
        nextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;

        nextAlignInfo.points = [
          reversePoints(popupPoints, 1),
          reversePoints(targetPoints, 1),
        ];
      }

      // >>>>> Shift
      const numShiftX = shiftX === true ? 0 : shiftX;
      if (typeof numShiftX === 'number') {
        // Left
        if (nextPopupX < 0) {
          nextOffsetX -= nextPopupX;

          if (targetRect.x + targetRect.width < numShiftX) {
            nextOffsetX += targetRect.x + targetRect.width - numShiftX;
          }
        }

        // Right
        if (nextPopupRight > clientWidth) {
          nextOffsetX -= nextPopupRight - clientWidth;

          if (targetRect.x > clientWidth - numShiftX) {
            nextOffsetX += targetRect.x - clientWidth + numShiftX;
          }
        }
      }

      const numShiftY = shiftY === true ? 0 : shiftY;
      if (typeof numShiftY === 'number') {
        // Top
        if (nextPopupY < 0) {
          nextOffsetY -= nextPopupY;

          if (targetRect.y + targetRect.height < numShiftY) {
            nextOffsetY += targetRect.y + targetRect.height - numShiftY;
          }
        }

        // Bottom
        if (nextPopupBottom > clientHeight) {
          nextOffsetY -= nextPopupBottom - clientHeight;

          if (targetRect.y > clientHeight - numShiftY) {
            nextOffsetY += targetRect.y - clientHeight + numShiftY;
          }
        }
      }

      // Arrow center align
      const popupLeft = popupRect.x + nextOffsetX;
      const popupRight = popupLeft + popupWidth;
      const popupTop = popupRect.y + nextOffsetY;
      const popupBottom = popupTop + popupHeight;

      const targetLeft = targetRect.x;
      const targetRight = targetLeft + targetRect.width;
      const targetTop = targetRect.y;
      const targetBottom = targetTop + targetRect.height;

      const maxLeft = Math.max(popupLeft, targetLeft);
      const minRight = Math.min(popupRight, targetRight);

      const xCenter = (maxLeft + minRight) / 2;
      const nextArrowX = xCenter - popupLeft;

      const maxTop = Math.max(popupTop, targetTop);
      const minBottom = Math.min(popupBottom, targetBottom);

      const yCenter = (maxTop + minBottom) / 2;
      const nextArrowY = yCenter - popupTop;

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
  };

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

  useLayoutEffect(() => {
    setOffsetInfo((ori) => ({
      ...ori,
      ready: false,
    }));
  }, [placement]);

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

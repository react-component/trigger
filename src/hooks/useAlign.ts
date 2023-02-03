import useEvent from 'rc-util/lib/hooks/useEvent';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
} from '../interface';

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
): [
  ready: boolean,
  offsetX: number,
  offsetY: number,
  scaleX: number,
  scaleY: number,
  align: AlignType,
  onAlign: VoidFunction,
] {
  const [offsetInfo, setOffsetInfo] = React.useState<{
    ready: boolean;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    align: AlignType;
  }>({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    align: builtinPlacements[placement] || {},
  });
  const alignCountRef = React.useRef(0);

  const onAlign = useEvent(() => {
    if (popupEle && target) {
      const popupElement = popupEle;

      const originLeft = popupElement.style.left;
      const originTop = popupElement.style.top;

      const doc = popupElement.ownerDocument;
      const win = doc.defaultView;

      // Reset first
      popupElement.style.left = '0';
      popupElement.style.top = '0';

      // Calculate align style, we should consider `transform` case
      const targetRect = target.getBoundingClientRect();
      const popupRect = popupElement.getBoundingClientRect();
      const { width, height } = win.getComputedStyle(popupElement);
      const { clientWidth, clientHeight } =
      doc.documentElement;

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
      const placementInfo: AlignType = builtinPlacements[placement] || {};
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
      if (adjustX === 'shift') {
        // Left
        if (nextPopupX < 0) {
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

      setOffsetInfo({
        ready: true,
        offsetX: nextOffsetX / scaleX,
        offsetY: nextOffsetY / scaleY,
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
    offsetInfo.scaleX,
    offsetInfo.scaleY,
    offsetInfo.align,
    triggerAlign,
  ];
}

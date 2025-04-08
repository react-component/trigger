import { isDOM } from '@rc-component/util/lib/Dom/findDOMNode';
import isVisible from '@rc-component/util/lib/Dom/isVisible';
import useEvent from '@rc-component/util/lib/hooks/useEvent';
import useLayoutEffect from '@rc-component/util/lib/hooks/useLayoutEffect';
import * as React from 'react';
import type { TriggerProps } from '..';
import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
  OffsetType,
} from '../interface';
import { collectScroller, getVisibleArea, getWin, toNum } from '../util';

type Rect = Record<'x' | 'y' | 'width' | 'height', number>;

type Points = [topBottom: AlignPointTopBottom, leftRight: AlignPointLeftRight];

function getUnitOffset(size: number, offset: OffsetType = 0) {
  const offsetStr = `${offset}`;
  const cells = offsetStr.match(/^(.*)\%$/);
  if (cells) {
    return size * (parseFloat(cells[1]) / 100);
  }
  return parseFloat(offsetStr);
}

function getNumberOffset(
  rect: { width: number; height: number },
  offset?: OffsetType[],
) {
  const [offsetX, offsetY] = offset || [];

  return [
    getUnitOffset(rect.width, offsetX),
    getUnitOffset(rect.height, offsetY),
  ];
}

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

const flipPriority = {
  vertical: ['tb', 'bt'],   // top to bottom, bottom to top
  horizontal: ['lr', 'rl'], // left to right, right to left
};

const getPriorityOrder = (isVerticalPriorityScene: boolean) => {
  const { vertical, horizontal } = flipPriority;
  return isVerticalPriorityScene
    ? [...vertical, ...horizontal]
    : [...horizontal, ...vertical];
}

// Add reverseMap function (if not already defined)
const reverseMap = {
  t: 'b',
  b: 't',
  l: 'r',
  r: 'l',
};

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
    offsetR: number,
    offsetB: number,
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
    offsetR: number;
    offsetB: number;
    arrowX: number;
    arrowY: number;
    scaleX: number;
    scaleY: number;
    align: AlignType;
  }>({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    offsetR: 0,
    offsetB: 0,
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

      const doc = popupElement.ownerDocument;
      const win = getWin(popupElement);

      const {
        width,
        height,
        position: popupPosition,
      } = win.getComputedStyle(popupElement);

      const originLeft = popupElement.style.left;
      const originTop = popupElement.style.top;
      const originRight = popupElement.style.right;
      const originBottom = popupElement.style.bottom;
      const originOverflow = popupElement.style.overflow;

      // Placement
      const placementInfo: AlignType = {
        ...builtinPlacements[placement],
        ...popupAlign,
      };

      // placeholder element
      const placeholderElement = doc.createElement('div');
      popupElement.parentElement?.appendChild(placeholderElement);
      placeholderElement.style.left = `${popupElement.offsetLeft}px`;
      placeholderElement.style.top = `${popupElement.offsetTop}px`;
      placeholderElement.style.position = popupPosition;
      placeholderElement.style.height = `${popupElement.offsetHeight}px`;
      placeholderElement.style.width = `${popupElement.offsetWidth}px`;

      // Reset first
      popupElement.style.left = '0';
      popupElement.style.top = '0';
      popupElement.style.right = 'auto';
      popupElement.style.bottom = 'auto';
      popupElement.style.overflow = 'hidden';

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
        rect.x = rect.x ?? rect.left;
        rect.y = rect.y ?? rect.top;
        targetRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }
      const popupRect = popupElement.getBoundingClientRect();
      popupRect.x = popupRect.x ?? popupRect.left;
      popupRect.y = popupRect.y ?? popupRect.top;
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
      const visibleRegion = {
        left: 0,
        top: 0,
        right: clientWidth,
        bottom: clientHeight,
      };

      const scrollRegion = {
        left: -scrollLeft,
        top: -scrollTop,
        right: scrollWidth - scrollLeft,
        bottom: scrollHeight - scrollTop,
      };

      let { htmlRegion } = placementInfo;
      const VISIBLE = 'visible' as const;
      const VISIBLE_FIRST = 'visibleFirst' as const;
      if (htmlRegion !== 'scroll' && htmlRegion !== VISIBLE_FIRST) {
        htmlRegion = VISIBLE;
      }
      const isVisibleFirst = htmlRegion === VISIBLE_FIRST;

      const scrollRegionArea = getVisibleArea(scrollRegion, scrollerList);
      const visibleRegionArea = getVisibleArea(visibleRegion, scrollerList);

      const visibleArea =
        htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea;

      // When set to `visibleFirst`,
      // the check `adjust` logic will use `visibleRegion` for check first.
      const adjustCheckVisibleArea = isVisibleFirst
        ? visibleRegionArea
        : visibleArea;

      // Record right & bottom align data
      popupElement.style.left = 'auto';
      popupElement.style.top = 'auto';
      popupElement.style.right = '0';
      popupElement.style.bottom = '0';

      const popupMirrorRect = popupElement.getBoundingClientRect();

      // Reset back
      popupElement.style.left = originLeft;
      popupElement.style.top = originTop;
      popupElement.style.right = originRight;
      popupElement.style.bottom = originBottom;
      popupElement.style.overflow = originOverflow;

      popupElement.parentElement?.removeChild(placeholderElement);

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
      let [popupOffsetX, popupOffsetY] = getNumberOffset(popupRect, offset);
      const [targetOffsetX, targetOffsetY] = getNumberOffset(
        targetRect,
        targetOffset,
      );

      targetRect.x -= targetOffsetX;
      targetRect.y -= targetOffsetY;

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
      function getIntersectionVisibleArea(
        offsetX: number,
        offsetY: number,
        area = visibleArea,
      ) {
        const l = popupRect.x + offsetX;
        const t = popupRect.y + offsetY;

        const r = l + popupWidth;
        const b = t + popupHeight;

        const visibleL = Math.max(l, area.left);
        const visibleT = Math.max(t, area.top);
        const visibleR = Math.min(r, area.right);
        const visibleB = Math.min(b, area.bottom);

        return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT));
      }

      const originIntersectionVisibleArea = getIntersectionVisibleArea(
        nextOffsetX,
        nextOffsetY,
      );

      // As `visibleFirst`, we prepare this for check
      const originIntersectionRecommendArea = getIntersectionVisibleArea(
        nextOffsetX,
        nextOffsetY,
        visibleRegionArea,
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

      // Add flip requirements collection object
      const flipRequirements = {
        tb: false, // Need to flip from top to bottom
        bt: false, // Need to flip from bottom to top
        lr: false, // Need to flip from left to right
        rl: false, // Need to flip from right to left
      };

      // Store potential post-flip offsets
      const potentialOffsets = {
        tb: { offsetX: nextOffsetX, offsetY: nextOffsetY, popupOffsetX, popupOffsetY },
        bt: { offsetX: nextOffsetX, offsetY: nextOffsetY, popupOffsetX, popupOffsetY },
        lr: { offsetX: nextOffsetX, offsetY: nextOffsetY, popupOffsetX, popupOffsetY },
        rl: { offsetX: nextOffsetX, offsetY: nextOffsetY, popupOffsetX, popupOffsetY },
      };

      // Store visible area size for each flip direction
      const visibleAreas = {
        tb: 0,
        bt: 0,
        lr: 0,
        rl: 0,
        original: originIntersectionVisibleArea,
      };

      // Store recommended area size for each flip direction (for visibleFirst scenario)
      const recommendAreas = {
        tb: 0,
        bt: 0,
        lr: 0,
        rl: 0,
        original: originIntersectionRecommendArea,
      };

      // Check Bottom to Top flip
      if (
        needAdjustY &&
        popupPoints[0] === 't' &&
        (nextPopupBottom > adjustCheckVisibleArea.bottom ||
          prevFlipRef.current.bt)
      ) {
        let tmpNextOffsetY = nextOffsetY;

        if (sameTB) {
          tmpNextOffsetY -= popupHeight - targetHeight;
        } else {
          tmpNextOffsetY =
            targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY;
        }

        // Calculate potential visible area
        visibleAreas.bt = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY
        );
        recommendAreas.bt = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
          visibleRegionArea
        );

        // Store potential offsets
        potentialOffsets.bt = {
          offsetX: nextOffsetX,
          offsetY: tmpNextOffsetY,
          popupOffsetX,
          popupOffsetY: -popupOffsetY
        };

        // Mark that bt flip needs to be checked
        flipRequirements.bt = true;
      }

      // Check Top to Bottom flip
      if (
        needAdjustY &&
        popupPoints[0] === 'b' &&
        (nextPopupY < adjustCheckVisibleArea.top || prevFlipRef.current.tb)
      ) {
        let tmpNextOffsetY = nextOffsetY;

        if (sameTB) {
          tmpNextOffsetY += popupHeight - targetHeight;
        } else {
          tmpNextOffsetY =
            targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY;
        }

        // Calculate potential visible area
        visibleAreas.tb = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY
        );
        recommendAreas.tb = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
          visibleRegionArea
        );

        // Store potential offsets
        potentialOffsets.tb = {
          offsetX: nextOffsetX,
          offsetY: tmpNextOffsetY,
          popupOffsetX,
          popupOffsetY: -popupOffsetY
        };

        // Mark that tb flip needs to be checked
        flipRequirements.tb = true;
      }

      // >>>>>>>>>> Left & Right
      const needAdjustX = supportAdjust(adjustX);

      // >>>>> Flip
      const sameLR = popupPoints[1] === targetPoints[1];

      // Check Right to Left flip
      if (
        needAdjustX &&
        popupPoints[1] === 'l' &&
        (nextPopupRight > adjustCheckVisibleArea.right ||
          prevFlipRef.current.rl)
      ) {
        let tmpNextOffsetX = nextOffsetX;

        if (sameLR) {
          tmpNextOffsetX -= popupWidth - targetWidth;
        } else {
          tmpNextOffsetX =
            targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX;
        }

        // Calculate potential visible area
        visibleAreas.rl = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY
        );
        recommendAreas.rl = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
          visibleRegionArea
        );

        // Store potential offsets
        potentialOffsets.rl = {
          offsetX: tmpNextOffsetX,
          offsetY: nextOffsetY,
          popupOffsetX: -popupOffsetX,
          popupOffsetY
        };

        // Mark that rl flip needs to be checked
        flipRequirements.rl = true;
      }

      // Check Left to Right flip
      if (
        needAdjustX &&
        popupPoints[1] === 'r' &&
        (nextPopupX < adjustCheckVisibleArea.left ||
          prevFlipRef.current.lr)
      ) {
        let tmpNextOffsetX = nextOffsetX;

        if (sameLR) {
          tmpNextOffsetX += popupWidth - targetWidth;
        } else {
          tmpNextOffsetX =
            targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX;
        }

        // Calculate potential visible area
        visibleAreas.lr = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY
        );
        recommendAreas.lr = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
          visibleRegionArea
        );

        // Store potential offsets
        potentialOffsets.lr = {
          offsetX: tmpNextOffsetX,
          offsetY: nextOffsetY,
          popupOffsetX: -popupOffsetX,
          popupOffsetY
        };

        // Mark that lr flip needs to be checked
        flipRequirements.lr = true;
      }

      // Choose priority order based on the scene
      // Simple logic to determine if it's a vertical priority scene
      // This can be adjusted based on actual requirements
      const isVerticalPriorityScene = Math.abs(popupHeight - targetHeight) >
        Math.abs(popupWidth - targetWidth);

      const priorityOrder = getPriorityOrder(isVerticalPriorityScene);

      // Create copies of final point information
      const finalPopupPoints = [...popupPoints];
      const finalTargetPoints = [...targetPoints];

      // Flag for whether flip has been applied
      let hasFlipped = false;

      // Reset popupOffsetX and popupOffsetY to initial values
      let finalOffsetX = nextOffsetX;
      let finalOffsetY = nextOffsetY;
      let finalPopupOffsetX = popupOffsetX;
      let finalPopupOffsetY = popupOffsetY;

      // Process flips according to priority order
      let verticalFlipped = false;  // Whether vertical direction flip has been applied
      let horizontalFlipped = false;  // Whether horizontal direction flip has been applied

      // We need to find the best flip solution for vertical and horizontal directions separately
      let bestVerticalDirection = '';
      let bestHorizontalDirection = '';
      let bestVerticalVisibleArea = 0;
      let bestHorizontalVisibleArea = 0;

      // Find the best vertical and horizontal flips
      for (const direction of priorityOrder) {
        // Skip direction types that have already been processed
        if ((direction === 'tb' || direction === 'bt') && verticalFlipped) {
          continue;
        }
        if ((direction === 'lr' || direction === 'rl') && horizontalFlipped) {
          continue;
        }

        // If this direction needs to be flipped
        if (flipRequirements[direction]) {
          // Check if the flip provides better visibility
          const newVisibleArea = visibleAreas[direction];
          const newRecommendArea = recommendAreas[direction];

          const betterVisibility =
            // Larger visible area
            newVisibleArea > originIntersectionVisibleArea ||
            // Same visible area, but in non-visibleFirst mode, or has larger recommended area
            (newVisibleArea === originIntersectionVisibleArea &&
              (!isVisibleFirst || newRecommendArea >= originIntersectionRecommendArea));

          // If this direction's flip can provide better visibility, record it
          if (betterVisibility) {
            prevFlipRef.current[direction] = true;

            // Record by direction type
            if (direction === 'tb' || direction === 'bt') {
              if (newVisibleArea > bestVerticalVisibleArea) {
                bestVerticalDirection = direction;
                bestVerticalVisibleArea = newVisibleArea;
                verticalFlipped = true;
              }
            } else if (direction === 'lr' || direction === 'rl') {
              if (newVisibleArea > bestHorizontalVisibleArea) {
                bestHorizontalDirection = direction;
                bestHorizontalVisibleArea = newVisibleArea;
                horizontalFlipped = true;
              }
            }
          } else {
            prevFlipRef.current[direction] = false;
          }
        }
      }

      // Apply the best vertical direction flip
      if (verticalFlipped && bestVerticalDirection) {
        const direction = bestVerticalDirection;

        // Update vertical direction offsets
        finalOffsetY = potentialOffsets[direction].offsetY;
        finalPopupOffsetY = potentialOffsets[direction].popupOffsetY;

        // Update vertical direction point information
        finalPopupPoints[0] = reverseMap[popupPoints[0]] || 'c';
        finalTargetPoints[0] = reverseMap[targetPoints[0]] || 'c';
      }

      // Apply the best horizontal direction flip
      if (horizontalFlipped && bestHorizontalDirection) {
        const direction = bestHorizontalDirection;

        // Update horizontal direction offsets
        finalOffsetX = potentialOffsets[direction].offsetX;
        finalPopupOffsetX = potentialOffsets[direction].popupOffsetX;

        // Update horizontal direction point information
        finalPopupPoints[1] = reverseMap[popupPoints[1]] || 'c';
        finalTargetPoints[1] = reverseMap[targetPoints[1]] || 'c';
      }

      // Set whether any direction has been flipped
      hasFlipped = verticalFlipped || horizontalFlipped;

      // If flips have been applied, update alignment information
      if (hasFlipped) {
        // Update offsets
        nextOffsetX = finalOffsetX;
        nextOffsetY = finalOffsetY;
        popupOffsetX = finalPopupOffsetX;
        popupOffsetY = finalPopupOffsetY;

        // Update point information
        nextAlignInfo.points = [
          finalPopupPoints.join(''),
          finalTargetPoints.join('')
        ];
      }

      // Update popup position
      syncNextPopupPosition();

      // ============================ Shift ============================
      const numShiftX = shiftX === true ? 0 : shiftX;
      if (typeof numShiftX === 'number') {
        // Left
        if (nextPopupX < visibleRegionArea.left) {
          nextOffsetX -= nextPopupX - visibleRegionArea.left - popupOffsetX;

          if (targetRect.x + targetWidth < visibleRegionArea.left + numShiftX) {
            nextOffsetX +=
              targetRect.x - visibleRegionArea.left + targetWidth - numShiftX;
          }
        }

        // Right
        if (nextPopupRight > visibleRegionArea.right) {
          nextOffsetX -=
            nextPopupRight - visibleRegionArea.right - popupOffsetX;

          if (targetRect.x > visibleRegionArea.right - numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX;
          }
        }
      }

      const numShiftY = shiftY === true ? 0 : shiftY;
      if (typeof numShiftY === 'number') {
        // Top
        if (nextPopupY < visibleRegionArea.top) {
          nextOffsetY -= nextPopupY - visibleRegionArea.top - popupOffsetY;

          // When target if far away from visible area
          // Stop shift
          if (targetRect.y + targetHeight < visibleRegionArea.top + numShiftY) {
            nextOffsetY +=
              targetRect.y - visibleRegionArea.top + targetHeight - numShiftY;
          }
        }

        // Bottom
        if (nextPopupBottom > visibleRegionArea.bottom) {
          nextOffsetY -=
            nextPopupBottom - visibleRegionArea.bottom - popupOffsetY;

          if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY;
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

      // Additional calculate right & bottom position
      let offsetX4Right =
        popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width);
      let offsetY4Bottom =
        popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height);

      if (scaleX === 1) {
        nextOffsetX = Math.round(nextOffsetX);
        offsetX4Right = Math.round(offsetX4Right);
      }

      if (scaleY === 1) {
        nextOffsetY = Math.round(nextOffsetY);
        offsetY4Bottom = Math.round(offsetY4Bottom);
      }

      const nextOffsetInfo = {
        ready: true,
        offsetX: nextOffsetX / scaleX,
        offsetY: nextOffsetY / scaleY,
        offsetR: offsetX4Right / scaleX,
        offsetB: offsetY4Bottom / scaleY,
        arrowX: nextArrowX / scaleX,
        arrowY: nextArrowY / scaleY,
        scaleX,
        scaleY,
        align: nextAlignInfo,
      };

      setOffsetInfo(nextOffsetInfo);
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
    offsetInfo.offsetR,
    offsetInfo.offsetB,
    offsetInfo.arrowX,
    offsetInfo.arrowY,
    offsetInfo.scaleX,
    offsetInfo.scaleY,
    offsetInfo.align,
    triggerAlign,
  ];
}

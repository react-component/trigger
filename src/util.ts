import type { CSSMotionProps } from 'rc-motion';
import type {
  AlignType,
  AnimationType,
  BuildInPlacements,
  TransitionNameType,
} from './interface';

function isPointsEq(
  a1: string[] = [],
  a2: string[] = [],
  isAlignPoint: boolean,
): boolean {
  if (isAlignPoint) {
    return a1[0] === a2[0];
  }
  return a1[0] === a2[0] && a1[1] === a2[1];
}

export function getAlignPopupClassName(
  builtinPlacements: BuildInPlacements,
  prefixCls: string,
  align: AlignType,
  isAlignPoint: boolean,
): string {
  const { points } = align;

  const placements = Object.keys(builtinPlacements);

  for (let i = 0; i < placements.length; i += 1) {
    const placement = placements[i];
    if (
      isPointsEq(builtinPlacements[placement]?.points, points, isAlignPoint)
    ) {
      return `${prefixCls}-placement-${placement}`;
    }
  }

  return '';
}

/** @deprecated We should not use this if we can refactor all deps */
export function getMotion(
  prefixCls: string,
  motion: CSSMotionProps,
  animation: AnimationType,
  transitionName: TransitionNameType,
): CSSMotionProps {
  if (motion) {
    return motion;
  }

  if (animation) {
    return {
      motionName: `${prefixCls}-${animation}`,
    };
  }

  if (transitionName) {
    return {
      motionName: transitionName,
    };
  }

  return null;
}

export function getWin(ele: HTMLElement) {
  return ele.ownerDocument.defaultView;
}

/**
 * Get all the scrollable parent elements of the element
 * @param ele       The element to be detected
 * @param areaOnly  Only return the parent which will cut visible area
 */
export function collectScroller(ele: HTMLElement) {
  const scrollerList: HTMLElement[] = [];
  let current = ele?.parentElement;

  const scrollStyle = ['hidden', 'scroll', 'clip', 'auto'];

  while (current) {
    const { overflowX, overflowY, overflow } =
      getWin(current).getComputedStyle(current);
    if ([overflowX, overflowY, overflow].some((o) => scrollStyle.includes(o))) {
      scrollerList.push(current);
    }

    current = current.parentElement;
  }

  return scrollerList;
}

export function toNum(num: number, defaultValue = 1) {
  return Number.isNaN(num) ? defaultValue : num;
}

function getPxValue(val: string) {
  return toNum(parseFloat(val), 0);
}

export interface VisibleArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 *
 *
 *  **************************************
 *  *              Border                *
 *  *     **************************     *
 *  *     *                  *     *     *
 *  *  B  *                  *  S  *  B  *
 *  *  o  *                  *  c  *  o  *
 *  *  r  *      Content     *  r  *  r  *
 *  *  d  *                  *  o  *  d  *
 *  *  e  *                  *  l  *  e  *
 *  *  r  ********************  l  *  r  *
 *  *     *        Scroll          *     *
 *  *     **************************     *
 *  *              Border                *
 *  **************************************
 *
 */
/**
 * Get visible area of element
 */
export function getVisibleArea(
  initArea: VisibleArea,
  scrollerList?: HTMLElement[],
) {
  const visibleArea = { ...initArea };

  (scrollerList || []).forEach((ele) => {
    if (ele instanceof HTMLBodyElement || ele instanceof HTMLHtmlElement) {
      return;
    }

    // Skip if static position which will not affect visible area
    const {
      overflow,
      overflowClipMargin,
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
    } = getWin(ele).getComputedStyle(ele);

    const eleRect = ele.getBoundingClientRect();
    const {
      offsetHeight: eleOutHeight,
      clientHeight: eleInnerHeight,
      offsetWidth: eleOutWidth,
      clientWidth: eleInnerWidth,
    } = ele;

    const borderTopNum = getPxValue(borderTopWidth);
    const borderBottomNum = getPxValue(borderBottomWidth);
    const borderLeftNum = getPxValue(borderLeftWidth);
    const borderRightNum = getPxValue(borderRightWidth);

    const scaleX = toNum(
      Math.round((eleRect.width / eleOutWidth) * 1000) / 1000,
    );
    const scaleY = toNum(
      Math.round((eleRect.height / eleOutHeight) * 1000) / 1000,
    );

    // Original visible area
    const eleScrollWidth =
      (eleOutWidth - eleInnerWidth - borderLeftNum - borderRightNum) * scaleX;
    const eleScrollHeight =
      (eleOutHeight - eleInnerHeight - borderTopNum - borderBottomNum) * scaleY;

    // Cut border size
    const scaledBorderTopWidth = borderTopNum * scaleY;
    const scaledBorderBottomWidth = borderBottomNum * scaleY;
    const scaledBorderLeftWidth = borderLeftNum * scaleX;
    const scaledBorderRightWidth = borderRightNum * scaleX;

    // Clip margin
    let clipMarginWidth = 0;
    let clipMarginHeight = 0;
    if (overflow === 'clip') {
      const clipNum = getPxValue(overflowClipMargin);
      clipMarginWidth = clipNum * scaleX;
      clipMarginHeight = clipNum * scaleY;
    }

    // Region
    const eleLeft = eleRect.x + scaledBorderLeftWidth - clipMarginWidth;
    const eleTop = eleRect.y + scaledBorderTopWidth - clipMarginHeight;

    const eleRight =
      eleLeft +
      eleRect.width +
      2 * clipMarginWidth -
      scaledBorderLeftWidth -
      scaledBorderRightWidth -
      eleScrollWidth;

    const eleBottom =
      eleTop +
      eleRect.height +
      2 * clipMarginHeight -
      scaledBorderTopWidth -
      scaledBorderBottomWidth -
      eleScrollHeight;

    visibleArea.left = Math.max(visibleArea.left, eleLeft);
    visibleArea.top = Math.max(visibleArea.top, eleTop);
    visibleArea.right = Math.min(visibleArea.right, eleRight);
    visibleArea.bottom = Math.min(visibleArea.bottom, eleBottom);
  });

  return visibleArea;
}

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

  const scrollStyle = ['hidden', 'scroll', 'auto'];

  while (current) {
    const { overflowX, overflowY } = getWin(current).getComputedStyle(current);
    if (scrollStyle.includes(overflowX) || scrollStyle.includes(overflowY)) {
      scrollerList.push(current);
    }

    current = current.parentElement;
  }

  return scrollerList;
}

export function toNum(num: number) {
  return Number.isNaN(num) ? 1 : num;
}

export interface VisibleArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function getVisibleArea(
  initArea: VisibleArea,
  scrollerList?: HTMLElement[],
) {
  const visibleArea = { ...initArea };

  (scrollerList || []).forEach((ele) => {
    if (ele instanceof HTMLBodyElement) {
      return;
    }

    // Skip if static position which will not affect visible area
    const { position } = getWin(ele).getComputedStyle(ele);
    if (position === 'static') {
      return;
    }

    const eleRect = ele.getBoundingClientRect();
    const {
      offsetHeight: eleOutHeight,
      clientHeight: eleInnerHeight,
      offsetWidth: eleOutWidth,
      clientWidth: eleInnerWidth,
    } = ele;

    const scaleX = toNum(
      Math.round((eleRect.width / eleOutWidth) * 1000) / 1000,
    );
    const scaleY = toNum(
      Math.round((eleRect.height / eleOutHeight) * 1000) / 1000,
    );

    const eleScrollWidth = (eleOutWidth - eleInnerWidth) * scaleX;
    const eleScrollHeight = (eleOutHeight - eleInnerHeight) * scaleY;
    const eleRight = eleRect.x + eleRect.width - eleScrollWidth;
    const eleBottom = eleRect.y + eleRect.height - eleScrollHeight;

    visibleArea.left = Math.max(visibleArea.left, eleRect.x);
    visibleArea.top = Math.max(visibleArea.top, eleRect.y);
    visibleArea.right = Math.min(visibleArea.right, eleRight);
    visibleArea.bottom = Math.min(visibleArea.bottom, eleBottom);
  });

  return visibleArea;
}

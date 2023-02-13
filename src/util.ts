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

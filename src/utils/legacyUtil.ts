import { CSSMotionProps } from 'rc-motion';
import { AnimationType, TransitionNameType } from '../interface';

interface GetMotionProps {
  motion: CSSMotionProps;
  animation: AnimationType;
  transitionName: TransitionNameType;
  prefixCls: string;
}

export function getMotion({
  prefixCls,
  motion,
  animation,
  transitionName,
}: GetMotionProps): CSSMotionProps {
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

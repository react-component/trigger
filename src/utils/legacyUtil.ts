import { MotionType, AnimationType, TransitionNameType } from '../interface';

interface GetMotionProps {
  motion: MotionType;
  animation: AnimationType;
  transitionName: TransitionNameType;
  prefixCls: string;
}

export function getMotion({
  prefixCls,
  motion,
  animation,
  transitionName,
}: GetMotionProps): MotionType {
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

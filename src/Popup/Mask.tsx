import * as React from 'react';
import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import CSSMotion from 'rc-motion';
import type { TransitionNameType, AnimationType } from '../interface';
import { getMotion } from '../utils/legacyUtil';

export interface MaskProps {
  prefixCls: string;
  visible?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  maskMotion?: CSSMotionProps;

  // Legacy Motion
  maskAnimation?: AnimationType;
  maskTransitionName?: TransitionNameType;
}

export default function Mask(props: MaskProps) {
  const {
    prefixCls,
    visible,
    zIndex,

    mask,
    maskMotion,
    maskAnimation,
    maskTransitionName,
  } = props;

  if (!mask) {
    return null;
  }

  let motion: CSSMotionProps = {};

  if (maskMotion || maskTransitionName || maskAnimation) {
    motion = {
      motionAppear: true,
      ...getMotion({
        motion: maskMotion,
        prefixCls,
        transitionName: maskTransitionName,
        animation: maskAnimation,
      }),
    };
  }

  return (
    <CSSMotion {...motion} visible={visible} removeOnLeave>
      {({ className }) => (
        <div
          style={{ zIndex }}
          className={classNames(`${prefixCls}-mask`, className)}
        />
      )}
    </CSSMotion>
  );
}

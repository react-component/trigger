import { clsx } from 'clsx';
import type { CSSMotionProps } from '@rc-component/motion';
import CSSMotion from '@rc-component/motion';
import * as React from 'react';

export interface MaskProps {
  prefixCls: string;
  open?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion?: CSSMotionProps;

  mobile?: boolean;
}

export default function Mask(props: MaskProps) {
  const {
    prefixCls,
    open,
    zIndex,

    mask,
    motion,

    mobile,
  } = props;

  if (!mask) {
    return null;
  }

  return (
    <CSSMotion {...motion} motionAppear visible={open} removeOnLeave>
      {({ className }) => (
        <div
          style={{ zIndex }}
          className={clsx(
            `${prefixCls}-mask`,
            mobile && `${prefixCls}-mobile-mask`,
            className,
          )}
        />
      )}
    </CSSMotion>
  );
}

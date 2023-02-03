import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion';
import CSSMotion from 'rc-motion';

export interface MaskProps {
  prefixCls: string;
  open?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion?: CSSMotionProps;
}

export default function Mask(props: MaskProps) {
  const {
    prefixCls,
    open,
    zIndex,

    mask,
    motion,
  } = props;

  if (!mask) {
    return null;
  }

  return (
    <CSSMotion {...motion} motionAppear visible={open} removeOnLeave>
      {({ className }) => (
        <div
          style={{ zIndex }}
          className={classNames(`${prefixCls}-mask`, className)}
        />
      )}
    </CSSMotion>
  );
}

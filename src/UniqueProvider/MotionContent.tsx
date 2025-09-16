import * as React from 'react';
import type { TriggerProps } from '..';
import CSSMotion from '@rc-component/motion';
import classNames from 'classnames';

export interface MotionContentProps {
  prefixCls: string; // ${prefixCls}-motion-content apply on root div
  children: TriggerProps['popup'];
}

const MotionContent = (props: MotionContentProps) => {
  const { prefixCls, children } = props;

  const childNode = typeof children === 'function' ? children() : children;

  // motion name: `${prefixCls}-motion-content-fade`, apply in index.less
  const motionName = `${prefixCls}-motion-content-fade`;

  return (
    <CSSMotion motionAppear motionLeave={false} visible motionName={motionName}>
      {({ className: motionClassName, style: motionStyle }) => {
        const cls = classNames(`${prefixCls}-motion-content`, motionClassName);

        return (
          <div className={cls} style={motionStyle}>
            {childNode}
          </div>
        );
      }}
    </CSSMotion>
  );
};

if (process.env.NODE_ENV !== 'production') {
  MotionContent.displayName = 'MotionContent';
}

export default MotionContent;

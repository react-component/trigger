import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';
import classNames from 'classnames';
import CSSMotion from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import type { AlignType, ArrowPos } from '../interface';

export interface UniqueBodyProps {
  prefixCls: string; // ${prefixCls}-unique-body
  isMobile: boolean;
  ready: boolean;
  open: boolean;
  align: AlignType;
  offsetR: number;
  offsetB: number;
  offsetX: number;
  offsetY: number;
  arrowPos?: ArrowPos;
  popupSize?: { width: number; height: number };
  motion?: CSSMotionProps;
  uniqueBgClassName?: string;
  uniqueBgStyle?: React.CSSProperties;
}

const UniqueBody = (props: UniqueBodyProps) => {
  const {
    prefixCls,
    isMobile,
    ready,
    open,
    align,
    offsetR,
    offsetB,
    offsetX,
    offsetY,
    arrowPos,
    popupSize,
    motion,
    uniqueBgClassName,
    uniqueBgStyle,
  } = props;

  const bodyCls = `${prefixCls}-unique-body`;

  const [motionVisible, setMotionVisible] = React.useState(false);

  // ========================= Styles =========================
  const offsetStyle = useOffsetStyle(
    isMobile,
    ready,
    open,
    align,
    offsetR,
    offsetB,
    offsetX,
    offsetY,
  );

  // Apply popup size if available
  const sizeStyle: React.CSSProperties = {};
  if (popupSize) {
    sizeStyle.width = popupSize.width;
    sizeStyle.height = popupSize.height;
  }

  // ========================= Render =========================
  return (
    <CSSMotion
      motionAppear
      motionEnter
      motionLeave
      removeOnLeave={false}
      leavedClassName={`${bodyCls}-hidden`}
      {...motion}
      visible={open}
      onVisibleChanged={(nextVisible) => {
        setMotionVisible(nextVisible);
      }}
    >
      {({ className: motionClassName, style: motionStyle }) => {
        const cls = classNames(bodyCls, motionClassName, uniqueBgClassName, {
          [`${bodyCls}-visible`]: motionVisible,
        });

        return (
          <div
            className={cls}
            style={{
              '--arrow-x': `${arrowPos?.x || 0}px`,
              '--arrow-y': `${arrowPos?.y || 0}px`,
              ...offsetStyle,
              ...sizeStyle,
              ...motionStyle,
              ...uniqueBgStyle,
            } as React.CSSProperties}
          />
        );
      }}
    </CSSMotion>
  );
};

export default UniqueBody;

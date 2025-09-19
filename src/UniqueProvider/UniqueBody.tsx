import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';
import classNames from 'classnames';
import CSSMotion from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import type { AlignType } from '../interface';

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
    popupSize,
    motion,
    uniqueBgClassName,
    uniqueBgStyle,
  } = props;

  const floatBgCls = `${prefixCls}-unique-body`;

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
      leavedClassName={`${floatBgCls}-hidden`}
      {...motion}
      visible={open}
      onVisibleChanged={(nextVisible) => {
        setMotionVisible(nextVisible);
      }}
    >
      {({ className: motionClassName, style: motionStyle }) => {
        const cls = classNames(floatBgCls, motionClassName, uniqueBgClassName, {
          [`${floatBgCls}-visible`]: motionVisible,
        });

        return (
          <div
            className={cls}
            style={{
              ...offsetStyle,
              ...sizeStyle,
              ...motionStyle,
              ...uniqueBgStyle,
            }}
          />
        );
      }}
    </CSSMotion>
  );
};

export default UniqueBody;

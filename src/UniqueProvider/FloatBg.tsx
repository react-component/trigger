import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';
import classNames from 'classnames';
import CSSMotion from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import type { AlignType } from '../interface';

export interface FloatBgProps {
  prefixCls: string; // ${prefixCls}-float-bg
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
}

const FloatBg = (props: FloatBgProps) => {
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
  } = props;

  const floatBgCls = `${prefixCls}-float-bg`;

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
        const cls = classNames(floatBgCls, motionClassName, {
          [`${floatBgCls}-visible`]: motionVisible,
        });

        return (
          <div
            className={cls}
            style={{
              ...offsetStyle,
              ...sizeStyle,
              ...motionStyle,
            }}
          />
        );
      }}
    </CSSMotion>
  );
};

export default FloatBg;

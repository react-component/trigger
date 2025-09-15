import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';
import classNames from 'classnames';
import CSSMotion from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';

export interface FloatBgProps {
  prefixCls: string; // ${prefixCls}-float-bg
  popupEle: HTMLElement;
  isMobile: boolean;
  ready: boolean;
  open: boolean;
  align: any;
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
    popupEle,
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

  // ========================= Ready ==========================
  // const [delayReady, setDelayReady] = React.useState(false);

  // React.useEffect(() => {
  //   setDelayReady(ready);
  // }, [ready]);

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

  // Remove console.log as it's for debugging only
  // console.log('>>>', ready, open, offsetStyle);

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

import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';
import { clsx } from 'clsx';
import CSSMotion from '@rc-component/motion';
import type { CSSMotionProps } from '@rc-component/motion';
import type { AlignType, ArrowPos } from '../interface';

export interface UniqueContainerProps {
  prefixCls: string; // ${prefixCls}-unique-container
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
  uniqueContainerClassName?: string;
  uniqueContainerStyle?: React.CSSProperties;
}

const UniqueContainer = (props: UniqueContainerProps) => {
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
    uniqueContainerClassName,
    uniqueContainerStyle,
  } = props;

  const containerCls = `${prefixCls}-unique-container`;

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

  // Cache for offsetStyle when ready is true
  const cachedOffsetStyleRef = React.useRef(offsetStyle);

  // Update cached offset style when ready is true
  if (ready) {
    cachedOffsetStyleRef.current = offsetStyle;
  }

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
      leavedClassName={`${containerCls}-hidden`}
      {...motion}
      visible={open}
      onVisibleChanged={(nextVisible) => {
        setMotionVisible(nextVisible);
      }}
    >
      {({ className: motionClassName, style: motionStyle }) => {
        const cls = clsx(
          containerCls,
          motionClassName,
          uniqueContainerClassName,
          { [`${containerCls}-visible`]: motionVisible },
        );

        return (
          <div
            className={cls}
            style={
              {
                '--arrow-x': `${arrowPos?.x || 0}px`,
                '--arrow-y': `${arrowPos?.y || 0}px`,
                ...cachedOffsetStyleRef.current,
                ...sizeStyle,
                ...motionStyle,
                ...uniqueContainerStyle,
              } as React.CSSProperties
            }
          />
        );
      }}
    </CSSMotion>
  );
};

export default UniqueContainer;

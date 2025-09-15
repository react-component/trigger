import React from 'react';
import useOffsetStyle from '../hooks/useOffsetStyle';

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
  } = props;

  // Apply className as requested in TODO
  const className = `${prefixCls}-float-bg`;

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
  // console.log('>>>', popupEle);

  return <div className={className} style={{ ...offsetStyle, ...sizeStyle }} />;
};

export default FloatBg;

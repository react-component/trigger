import React from 'react';

export interface FloatBgProps {
  prefixCls: string; // ${prefixCls}-float-bg
  popupEle: HTMLElement;
}

const FloatBg = (props: FloatBgProps) => {
  const { prefixCls, popupEle } = props;

  // Apply className as requested in TODO
  const className = `${prefixCls}-float-bg`;

  // Remove console.log as it's for debugging only
  // console.log('>>>', popupEle);

  return <div className={className} />;
};

export default FloatBg;

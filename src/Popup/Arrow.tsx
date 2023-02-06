import * as React from 'react';
import type { AlignType } from '../interface';

export interface ArrowProps {
  prefixCls: string;
  align: AlignType;
}

export default function Arrow(props: ArrowProps) {
  const { prefixCls, align } = props;

  const arrowRef = React.useRef<HTMLDivElement>();

  const points = align.points[0];

  const alignStyle: React.CSSProperties = {
    position: 'absolute',
  };

  // Top & Bottom
  switch (points[0]) {
    case 'b':
      alignStyle.bottom = 0;
      break;

    case 't':
      alignStyle.top = 0;
      break;

    default:
      alignStyle.top = '50%';
      break;
  }

  // Left & Right
  switch (points[1]) {
    case 'l':
      alignStyle.left = 0;
      break;

    case 'r':
      alignStyle.right = 0;
      break;

    default:
      alignStyle.left = '50%';
      break;
  }

  return (
    <div ref={arrowRef} className={`${prefixCls}-arrow`} style={alignStyle} />
  );
}

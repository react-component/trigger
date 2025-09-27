import { clsx } from 'clsx';
import * as React from 'react';
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface';

export interface ArrowProps {
  prefixCls: string;
  align: AlignType;
  arrow: ArrowTypeOuter;
  arrowPos: ArrowPos;
}

export default function Arrow(props: ArrowProps) {
  const { prefixCls, align, arrow, arrowPos } = props;

  const { className, content, style } = arrow || {};
  const { x = 0, y = 0 } = arrowPos;

  const arrowRef = React.useRef<HTMLDivElement>(null);

  // Skip if no align
  if (!align || !align.points) {
    return null;
  }

  const alignStyle: React.CSSProperties = {
    position: 'absolute',
  };

  // Skip if no need to align
  if (align.autoArrow !== false) {
    const popupPoints = align.points[0];
    const targetPoints = align.points[1];
    const popupTB = popupPoints[0];
    const popupLR = popupPoints[1];
    const targetTB = targetPoints[0];
    const targetLR = targetPoints[1];

    // Top & Bottom
    if (popupTB === targetTB || !['t', 'b'].includes(popupTB)) {
      alignStyle.top = y;
    } else if (popupTB === 't') {
      alignStyle.top = 0;
    } else {
      alignStyle.bottom = 0;
    }

    // Left & Right
    if (popupLR === targetLR || !['l', 'r'].includes(popupLR)) {
      alignStyle.left = x;
    } else if (popupLR === 'l') {
      alignStyle.left = 0;
    } else {
      alignStyle.right = 0;
    }
  }

  return (
    <div
      ref={arrowRef}
      className={clsx(`${prefixCls}-arrow`, className)}
      style={{ ...alignStyle, ...style }}
    >
      {content}
    </div>
  );
}

import type * as React from 'react';
import type { AlignType } from '../interface';

export default function useOffsetStyle(
  isMobile: boolean,
  ready: boolean,
  open: boolean,
  align: AlignType,
  offsetR: number,
  offsetB: number,
  offsetX: number,
  offsetY: number,
) {
  // >>>>> Offset
  const AUTO = 'auto' as const;

  const offsetStyle: React.CSSProperties = isMobile
    ? {}
    : {
        left: '-1000vw',
        top: '-1000vh',
        right: AUTO,
        bottom: AUTO,
      };

  // Set align style
  if (!isMobile && (ready || !open)) {
    const { points } = align;
    const dynamicInset =
      align.dynamicInset || (align as any)._experimental?.dynamicInset;
    const alignRight = dynamicInset && points[0][1] === 'r';
    const alignBottom = dynamicInset && points[0][0] === 'b';

    if (alignRight) {
      offsetStyle.right = offsetR;
      offsetStyle.left = AUTO;
    } else {
      offsetStyle.left = offsetX;
      offsetStyle.right = AUTO;
    }

    if (alignBottom) {
      offsetStyle.bottom = offsetB;
      offsetStyle.top = AUTO;
    } else {
      offsetStyle.top = offsetY;
      offsetStyle.bottom = AUTO;
    }
  }

  return offsetStyle;
}

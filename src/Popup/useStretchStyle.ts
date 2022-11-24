import * as React from 'react';
import type { StretchType } from '../interface';

export default (
  stretch?: StretchType,
): [React.CSSProperties, (element: HTMLElement) => void] => {
  const [targetSize, setTargetSize] = React.useState({ width: 0, height: 0 });

  function measureStretch(element: HTMLElement) {
    let { offsetWidth: tgtWidth, offsetHeight: tgtHeight } = element;
    const { width, height } = element.getBoundingClientRect();

    if (Math.abs(tgtWidth - width) < 1 && Math.abs(tgtHeight - height) < 1) {
      tgtWidth = width;
      tgtHeight = height;
    }

    setTargetSize({
      width: tgtWidth,
      height: tgtHeight,
    });
  }

  // Merge stretch style
  const style = React.useMemo<React.CSSProperties>(() => {
    const sizeStyle: React.CSSProperties = {};

    if (stretch) {
      const { width, height } = targetSize;

      // Stretch with target
      if (stretch.indexOf('height') !== -1 && height) {
        sizeStyle.height = height;
      } else if (stretch.indexOf('minHeight') !== -1 && height) {
        sizeStyle.minHeight = height;
      }
      if (stretch.indexOf('width') !== -1 && width) {
        sizeStyle.width = width;
      } else if (stretch.indexOf('minWidth') !== -1 && width) {
        sizeStyle.minWidth = width;
      }
    }

    return sizeStyle;
  }, [stretch, targetSize]);

  return [style, measureStretch];
};

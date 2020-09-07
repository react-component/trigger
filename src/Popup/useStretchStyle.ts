import React from 'react';
import { StretchType } from '../interface';

export default (
  stretch?: StretchType,
): [React.CSSProperties, (element: HTMLElement) => void] => {
  const [targetSize, setTargetSize] = React.useState({ width: 0, height: 0 });

  function measureStretch(element: HTMLElement) {
    setTargetSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }

  // Merge stretch style
  const style = React.useMemo<React.CSSProperties>(() => {
    const sizeStyle: React.CSSProperties = {};

    if (stretch) {
      // Stretch with target
      if (stretch.indexOf('height') !== -1) {
        sizeStyle.height = targetSize.height;
      } else if (stretch.indexOf('minHeight') !== -1) {
        sizeStyle.minHeight = targetSize.height;
      }
      if (stretch.indexOf('width') !== -1) {
        sizeStyle.width = targetSize.width;
      } else if (stretch.indexOf('minWidth') !== -1) {
        sizeStyle.minWidth = targetSize.width;
      }
    }

    return sizeStyle;
  }, [stretch, targetSize]);

  return [style, measureStretch];
};

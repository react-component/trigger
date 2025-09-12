import React from 'react';
import { useEvent } from '@rc-component/util';
import type { UniqueShowOptions } from '../context';

/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 * 4. During appear/enter animation, cache new options and apply after animation completes.
 */
export default function useTargetState(): [
  trigger: (options: UniqueShowOptions | false) => void,
  open: boolean,
  /* Will always cache last which is not null */
  cacheOptions: UniqueShowOptions | null,
  onVisibleChanged: (visible: boolean) => void,
] {
  const [options, setOptions] = React.useState<UniqueShowOptions | null>(null);
  const [open, setOpen] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const pendingOptionsRef = React.useRef<UniqueShowOptions | null>(null);

  const trigger = useEvent((nextOptions: UniqueShowOptions | false) => {
    if (nextOptions === false) {
      // 隐藏时清除待处理的选项
      pendingOptionsRef.current = null;
      setOpen(false);
    } else {
      if (isAnimating && open) {
        // 如果正在动画中（appear 或 enter），缓存新的 options
        pendingOptionsRef.current = nextOptions;
      } else {
        // 没有动画或者是首次显示，直接应用
        setOpen(true);
        setOptions(nextOptions);
        pendingOptionsRef.current = null;
      }
    }
  });

  const onVisibleChanged = useEvent((visible: boolean) => {
    if (visible) {
      // 动画进入完成，检查是否有待处理的选项
      setIsAnimating(false);
      if (pendingOptionsRef.current) {
        const pendingOptions = pendingOptionsRef.current;
        pendingOptionsRef.current = null;
        // 应用待处理的选项
        setOptions(pendingOptions);
      }
    } else {
      // 动画离开完成
      setIsAnimating(false);
      pendingOptionsRef.current = null;
    }
  });

  // 当开始显示时标记为动画中
  React.useEffect(() => {
    if (open && options) {
      setIsAnimating(true);
    }
  }, [open, options]);

  return [trigger, open, options, onVisibleChanged];
}

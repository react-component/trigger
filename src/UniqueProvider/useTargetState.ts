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
      // Clear pending options when hiding
      pendingOptionsRef.current = null;
      setOpen(false);
    } else {
      if (isAnimating && open) {
        // If animating (appear or enter), cache new options
        pendingOptionsRef.current = nextOptions;
      } else {
        setOpen(true);
        // Set new options
        setOptions(nextOptions);
        pendingOptionsRef.current = null;

        // Only mark as animating when transitioning from closed to open
        if (!open) {
          setIsAnimating(true);
        }
      }
    }
  });

  const onVisibleChanged = useEvent((visible: boolean) => {
    if (visible) {
      // Animation enter completed, check if there are pending options
      setIsAnimating(false);
      if (pendingOptionsRef.current) {
        // Apply pending options
        setOptions(pendingOptionsRef.current);
        pendingOptionsRef.current = null;
      }
    } else {
      // Animation leave completed
      setIsAnimating(false);
      pendingOptionsRef.current = null;
    }
  });

  return [trigger, open, options, onVisibleChanged];
}

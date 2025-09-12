import React from 'react';
import type { TriggerProps } from '..';
import { useEvent } from '@rc-component/util';
import type { UniqueShowOptions } from '../context';

/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 */
export default function useTargetState(): [
  trigger: (options: UniqueShowOptions | false) => void,
  open: boolean,
  /* Will always cache last which is not null */
  cacheOptions: UniqueShowOptions | null,
] {
  const [options, setOptions] = React.useState<UniqueShowOptions | null>(null);
  const [open, setOpen] = React.useState(false);

  const trigger = useEvent((nextOptions: UniqueShowOptions | false) => {
    if (nextOptions === false) {
      setOpen(false);
    } else {
      setOpen(true);
      setOptions(nextOptions);
    }
  });

  return [trigger, open, options];
}

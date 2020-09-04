import { useState, useEffect, useRef } from 'react';
import raf from 'rc-util/lib/raf';

/**
 * Popup should follow the steps for each component work correctly:
 * measure - check for the current stretch size
 * align - let component align the position
 * aligned - re-align again in case additional className changed the size
 * afterAlign - choice next step is trigger motion or finished
 * beforeMotion - should reset motion to invisible so that CSSMotion can do normal motion
 * motion - play the motion
 * stable - everything is done
 */
type PopupStatus = null | 'measure' | 'align' | 'aligned' | 'motion' | 'stable';

type Func = () => void;

const StatusQueue: PopupStatus[] = [
  'measure',
  'align',
  null,
  'motion',
  'stable',
];

export default (
  visible: boolean,
  doMeasure: Func,
): [PopupStatus, (callback: () => void) => void] => {
  const [status, setStatus] = useState<PopupStatus>(null);
  const rafRef = useRef<number>();

  function cancelRaf() {
    raf.cancel(rafRef.current);
  }

  function goNextStatus(callback?: () => void) {
    // Only align should be manually trigger
    setStatus(prev => {
      switch (status) {
        case 'align':
          //   return 'aligned';

          // case 'aligned':
          return 'motion';
      }

      return prev;
    });

    // Trigger callback in another frame
    if (callback) {
      cancelRaf();
      rafRef.current = raf(callback);
    }
  }

  // Init status
  useEffect(() => {
    setStatus('measure');
  }, [visible]);

  // Go next status
  useEffect(() => {
    switch (status) {
      case 'measure':
        doMeasure();
        break;
    }

    if (status) {
      rafRef.current = raf(async () => {
        const nextStatus = StatusQueue[StatusQueue.indexOf(status) + 1];
        if (nextStatus) {
          setStatus(nextStatus);
        }
      });
    }
  }, [status]);

  useEffect(
    () => () => {
      cancelRaf();
    },
    [],
  );

  console.log('Frame Status >>>>>>', status);

  return [status, goNextStatus];
};

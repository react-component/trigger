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
type PopupStatus = null | 'measure' | 'align' | 'motion' | 'stable';

type Func = () => void;

const StatusQueue: PopupStatus[] = ['measure', 'align', 'motion', 'stable'];

export default (visible: boolean, doMeasure: Func, doAlign: Func) => {
  const [status, setStatus] = useState<PopupStatus>(null);
  const rafRef = useRef<number>();
  const alignPromiseRef = useRef<Promise<any>>();

  function cancelRaf() {
    raf.cancel(rafRef.current);
  }

  useEffect(() => {
    setStatus('measure');
  }, [visible]);

  useEffect(() => {
    switch (status) {
      case 'measure':
        doMeasure();
        break;

      case 'align':
        break;
    }

    if (status) {
      rafRef.current = raf(async () => {
        // Align need wait for align finished
        if (status === 'align') {
          await alignPromiseRef.current;
        }

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

  return [status];
};

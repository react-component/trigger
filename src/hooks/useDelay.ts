import * as React from 'react';

export default function useDelay() {
  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDelay = () => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  };

  const delayInvoke = (callback: VoidFunction, delay: number) => {
    clearDelay();

    if (delay === 0) {
      callback();
    } else {
      delayRef.current = setTimeout(() => {
        callback();
      }, delay * 1000);
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      clearDelay();
    };
  }, []);

  return delayInvoke;
}

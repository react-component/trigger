import * as React from 'react';
import { UniqueContext, type UniqueContextProps } from '../context';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDelay = () => {
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  };

  const show = (targetElement: HTMLElement, delay: number) => {
    clearDelay();
    
    if (delay === 0) {
      setTarget(targetElement);
    } else {
      delayRef.current = setTimeout(() => {
        setTarget(targetElement);
      }, delay * 1000);
    }
  };

  const hide = (targetElement: HTMLElement, delay: number) => {
    clearDelay();
    
    if (delay === 0) {
      setTarget(null);
    } else {
      delayRef.current = setTimeout(() => {
        setTarget(null);
      }, delay * 1000);
    }
  };

  const contextValue = React.useMemo<UniqueContextProps>(() => ({
    show,
    hide,
  }), []);

  return (
    <UniqueContext.Provider value={contextValue}>
      {children}
    </UniqueContext.Provider>
  );
};

export default UniqueProvider;

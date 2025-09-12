import * as React from 'react';
import { UniqueContext, type UniqueContextProps } from '../context';
import useDelay from '../hooks/useDelay';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const delayInvoke = useDelay();

  const show = (targetElement: HTMLElement, delay: number) => {
    delayInvoke(() => {
      setTarget(targetElement);
    }, delay);
  };

  const hide = (targetElement: HTMLElement, delay: number) => {
    delayInvoke(() => {
      setTarget(null);
    }, delay);
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

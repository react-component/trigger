import * as React from 'react';
import { UniqueContext, type UniqueContextProps } from './context';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);

  const show = (targetElement: HTMLElement) => {
    setTarget(targetElement);
  };

  const hide = () => {
    setTarget(null);
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

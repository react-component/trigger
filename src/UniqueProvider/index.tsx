import * as React from 'react';
import { UniqueContext, type UniqueContextProps } from '../context';
import useDelay from '../hooks/useDelay';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [currentNode, setCurrentNode] = React.useState<React.ReactNode>(null);

  // ========================== Register ==========================
  const delayInvoke = useDelay();

  const show = (node: React.ReactNode, targetElement: HTMLElement, delay: number) => {
    delayInvoke(() => {
      setCurrentNode(node);
      setTarget(targetElement);
    }, delay);
  };

  const hide = (delay: number) => {
    delayInvoke(() => {
      setTarget(null);
      setCurrentNode(null);
    }, delay);
  };

  const contextValue = React.useMemo<UniqueContextProps>(
    () => ({
      show,
      hide,
    }),
    [],
  );

  // =========================== Render ===========================
  return (
    <UniqueContext.Provider value={contextValue}>
      {children}
    </UniqueContext.Provider>
  );
};

export default UniqueProvider;

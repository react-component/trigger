import * as React from 'react';
import { generateTrigger } from './index';

interface MockPortalProps {
  children: React.ReactElement;
  getContainer?: () => HTMLElement;
}

const MockPortal: React.FC<MockPortalProps> = ({
  children,
  getContainer,
}) => {
  React.useEffect(() => {
    getContainer?.();
  });

  return children;
};

export default generateTrigger(MockPortal);

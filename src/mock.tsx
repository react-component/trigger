import * as React from 'react';
import { generateTrigger } from './index';

interface MockPortalProps {
  didUpdate: () => void;
  children: React.ReactElement;
  getContainer: () => HTMLElement;
}

const MockPortal: React.FC<MockPortalProps> = ({
  didUpdate,
  children,
  getContainer,
}) => {
  React.useEffect(() => {
    didUpdate();
    getContainer();
  });

  return children;
};

export default generateTrigger(MockPortal);

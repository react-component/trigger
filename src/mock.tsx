import React from 'react';
import { generateTrigger } from './index';

interface MockPortalProps {
  didUpdate: () => void;
  children: React.ReactElement;
}

const MockPortal: React.FC<MockPortalProps> = ({ didUpdate, children }) => {
  React.useEffect(() => {
    didUpdate();
  });

  return children;
};

export default generateTrigger(MockPortal);

import * as React from 'react';
import { generateTrigger } from './index';

interface MockPortalProps {
  open?: boolean;
  autoDestroy?: boolean;
  children: React.ReactElement;
  getContainer?: () => HTMLElement;
}

const MockPortal: React.FC<MockPortalProps> = ({
  open,
  autoDestroy,
  children,
  getContainer,
}) => {
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    getContainer?.();
  });

  React.useEffect(() => {
    if (open) {
      setVisible(true);
    } else if (!open && autoDestroy) {
      setVisible(false);
    }
  }, [open, autoDestroy]);

  return visible ? children : null;
};

export default generateTrigger(MockPortal);

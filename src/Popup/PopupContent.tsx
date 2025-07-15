import * as React from 'react';

export interface PopupContentProps {
  children?: React.ReactNode;
  cache?: boolean;
}

const PopupContent = React.memo(
  ({ children }: PopupContentProps) => children as React.ReactElement<any>,
  (_, next) => next.cache,
);

if (process.env.NODE_ENV !== 'production') {
  PopupContent.displayName = 'PopupContent';
}

export default PopupContent;

import React from 'react';
import classNames from 'classnames';

interface PopupInnerProps {
  prefixCls: string;
  className: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;

  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
}

const PopupInner: React.RefForwardingComponent<HTMLDivElement, PopupInnerProps> = (props, ref) => {
  const {
    prefixCls,
    className,
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onTouchStart,
  } = props;

  let childNode = children;

  if (React.Children.count(children) > 1) {
    childNode = <div className={`${prefixCls}-content`}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={style}
    >
      {childNode}
    </div>
  );
};

const RefPopupInner = React.forwardRef<HTMLDivElement, PopupInnerProps>(PopupInner);
RefPopupInner.displayName = 'PopupInner';

export default RefPopupInner;

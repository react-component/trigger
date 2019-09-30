import React from 'react';
import LazyRenderBox from './LazyRenderBox';

interface PopupInnerProps {
  prefixCls: string;
  className: string;
  hiddenClassName?: string;
  visible: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;

  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
}

const PopupInner: React.RefForwardingComponent<HTMLDivElement, PopupInnerProps> = props => {
  let { className } = props;
  if (!props.visible) {
    className += ` ${props.hiddenClassName}`;
  }
  return (
    <div
      className={className}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onMouseDown={props.onMouseDown}
      onTouchStart={props.onTouchStart}
      style={props.style}
    >
      <LazyRenderBox className={`${props.prefixCls}-content`} visible={props.visible}>
        {props.children}
      </LazyRenderBox>
    </div>
  );
};

const RefPopupInner = React.forwardRef<HTMLDivElement, PopupInnerProps>(PopupInner);
RefPopupInner.displayName = 'PopupInner';

export default RefPopupInner;

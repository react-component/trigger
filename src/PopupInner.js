import React from 'react';
import PropTypes from 'prop-types';
import LazyRenderBox from './LazyRenderBox';

const PopupInner = props => {
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

PopupInner.propTypes = {
  hiddenClassName: PropTypes.string,
  className: PropTypes.string,
  prefixCls: PropTypes.string,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseDown: PropTypes.func,
  onTouchStart: PropTypes.func,
  children: PropTypes.any,
};

export default PopupInner;

/* eslint react/prefer-stateless-function:0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LazyRenderBox from './LazyRenderBox';

class PopupInner extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onTouchStart: PropTypes.func,
    children: PropTypes.node,
  };

  render() {
    const {
      prefixCls, visible, style, className,
      onMouseEnter, onMouseLeave, onMouseDown, onTouchStart,
      children,
    } = this.props;

    return (
      <div
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={style}
      >
        <LazyRenderBox className={`${prefixCls}-content`} visible={visible}>
          {children}
        </LazyRenderBox>
      </div>
    );
  }
}

export default PopupInner;

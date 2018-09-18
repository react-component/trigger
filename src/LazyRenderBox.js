import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LazyRenderBox extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    visible: PropTypes.bool,
  };
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.visible ||
      nextProps.visible !== this.props.visible ||
      nextProps.className !== this.props.className
    );
  }
  render() {
    const { visible, children, ...props } = this.props;

    if (!children || React.Children.count(children) > 1) {
      return (
        <div {...props}>
          {children}
        </div>
      );
    }

    return React.Children.only(children);
  }
}

export default LazyRenderBox;

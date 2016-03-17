import React, { PropTypes } from 'react';

const LazyRenderBox = React.createClass({
  propTypes: {
    children: PropTypes.any,
    visible: PropTypes.bool,
  },
  shouldComponentUpdate(nextProps) {
    return nextProps.visible;
  },
  render() {
    if (React.Children.count(this.props.children) > 1) {
      return <div>{this.props.children}</div>;
    }
    return React.Children.only(this.props.children);
  },
});

export default LazyRenderBox;

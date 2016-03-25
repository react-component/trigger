import React, { PropTypes } from 'react';

const LazyRenderBox = React.createClass({
  propTypes: {
    children: PropTypes.any,
    className: PropTypes.string,
    visible: PropTypes.bool,
    hiddenClassName: PropTypes.string,
  },
  shouldComponentUpdate(nextProps) {
    return nextProps.hiddenClassName || nextProps.visible;
  },
  render() {
    if (this.props.hiddenClassName) {
      let className = this.props.className;
      if (!this.props.visible) {
        className += ` ${this.props.hiddenClassName}`;
      }
      return <div {...this.props} className={className}/>;
    }
    if (React.Children.count(this.props.children) > 1) {
      return <div {...this.props}/>;
    }
    return React.Children.only(this.props.children);
  },
});

export default LazyRenderBox;

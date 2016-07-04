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
      const props = { ...this.props };
      let className = props.className;
      if (!props.visible) {
        className += ` ${props.hiddenClassName}`;
      }
      props.className = className;
      delete props.hiddenClassName;
      delete props.visible;
      return <div {...props}/>;
    }
    if (React.Children.count(this.props.children) > 1) {
      return <div {...this.props}/>;
    }
    return React.Children.only(this.props.children);
  },
});

export default LazyRenderBox;

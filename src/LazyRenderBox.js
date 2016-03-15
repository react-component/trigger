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
    return (<div>
      {this.props.children}
    </div>);
  },
});

export default LazyRenderBox;

import React, { Component } from 'react';

interface LazyRenderBoxProps {
  children: React.ReactNode;
  className: string;
  visible: boolean;
  hiddenClassName: string;
}

class LazyRenderBox extends Component<LazyRenderBoxProps> {
  shouldComponentUpdate(nextProps: LazyRenderBoxProps) {
    return !!(nextProps.hiddenClassName || nextProps.visible);
  }

  render() {
    const { hiddenClassName, visible, ...props } = this.props;

    if (hiddenClassName || React.Children.count(props.children) > 1) {
      if (!visible && hiddenClassName) {
        props.className += ` ${hiddenClassName}`;
      }
      return <div {...props} />;
    }

    return React.Children.only(props.children);
  }
}

export default LazyRenderBox;

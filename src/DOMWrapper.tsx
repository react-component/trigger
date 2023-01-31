import * as React from 'react';

export default class DOMWrapper extends React.Component<{
  children?: React.ReactNode;
}> {
  render() {
    return this.props.children;
  }
}

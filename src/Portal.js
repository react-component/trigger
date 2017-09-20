import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default class Portal extends React.Component {
  static propTypes = {
    getContainer: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }

  componentDidMount() {
    this.createContainer();
  }

  componentWillUnmount() {
    this.removeContainer();
  }

  createContainer() {
    this._container = this.props.getContainer();
    this.forceUpdate();
  }

  removeContainer() {
    if (this._container) {
      this._container.parentNode.removeChild(this._container);
    }
  }

  render() {
    if (this._container) {
      return createPortal(this.props.children, this._container);
    }
    return null;
  }
}

import React from 'react';

import { contextTypes } from './Trigger';

export default function withTrigger(Component) {
  return class Wrapper extends React.Component {
    static contextTypes = contextTypes;

    render() {
      const { rcTrigger: { realign } = {} } = this.context;
      return <Component triggerRealign={realign} {...this.props} />;
    }
  };
}

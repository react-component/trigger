/* eslint no-console:0 react/no-multi-comp:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Trigger, { withTrigger } from '../src';
import 'rc-trigger/assets/index.less';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
  },
};

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

class Popup extends React.Component {
  constructor() {
    super();
    this.state = {
      text: '',
    };
  }

  componentDidMount() {
    this.id = setInterval(() => {
      let text = `${this.state.text}1`;
      if (text.length > 50) {
        text = '';
      }
      this.setState({ text });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  render() {
    return (
      <div
        style={{
          background: 'red',
          padding: 20,
          maxWidth: 100,
          wordBreak: 'break-all',
        }}
      >
        --{this.state.text}--
      </div>
    );
  }
}
const AlignPopup = withTrigger(Popup);

class Test extends React.Component {
  constructor() {
    super();
  }

  state = {
    mask: false,
    maskClosable: false,
    placement: 'top',
    trigger: {
      hover: 1,
    },
  };

  destroy = () => {
    this.setState({
      destroyed: true,
    });
  }

  destroyPopupOnHide = (e) => {
    this.setState({
      destroyPopupOnHide: e.target.checked,
    });
  }

  render() {
    const state = this.state;
    return (<div >
      <div style={{ margin: '10px 20px' }}>
        <button onClick={this.destroy}>destroy</button>
      </div>
      <div style={{ margin: 100, position: 'relative' }}>
        <Trigger
          getPopupContainer={undefined && getPopupContainer}
          popupPlacement={'top'}
          destroyPopupOnHide={this.state.destroyPopupOnHide}
          action={['hover']}
          builtinPlacements={builtinPlacements}
          popup={<AlignPopup />}
          popupTransitionName={state.transitionName}
        >
          <span style={{ margin: 20 }}>Hover ME!</span>
        </Trigger>
      </div>
    </div>);
  }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));

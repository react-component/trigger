/* eslint no-console:0 react/no-multi-comp:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Trigger, { withTrigger } from '../src';
import 'rc-trigger/assets/index.less';

const CHANGE_TYPE_POPUP = 'CHANGE_TYPE_POPUP';
const CHANGE_TYPE_TRIGGER = 'CHANGE_TYPE_TRIGGER';
const CHANGE_TYPE_BOTH = 'CHANGE_TYPE_BOTH';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
  },
};

class Popup extends React.Component {
  static propTypes = {
    update: PropTypes.bool,
    triggerRealign: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      text: '',
    };
  }

  componentDidMount() {
    this.id = setInterval(() => {
      if (!this.props.update) return;

      let text = `${this.state.text}1`;
      if (text.length > 50) {
        text = '';
      }
      this.setState({ text }, () => {
        this.props.triggerRealign();
      });
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


class Content extends React.Component {
  static propTypes = {
    update: PropTypes.bool,
    triggerRealign: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      text: 'HOVER ME!',
    };
  }

  componentDidMount() {
    this.id = setInterval(() => {
      if (!this.props.update) return;

      let text = `${this.state.text}1`;
      if (text.length > 50) {
        text = 'HOVER ME!';
      }
      this.setState({ text }, () => {
        this.props.triggerRealign();
      });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  render() {
    const { ...props } = this.props;
    delete props.triggerRealign;
    delete props.update;

    return (
      <span
        style={{
          margin: 20,
        }}
        {...props}
      >
        {this.state.text}
      </span>
    );
  }
}
const AlignContent = withTrigger(Content);

class Test extends React.Component {
  constructor() {
    super();
  }

  state = {
    changeType: CHANGE_TYPE_POPUP,
  };

  onTypeChange = ({ target: { value } }) => {
    this.setState({ changeType: value });
  };

  render() {
    const { changeType } = this.state;

    return (<div >
      <div style={{ margin: '0 0 50px 50px' }}>
        <label>
          Dynamic change:
          {' '}
          <select value={changeType} onChange={this.onTypeChange}>
            <option value={CHANGE_TYPE_POPUP}>Popup</option>
            <option value={CHANGE_TYPE_TRIGGER}>Trigger</option>
            <option value={CHANGE_TYPE_BOTH}>Both</option>
          </select>
        </label>
      </div>

      <hr />

      <div style={{ margin: 100, position: 'relative' }}>
        <Trigger
          popupPlacement={'top'}
          action={['hover']}
          builtinPlacements={builtinPlacements}
          popup={<AlignPopup update={changeType !== CHANGE_TYPE_TRIGGER} />}
        >
          <AlignContent update={changeType !== CHANGE_TYPE_POPUP} />
        </Trigger>
      </div>
    </div>);
  }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));

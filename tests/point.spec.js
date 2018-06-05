import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect.js';
import $ from 'jquery';
import Trigger from '../index';
import './point.less';

describe('align by point', () => {
  let region;

  beforeEach(() => {
    $('body div').remove();

    region = $('<div>')
      .appendTo(document.body);
  });

  afterEach(() => {
    if (region) region.remove();
    region = null;
  });

  class Demo extends React.Component {
    popup = (
      <div className="point-popup">
        POPUP
      </div>
    );

    render() {
      return (
        <Trigger
          popup={this.popup}
          popupAlign={{ points: ['tl'] }}
          alignPoint
          {...this.props}
        >
          <div className="point-region" />
        </Trigger>
      );
    }
  }

  it('onClick', (done) => {
    const instance = ReactDOM.render(<Demo action={['click']} />, region[0]);
    const domNode = ReactDOM.findDOMNode(instance);
    TestUtils.Simulate.click(domNode, { pageX: 10, pageY: 20 });

    setTimeout(() => {
      const popup = $('.rc-trigger-popup');
      expect(popup.offset().left).to.be(10);
      expect(popup.offset().top).to.be(20);
      done();
    }, 20);
  });

  it('hover', (done) => {
    const instance = ReactDOM.render(<Demo action={['hover']} />, region[0]);
    const domNode = ReactDOM.findDOMNode(instance);
    TestUtils.Simulate.mouseEnter(domNode, { pageX: 10, pageY: 20 });

    setTimeout(() => {
      const popup = $('.rc-trigger-popup');
      expect(popup.offset().left).to.be(10);
      expect(popup.offset().top).to.be(20);
      done();
    }, 20);
  });

  it('contextMenu', (done) => {
    const instance = ReactDOM.render(<Demo action={['contextMenu']} />, region[0]);
    const domNode = ReactDOM.findDOMNode(instance);
    TestUtils.Simulate.contextMenu(domNode, { pageX: 10, pageY: 20 });

    setTimeout(() => {
      const popup = $('.rc-trigger-popup');
      expect(popup.offset().left).to.be(10);
      expect(popup.offset().top).to.be(20);
      done();
    }, 20);
  });
});

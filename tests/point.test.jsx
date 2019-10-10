import React from 'react';
import { mount } from 'enzyme';
import Trigger from '../src';

/**
 * dom-align internal default position is `-999`.
 * We do not need to simulate full position, check offset only.
 */
describe('Trigger.Point', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  class Demo extends React.Component {
    popup = <div className="point-popup">POPUP</div>;

    render() {
      return (
        <Trigger popup={this.popup} popupAlign={{ points: ['tl'] }} alignPoint {...this.props}>
          <div className="point-region" />
        </Trigger>
      );
    }
  }

  it('onClick', () => {
    const wrapper = mount(<Demo action={['click']} />);
    wrapper.trigger('click', { pageX: 10, pageY: 20 });

    const popup = wrapper
      .find('.rc-trigger-popup')
      .first()
      .getDOMNode();

    expect(popup.style).toEqual(expect.objectContaining({ left: '-989px', top: '-979px' }));
  });

  it('hover', () => {
    const wrapper = mount(<Demo action={['hover']} />);
    wrapper.trigger('mouseEnter', { pageX: 10, pageY: 20 });

    const popup = wrapper
      .find('.rc-trigger-popup')
      .first()
      .getDOMNode();

    expect(popup.style).toEqual(expect.objectContaining({ left: '-989px', top: '-979px' }));
  });

  describe('contextMenu', () => {
    it('basic', () => {
      const wrapper = mount(<Demo action={['contextMenu']} />);
      wrapper.trigger('contextMenu', { pageX: 10, pageY: 20 });

      const popup = wrapper
        .find('.rc-trigger-popup')
        .first()
        .getDOMNode();

      expect(popup.style).toEqual(expect.objectContaining({ left: '-989px', top: '-979px' }));
    });

    // https://github.com/ant-design/ant-design/issues/17043
    it('not prevent default', done => {
      const wrapper = mount(<Demo showAction={['contextMenu']} hideAction={['click']} />);
      wrapper.trigger('contextMenu', { pageX: 10, pageY: 20 });

      const popup = wrapper
        .find('.rc-trigger-popup')
        .first()
        .getDOMNode();

      expect(popup.style).toEqual(expect.objectContaining({ left: '-989px', top: '-979px' }));

      // Click to close
      wrapper.trigger('click', {
        preventDefault() {
          done.fail();
        },
      });

      done();
    });
  });

  it('placement', () => {
    const builtinPlacements = {
      right: {
        // This should not hit
        points: ['cl'],
      },
    };

    const wrapper = mount(
      <Demo action={['click']} builtinPlacements={builtinPlacements} popupPlacement="right" />,
    );
    wrapper.trigger('click', { pageX: 10, pageY: 20 });

    const popup = wrapper
      .find('.rc-trigger-popup')
      .first()
      .getDOMNode();

    expect(popup.style).toEqual(expect.objectContaining({ left: '-989px', top: '-979px' }));
  });
});

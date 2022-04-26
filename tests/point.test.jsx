import React, { createRef } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Trigger from '../src';
import { getMouseEvent } from './util';

/**
 * dom-align internal default position is `-999`.
 * We do not need to simulate full position, check offset only.
 */
describe('Trigger.Point', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  class Demo extends React.Component {
    popup = (<div className="point-popup">POPUP</div>);

    render() {
      return (
        <Trigger
          ref={this.props.triggerRef}
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

  function trigger(container, eventName, data) {
    const pointRegion = container.querySelector('.point-region');
    fireEvent(pointRegion, getMouseEvent(eventName, data));

    // React scheduler will not hold when useEffect. We need repeat to tell that times go
    for (let i = 0; i < 10; i += 1) {
      act(() => jest.runAllTimers());
    }
  }

  it('onClick', async () => {
    const { container } = render(<Demo action={['click']} />);
    trigger(container, 'click', { pageX: 10, pageY: 20 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' }),
    );
  });

  it('hover', () => {
    const { container } = render(<Demo action={['hover']} />);
    trigger(container, 'mouseenter', { pageX: 10, pageY: 20 });
    trigger(container, 'mouseover', { pageX: 10, pageY: 20 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' }),
    );
  });

  describe('contextMenu', () => {
    it('basic', () => {
      const triggerRef = createRef();
      const { container } = render(
        <Demo
          triggerRef={triggerRef}
          action={['contextMenu']}
          hideAction={['click']}
        />,
      );
      trigger(container, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' }),
      );

      // Not trigger point update when close
      const clickEvent = {};
      const pagePropDefine = {
        get: () => {
          throw new Error('should not read when close');
        },
      };
      Object.defineProperties(clickEvent, {
        pageX: pagePropDefine,
        pageY: pagePropDefine,
      });
      act(() => triggerRef.current.onClick(clickEvent));
    });

    // https://github.com/ant-design/ant-design/issues/17043
    it('not prevent default', (done) => {
      const { container } = render(
        <Demo showAction={['contextMenu']} hideAction={['click']} />,
      );
      trigger(container, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' }),
      );

      // Click to close
      fireEvent(
        document.querySelector('.rc-trigger-popup > *'),
        getMouseEvent('click', {
          preventDefault() {
            done.fail();
          },
        }),
      );

      done();
    });
  });

  describe('placement', () => {
    function testPlacement(name, builtinPlacements, afterAll) {
      it(name, () => {
        const { container } = render(
          <Demo
            action={['click']}
            builtinPlacements={builtinPlacements}
            popupPlacement="right"
          />,
        );
        trigger(container, 'click', { pageX: 10, pageY: 20 });

        const popup = document.querySelector('.rc-trigger-popup');
        expect(popup.style).toEqual(
          expect.objectContaining({ left: '-989px', top: '-979px' }),
        );

        if (afterAll) {
          afterAll(document.body);
        }
      });
    }

    testPlacement('not hit', {
      right: {
        // This should not hit
        points: ['cl'],
      },
    });

    testPlacement(
      'hit',
      {
        left: {
          points: ['tl'],
        },
      },
      (wrapper) => {
        expect(wrapper.querySelector('div.rc-trigger-popup')).toHaveClass(
          'rc-trigger-popup-placement-left',
        );
      },
    );
  });
});

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
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
        <div
          className="scroll"
          // Jest can not get calculated style in jsdom. So we need to set it manually
          style={{ overflowX: 'hidden', overflowY: 'hidden' }}
        >
          <Trigger
            ref={this.props.triggerRef}
            popup={this.popup}
            popupAlign={{ points: ['tl'] }}
            alignPoint
            {...this.props}
          >
            <div className="point-region" />
          </Trigger>
        </div>
      );
    }
  }

  async function trigger(container, eventName, data) {
    const pointRegion = container.querySelector('.point-region');
    fireEvent(pointRegion, getMouseEvent(eventName, data));

    // React scheduler will not hold when useEffect. We need repeat to tell that times go
    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });
    }
  }

  it('onClick', async () => {
    const { container } = render(<Demo action={['click']} />);
    await trigger(container, 'click', { clientX: 11, clientY: 28 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup).toHaveStyle({ left: '11px', top: '28px' });
  });

  it('hover', async () => {
    const { container } = render(<Demo action={['hover']} />);
    await trigger(container, 'mouseenter', { clientX: 10, clientY: 20 });
    await trigger(container, 'mouseover', { clientX: 9, clientY: 3 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup).toHaveStyle({ left: '9px', top: '3px' });
  });

  describe('contextMenu', () => {
    it('basic', async () => {
      const { container } = render(
        <Demo action={['contextMenu']} hideAction={['click']} />,
      );
      await trigger(container, 'contextmenu', { clientX: 10, clientY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '10px', top: '20px' }),
      );

      // Not trigger point update when close
      const clickEvent = {};
      const pagePropDefine = {
        get: () => {
          throw new Error('should not read when close');
        },
      };
      Object.defineProperties(clickEvent, {
        clientX: pagePropDefine,
        clientY: pagePropDefine,
      });
      fireEvent(
        container.querySelector('.point-region'),
        getMouseEvent('click', clickEvent),
      );

      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
    });

    // https://github.com/ant-design/ant-design/issues/17043
    it('not prevent default', (done) => {
      (async function () {
        const { container } = render(
          <Demo showAction={['contextMenu']} hideAction={['click']} />,
        );
        await trigger(container, 'contextmenu', { clientX: 10, clientY: 20 });

        const popup = document.querySelector('.rc-trigger-popup');
        expect(popup).toHaveStyle({ left: '10px', top: '20px' });

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
      })();
    });

    it('should hide popup when set alignPoint after scrolling', async () => {
      const { container } = render(<Demo action={['contextMenu']} />);
      await trigger(container, 'contextmenu', { clientX: 10, clientY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '10px', top: '20px' }),
      );

      const scrollDiv = container.querySelector('.scroll');
      fireEvent.scroll(scrollDiv);

      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
    });
  });

  describe('placement', () => {
    function testPlacement(name, builtinPlacements, afterAll) {
      it(name, async () => {
        const { container } = render(
          <Demo
            action={['click']}
            builtinPlacements={builtinPlacements}
            popupPlacement="right"
          />,
        );
        await trigger(container, 'click', { clientX: 10, clientY: 20 });

        const popup = document.querySelector('.rc-trigger-popup');
        expect(popup.style).toEqual(
          expect.objectContaining({ left: '10px', top: '20px' }),
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
      'hit builtin',
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

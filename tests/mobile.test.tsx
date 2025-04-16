import { act, fireEvent, render } from '@testing-library/react';
import isMobile from '@rc-component/util/lib/isMobile';
import React from 'react';
import Trigger, { type TriggerProps } from '../src';
import { placementAlignMap } from './util';

jest.mock('@rc-component/util/lib/isMobile');

describe('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function flush() {
    act(() => {
      jest.runAllTimers();
    });
  }

  it('auto change hover to click', () => {
    render(
      <Trigger
        popupAlign={placementAlignMap.left}
        popup={<strong>trigger</strong>}
      >
        <div className="target" />
      </Trigger>,
    );

    const target = document.querySelector('.target');

    flush();
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Touch work
    fireEvent.touchStart(target);
    fireEvent.mouseEnter(target);
    fireEvent.mouseLeave(target);
    flush();
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

    // Touch again
    fireEvent.touchStart(target);
    flush();
    expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
  });

  // ====================================================================================
  function getTrigger(props?: Partial<TriggerProps>) {
    return (
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        mask
        maskClosable
        mobile={{}}
        {...props}
      >
        <div className="target">click</div>
      </Trigger>
    );
  }

  describe('mobile config', () => {
    it('enabled', () => {
      const { container } = render(
        getTrigger({
          mobile: {},
        }),
      );

      fireEvent.click(container.querySelector('.target'));

      expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
        'rc-trigger-popup-mobile',
      );
    });

    it('replace motion', () => {
      render(
        getTrigger({
          mobile: {
            motion: {
              motionName: 'bamboo',
            },
            mask: true,
            maskMotion: {
              motionName: 'little',
            },
          },
          popupVisible: true,
        }),
      );

      expect(document.querySelector('.rc-trigger-popup-mobile')).toBeTruthy();
      expect(
        document.querySelector('.rc-trigger-popup-mobile-mask'),
      ).toBeTruthy();

      expect(document.querySelector('.rc-trigger-popup')).toHaveClass('bamboo');
      expect(document.querySelector('.rc-trigger-popup-mask')).toHaveClass(
        'little',
      );
    });
  });
});

import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Trigger from '../src';
import CSSMotion from 'rc-motion';
import { placementAlignMap } from './util';

describe('Trigger.Motion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('popup should support motion', async () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
      >
        <div className="target">click</div>
      </Trigger>,
    );
    const target = container.querySelector('.target');

    fireEvent.click(target);

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'bamboo-appear',
    );

    expect(
      document.querySelector('.rc-trigger-popup').style.pointerEvents,
    ).toEqual('');
  });

  it('use correct leave motion', () => {
    const cssMotionSpy = jest.spyOn(CSSMotion, 'render');
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
          leavedClassName: 'light',
        }}
      >
        <div className="target">click</div>
      </Trigger>,
    );
    const target = container.querySelector('.target');

    fireEvent.click(target);

    expect(cssMotionSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ leavedClassName: 'light' }),
      expect.anything(),
    );
  });

  it('not lock on appear', () => {
    const genTrigger = (props) => (
      <Trigger
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
        popupVisible
        {...props}
      >
        <span />
      </Trigger>
    );

    const { rerender } = render(genTrigger());

    expect(document.querySelector('.rc-trigger-popup')).not.toHaveStyle({
      pointerEvents: 'none',
    });

    rerender(genTrigger({ popupVisible: false }));
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      pointerEvents: 'none',
    });
  });
});

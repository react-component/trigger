import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
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
});

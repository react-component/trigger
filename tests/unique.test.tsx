import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import Trigger, { UniqueProvider } from '../src';
import { awaitFakeTimer } from './util';

describe('Trigger.Unique', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('moving will not hide the popup', async () => {
    const { container } = render(
      <UniqueProvider>
        <Trigger
          action={['hover']}
          popup={<strong className="x-content">tooltip1</strong>}
          unique
          mouseLeaveDelay={0.1}
        >
          <div className="target1">hover1</div>
        </Trigger>
        <Trigger
          action={['hover']}
          popup={<strong className="x-content">tooltip2</strong>}
          unique
          mouseLeaveDelay={0.1}
        >
          <div className="target2">hover2</div>
        </Trigger>
      </UniqueProvider>,
    );

    // Initially no popup should be visible
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Hover first trigger
    fireEvent.mouseEnter(container.querySelector('.target1'));
    await awaitFakeTimer();
    expect(document.querySelector('.x-content').textContent).toBe('tooltip1');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

    // Check that popup and float bg are visible
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );
    expect(
      document.querySelector('.rc-trigger-popup-float-bg').className,
    ).not.toContain('-hidden');

    // Move from first to second trigger - popup should not hide, but content should change
    fireEvent.mouseLeave(container.querySelector('.target1'));
    fireEvent.mouseEnter(container.querySelector('.target2'));

    // Wait a short time (less than leave delay) to ensure no close animation is triggered
    await awaitFakeTimer();

    // Popup should still be visible with new content (no close animation)
    expect(document.querySelector('.x-content').textContent).toBe('tooltip2');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );
    expect(
      document.querySelector('.rc-trigger-popup-float-bg').className,
    ).not.toContain('-hidden');

    // There should only be one popup element
    expect(document.querySelectorAll('.rc-trigger-popup').length).toBe(1);
    expect(document.querySelectorAll('.rc-trigger-popup-float-bg').length).toBe(
      1,
    );
  });
});

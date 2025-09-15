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
        >
          <div className="target1">hover1</div>
        </Trigger>
        <Trigger
          action={['hover']}
          popup={<strong className="x-content">tooltip2</strong>}
          unique
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

    // Move from first to second trigger - popup should not hide, but content should change
    fireEvent.mouseLeave(container.querySelector('.target1'));
    fireEvent.mouseEnter(container.querySelector('.target2'));
    await awaitFakeTimer();

    // Popup should still be visible with new content
    expect(document.querySelector('.x-content').textContent).toBe('tooltip2');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

    // There should only be one popup element
    expect(document.querySelectorAll('.rc-trigger-popup').length).toBe(1);
  });
});

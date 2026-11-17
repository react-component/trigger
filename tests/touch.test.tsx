import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import Trigger from '../src';
import { placementAlignMap } from './util';

/**
 * Dispatches a pointer event with a `pointerType`. jsdom has no
 * `PointerEvent`, so it is a mouse event carrying the property. React builds
 * `onPointerEnter` and `onPointerLeave` from `pointerover` and `pointerout`.
 */
function firePointer(target: Element, type: string, pointerType: string) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(target, event);
}

/**
 * The events a browser sends for a tap, in the order Chrome sends them: the
 * touch pointer enters, presses and leaves, then the compatibility mouse
 * events follow and the tap clicks.
 */
function tap(target: Element, pointerType = 'touch') {
  firePointer(target, 'pointerover', pointerType);
  firePointer(target, 'pointerdown', pointerType);
  fireEvent.touchStart(target);
  firePointer(target, 'pointerup', pointerType);
  firePointer(target, 'pointerout', pointerType);
  fireEvent.touchEnd(target);
  fireEvent.mouseEnter(target);
  fireEvent.mouseDown(target);
  fireEvent.mouseUp(target);
  fireEvent.click(target);
}

describe('Trigger.Touch', () => {
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

  function renderHover() {
    render(
      <Trigger
        action={['hover']}
        popupAlign={placementAlignMap.left}
        popup={<strong>trigger</strong>}
      >
        <div className="target" />
      </Trigger>,
    );

    return document.querySelector('.target');
  }

  function popup() {
    return document.querySelector('.rc-trigger-popup');
  }

  it('opens a hover popup on the first tap', () => {
    tap(renderHover());
    flush();

    expect(popup()).toBeTruthy();
    expect(popup()).not.toHaveClass('rc-trigger-popup-hidden');
  });

  it('opens on the first tap of a pen that also fires touch events', () => {
    tap(renderHover(), 'pen');
    flush();

    expect(popup()).not.toHaveClass('rc-trigger-popup-hidden');
  });

  it('closes on a second tap', () => {
    const target = renderHover();
    tap(target);
    flush();

    tap(target);
    flush();

    expect(popup()).toHaveClass('rc-trigger-popup-hidden');
  });

  it('opens on a mouse hover after a tap', () => {
    const target = renderHover();
    tap(target);
    flush();
    tap(target);
    flush();
    expect(popup()).toHaveClass('rc-trigger-popup-hidden');

    firePointer(target, 'pointerover', 'mouse');
    fireEvent.mouseEnter(target);
    flush();

    expect(popup()).not.toHaveClass('rc-trigger-popup-hidden');
  });

  it('never renders the popup for a touch that turns into a scroll', () => {
    const target = renderHover();

    firePointer(target, 'pointerover', 'touch');
    firePointer(target, 'pointerdown', 'touch');
    fireEvent.touchStart(target);
    // The browser takes the touch over to scroll: no click follows.
    firePointer(target, 'pointercancel', 'touch');
    firePointer(target, 'pointerout', 'touch');
    fireEvent.touchEnd(target);
    flush();

    expect(popup()).toBeFalsy();
  });

  it('opens on a tap when it wraps another trigger', () => {
    render(
      <Trigger
        action={['hover']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="outer">outer</strong>}
      >
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="inner">inner</strong>}
        >
          <div className="target" />
        </Trigger>
      </Trigger>,
    );

    tap(document.querySelector('.target'));
    flush();

    expect(document.querySelector('.outer').parentElement).not.toHaveClass(
      'rc-trigger-popup-hidden',
    );
  });
});

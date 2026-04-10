import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import * as React from 'react';
import Trigger from '../src';
import { placementAlignMap } from './util';

const flush = async () => {
  for (let i = 0; i < 10; i += 1) {
    act(() => {
      jest.runAllTimers();
    });

    await act(async () => {
      await Promise.resolve();
    });
  }
};

describe('Trigger focus management', () => {
  let eleRect = { width: 100, height: 100 };
  let popupRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  };

  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      clientWidth: { get: () => eleRect.width },
      clientHeight: { get: () => eleRect.height },
      offsetWidth: { get: () => eleRect.width },
      offsetHeight: { get: () => eleRect.height },
      offsetParent: { get: () => document.body },
    });

    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        return popupRect;
      },
    });

    spyElementPrototypes(HTMLButtonElement, {
      getBoundingClientRect() {
        return popupRect;
      },
    });
  });

  beforeEach(() => {
    eleRect = { width: 100, height: 100 };
    popupRect = { x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 };
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('moves focus to first tabbable in popup when opened by click (default)', async () => {
    render(
      <Trigger
        action="click"
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={
          <div>
            <button type="button">inner-one</button>
            <button type="button">inner-two</button>
          </div>
        }
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelectorAll('button')[0];
    const innerOne = () =>
      Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent === 'inner-one',
      )!;

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    expect(document.activeElement).toBe(innerOne());
  });

  it('does not auto-focus when hover is a show action', async () => {
    render(
      <Trigger
        action={['hover', 'click']}
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={<button type="button">inner</button>}
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelector('button')!;

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    const inner = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'inner',
    )!;
    expect(inner).toBeTruthy();
    expect(inner).not.toHaveFocus();
  });

  it('returns focus to trigger when popup closes', async () => {
    render(
      <Trigger
        action="click"
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={<button type="button">inner</button>}
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelector('button')!;

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    const inner = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'inner',
    )!;
    expect(document.activeElement).toBe(inner);

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    expect(document.activeElement).toBe(trigger);
  });

  it('traps Tab within the popup', async () => {
    render(
      <Trigger
        action="click"
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={
          <div>
            <button type="button">a</button>
            <button type="button">b</button>
          </div>
        }
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelectorAll('button')[0];

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    const btnA = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'a',
    )!;
    const btnB = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'b',
    )!;

    act(() => {
      btnB.focus();
    });

    fireEvent.keyDown(btnB, { key: 'Tab', shiftKey: false });

    expect(document.activeElement).toBe(btnA);

    fireEvent.keyDown(btnA, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(btnB);
  });

  it('respects focusPopup={false}', async () => {
    render(
      <Trigger
        action="click"
        focusPopup={false}
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={<button type="button">inner</button>}
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelector('button')!;

    act(() => {
      fireEvent.click(trigger);
    });

    await flush();

    const inner = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'inner',
    )!;
    expect(inner).not.toHaveFocus();
  });

  it('does not run tab trap when focusPopup is false (handler early return)', async () => {
    render(
      <Trigger
        action="click"
        focusPopup={false}
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={
          <div>
            <button type="button">a</button>
            <button type="button">b</button>
          </div>
        }
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelector('button')!;
    act(() => {
      fireEvent.click(trigger);
    });
    await flush();

    const popup = document.querySelector('.rc-trigger-popup')!;
    expect(popup).toBeTruthy();

    const btnA = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'a',
    )!;
    const btnB = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'b',
    )!;
    act(() => {
      btnB.focus();
    });

    fireEvent.keyDown(popup, { key: 'Tab', shiftKey: false, bubbles: true });

    expect(document.activeElement).toBe(btnB);
  });

  it('enables focus management by default for focus-only trigger', async () => {
    render(
      <Trigger
        action="focus"
        builtinPlacements={placementAlignMap}
        popupPlacement="bottom"
        popup={<button type="button">inner</button>}
      >
        <button type="button">trigger</button>
      </Trigger>,
    );

    const trigger = document.querySelector('button')!;

    act(() => {
      fireEvent.focus(trigger);
    });

    await flush();

    const inner = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'inner',
    )!;
    expect(document.activeElement).toBe(inner);
  });
});

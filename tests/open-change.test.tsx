import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import * as React from 'react';
import Trigger from '../src';

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

describe('Trigger.OpenChange', () => {
  let eleRect = {
    width: 100,
    height: 100,
  };

  let spanRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  };

  let popupRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  };

  beforeAll(() => {
    // Keep consistent with other tests to avoid layout related crash in jsdom
    spyElementPrototypes(HTMLElement, {
      clientWidth: {
        get: () => eleRect.width,
      },
      clientHeight: {
        get: () => eleRect.height,
      },
      offsetWidth: {
        get: () => eleRect.width,
      },
      offsetHeight: {
        get: () => eleRect.height,
      },
      offsetParent: {
        get: () => document.body,
      },
    });

    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        return popupRect;
      },
    });

    spyElementPrototypes(HTMLSpanElement, {
      getBoundingClientRect() {
        return spanRect;
      },
    });
  });

  beforeEach(() => {
    eleRect = { width: 100, height: 100 };
    spanRect = { x: 0, y: 0, left: 0, top: 0, width: 1, height: 1 };
    popupRect = { x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 };
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('should not trigger duplicated open callbacks when pointer and focus happen in same interaction', async () => {
    const onOpenChange = jest.fn();
    const onPopupVisibleChange = jest.fn();

    const { container } = render(
      <Trigger
        // 同时开启 hover + focus，制造 “一次交互两种事件都试图 open”
        action={['hover', 'focus']}
        popup={<strong>trigger</strong>}
        onOpenChange={onOpenChange}
        onPopupVisibleChange={onPopupVisibleChange}
      >
        <span className="target" />
      </Trigger>,
    );

    const target = container.querySelector('.target') as HTMLElement;

    act(() => {
      fireEvent.pointerEnter(target);
      fireEvent.focus(target);
    });

    await flush();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    expect(onPopupVisibleChange).toHaveBeenCalledTimes(1);
    expect(onPopupVisibleChange).toHaveBeenLastCalledWith(true);
  });

  it('should not trigger duplicated close callbacks when pointerleave and blur happen in same interaction', async () => {
    const onOpenChange = jest.fn();
    const onPopupVisibleChange = jest.fn();

    const { container } = render(
      <Trigger
        action={['hover', 'focus']}
        popup={<strong>trigger</strong>}
        defaultPopupVisible
        onOpenChange={onOpenChange}
        onPopupVisibleChange={onPopupVisibleChange}
      >
        <span className="target" />
      </Trigger>,
    );

    const target = container.querySelector('.target') as HTMLElement;

    act(() => {
      fireEvent.pointerLeave(target);
      fireEvent.blur(target);
    });

    await flush();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    expect(onPopupVisibleChange).toHaveBeenCalledTimes(1);
    expect(onPopupVisibleChange).toHaveBeenLastCalledWith(false);
  });
});

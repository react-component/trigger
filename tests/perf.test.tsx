import { cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import React from 'react';
import Trigger, { type TriggerProps } from '../src';
import { awaitFakeTimer, placementAlignMap } from './util';

jest.mock('../src/Popup', () => {
  const OriReact = jest.requireActual('react');
  const OriPopup = jest.requireActual('../src/Popup').default;

  return OriReact.forwardRef((props, ref) => {
    global.popupCalledTimes = (global.popupCalledTimes || 0) + 1;
    return <OriPopup {...props} ref={ref} />;
  });
});

describe('Trigger.Basic', () => {
  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    global.popupCalledTimes = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  async function trigger(dom: HTMLElement, selector: string, method = 'click') {
    fireEvent[method](dom.querySelector(selector));
    await awaitFakeTimer();
  }

  const renderTrigger = (props?: Partial<TriggerProps>) => (
    <Trigger
      action={['click']}
      popupAlign={placementAlignMap.left}
      popup={<strong className="x-content">tooltip2</strong>}
      {...props}
    >
      <div className="target">click</div>
    </Trigger>
  );

  describe('Performance', () => {
    it('not create Popup when !open', async () => {
      const { container } = render(renderTrigger());

      // Not render Popup
      await awaitFakeTimer();
      expect(global.popupCalledTimes).toBe(0);

      // Now can render Popup
      await trigger(container, '.target');
      expect(global.popupCalledTimes).toBeGreaterThan(0);

      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    });

    it('forceRender should create when !open', async () => {
      const { container } = render(
        renderTrigger({
          forceRender: true,
        }),
      );

      await awaitFakeTimer();
      await trigger(container, '.target');
      expect(global.popupCalledTimes).toBeGreaterThan(0);

      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    });

    it('hide should keep render Popup', async () => {
      const { rerender } = render(
        renderTrigger({
          popupVisible: true,
        }),
      );

      await awaitFakeTimer();
      expect(global.popupCalledTimes).toBeGreaterThan(0);

      // Hide
      global.popupCalledTimes = 0;
      rerender(
        renderTrigger({
          popupVisible: false,
        }),
      );
      await awaitFakeTimer();
      expect(global.popupCalledTimes).toBeGreaterThan(0);
    });
  });
});

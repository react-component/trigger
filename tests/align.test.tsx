import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import React from 'react';
import type { TriggerProps, TriggerRef } from '../src';
import Trigger from '../src';
import { awaitFakeTimer } from './util';

import { _rs } from '@rc-component/resize-observer';

export const triggerResize = (target: Element) => {
  act(() => {
    _rs([{ target } as ResizeObserverEntry]);
  });
};

describe('Trigger.Align', () => {
  let targetVisible = true;

  let rectX = 100;
  let rectY = 100;
  let rectWidth = 100;
  let rectHeight = 100;

  beforeAll(() => {
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect: () => ({
        x: rectX,
        y: rectY,
        left: rectX,
        top: rectY,
        width: rectWidth,
        height: rectHeight,
        right: 200,
        bottom: 200,
      }),
    });

    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => (targetVisible ? document.body : null),
      },
    });
    spyElementPrototypes(SVGElement, {
      offsetParent: {
        get: () => (targetVisible ? document.body : null),
      },
    });
  });

  beforeEach(() => {
    targetVisible = true;

    rectX = 100;
    rectY = 100;
    rectWidth = 100;
    rectHeight = 100;

    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('not show', async () => {
    const onAlign = jest.fn();

    const Demo = (props: Partial<TriggerProps>) => {
      const scrollRef = React.useRef<HTMLDivElement>(null);

      return (
        <>
          <div
            className="scroll"
            ref={scrollRef}
            // Jest can not get calculated style in jsdom. So we need to set it manually
            style={{ overflowX: 'hidden', overflowY: 'hidden' }}
          />
          <Trigger
            onPopupAlign={onAlign}
            popupAlign={{
              points: ['bl', 'tl'],
            }}
            popup={<strong>trigger</strong>}
            getPopupContainer={() => scrollRef.current!}
            {...props}
          >
            <div />
          </Trigger>
        </>
      );
    };

    const { rerender, container } = render(<Demo />);
    const scrollDiv = container.querySelector('.scroll')!;

    const mockAddEvent = jest.spyOn(scrollDiv, 'addEventListener');

    expect(mockAddEvent).not.toHaveBeenCalled();

    // Visible
    rerender(<Demo popupVisible />);
    expect(mockAddEvent).toHaveBeenCalled();

    // Scroll
    onAlign.mockReset();
    fireEvent.scroll(scrollDiv);

    await awaitFakeTimer();
    expect(onAlign).toHaveBeenCalled();
  });

  it('resize align', async () => {
    const onAlign = jest.fn();

    const { container } = render(
      <Trigger
        onPopupAlign={onAlign}
        popupVisible
        popupAlign={{
          points: ['bl', 'tl'],
        }}
        popup={<strong>trigger</strong>}
      >
        <span className="target" />
      </Trigger>,
    );

    await Promise.resolve();
    onAlign.mockReset();

    // Resize
    const target = container.querySelector('.target')!;
    triggerResize(target);

    await awaitFakeTimer();
    expect(onAlign).toHaveBeenCalled();
  });

  it('placement is higher than popupAlign', async () => {
    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        builtinPlacements={{
          top: {},
        }}
        popupPlacement="top"
        popupAlign={{}}
      >
        <span />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(
      document.querySelector('.rc-trigger-popup-placement-top'),
    ).toBeTruthy();
  });

  it('invisible should not align', async () => {
    const onPopupAlign = jest.fn();
    const triggerRef = React.createRef<TriggerRef>();

    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{}}
        onPopupAlign={onPopupAlign}
        ref={triggerRef}
      >
        <span />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(onPopupAlign).toHaveBeenCalled();
    onPopupAlign.mockReset();

    for (let i = 0; i < 10; i += 1) {
      triggerRef.current!.forceAlign();

      await awaitFakeTimer();
      expect(onPopupAlign).toHaveBeenCalled();
      onPopupAlign.mockReset();
    }

    // Make invisible
    targetVisible = false;

    triggerRef.current!.forceAlign();
    await awaitFakeTimer();
    expect(onPopupAlign).not.toHaveBeenCalled();
  });

  it('align should merge into placement', async () => {
    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        builtinPlacements={{
          top: {
            targetOffset: [0, 0],
          },
        }}
        popupPlacement="top"
        popupAlign={{
          targetOffset: [-903, -1128],
        }}
      >
        <svg />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(
      document.querySelector('.rc-trigger-popup-placement-top'),
    ).toHaveStyle({
      left: `753px`,
      top: `978px`,
    });
  });

  it('targetOffset support ptg', async () => {
    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{
          targetOffset: ['50%', '-50%'],
        }}
      >
        <div />
      </Trigger>,
    );

    await awaitFakeTimer();

    // Correct this if I miss understand the value calculation
    // from https://github.com/yiminghe/dom-align/blob/master/src/getElFuturePos.js
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      left: `-50px`,
      top: `50px`,
    });
  });

  it('support dynamicInset', async () => {
    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{
          points: ['bc', 'tc'],
          _experimental: {
            dynamicInset: true,
          },
        }}
      >
        <div />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      bottom: `100px`,
    });
  });

  it('floor when decimal precision', async () => {
    rectX = 22.6;
    rectY = 33.4;
    rectWidth = 33.7;
    rectHeight = 55.9;

    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{
          points: ['tl', 'bl'],
        }}
      >
        <div />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      top: `55px`,
    });
  });

  it('both adjustX and adjustY should get correct points', async () => {
    // Set target position to top left corner to force flip to bottom right
    rectX = 0;
    rectY = 0;
    rectWidth = 100;
    rectHeight = 100;

    const onPopupAlign = jest.fn();

    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        onPopupAlign={onPopupAlign}
      >
        <div />
      </Trigger>,
    );

    await awaitFakeTimer();

    // Check that the points have been flipped correctly
    expect(onPopupAlign).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        points: ['br', 'tr'],
      }),
    );
  });

  // https://github.com/react-component/trigger/issues/XXX
  it('should not modify popup styles during alignment measurement', async () => {
    // On some platforms (notably Linux), the alignment calculation runs
    // mid-CSS-animation. The fix uses a temporary measurement element
    // instead of modifying the popup's styles, so CSS animations
    // (transform, transition) are never disrupted.

    render(
      <Trigger
        popupVisible
        popup={<span className="popup-content" />}
        popupAlign={{
          points: ['tl', 'bl'],
        }}
      >
        <div className="trigger-target" />
      </Trigger>,
    );

    await awaitFakeTimer();

    const popupElement = document.querySelector(
      '.rc-trigger-popup',
    ) as HTMLElement;
    expect(popupElement).toBeTruthy();

    // Spy on popup style mutations during alignment using property setter
    // spies (catches both direct assignment and setProperty)
    const styleChanges: string[] = [];
    const propsToWatch = ['left', 'top', 'transform', 'transition', 'overflow'];
    const restoreSpies: (() => void)[] = [];

    propsToWatch.forEach((prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        CSSStyleDeclaration.prototype,
        prop,
      );
      if (descriptor?.set) {
        const origSet = descriptor.set;
        Object.defineProperty(popupElement.style, prop, {
          set(value: string) {
            styleChanges.push(prop);
            origSet.call(this, value);
          },
          get: descriptor.get,
          configurable: true,
        });
        restoreSpies.push(() => {
          Object.defineProperty(popupElement.style, prop, descriptor);
        });
      }
    });

    // Trigger re-alignment
    triggerResize(popupElement);
    await awaitFakeTimer();

    // Restore original property descriptors
    restoreSpies.forEach((restore) => restore());

    // The popup's styles should not have been modified directly during
    // measurement (only the final positioning values should be applied
    // via the React state update, not during the measurement phase)
    expect(styleChanges).not.toContain('left');
    expect(styleChanges).not.toContain('top');
    expect(styleChanges).not.toContain('transform');
    expect(styleChanges).not.toContain('transition');
    expect(styleChanges).not.toContain('overflow');
  });
});

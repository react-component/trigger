import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import type { TriggerProps, TriggerRef } from '../src';
import Trigger from '../src';
import { awaitFakeTimer } from './util';

import { _rs } from 'rc-resize-observer';

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

  it('round when decimal precision', async () => {
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
      top: `56px`,
    });
  });
});

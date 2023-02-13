/* eslint-disable max-classes-per-file */

import { cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import Trigger, { TriggerProps } from '../src';

describe('Trigger.Scroll', () => {
  beforeAll(() => {
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect: () => ({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      }),
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('not show', () => {
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

    const mockAddEvent = jest.spyOn(
      container.querySelector('.scroll')!,
      'addEventListener',
    );

    expect(mockAddEvent).not.toHaveBeenCalled();

    // Visible
    rerender(<Demo popupVisible />);
    expect(mockAddEvent).toHaveBeenCalled();
  });
});

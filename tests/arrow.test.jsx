/* eslint-disable max-classes-per-file */

import { act, cleanup, render } from '@testing-library/react';
import {
  spyElementPrototype,
  spyElementPrototypes,
} from 'rc-util/lib/test/domHook';
import Trigger from '../src';

describe('Trigger.Arrow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  async function awaitFakeTimer() {
    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      });
    }
  }

  it('not show', () => {
    render(
      <Trigger popupVisible popup={<strong>trigger</strong>} arrow>
        <div />
      </Trigger>,
    );
  });

  describe('direction', () => {
    let divSpy;
    let windowSpy;

    beforeAll(() => {
      divSpy = spyElementPrototype(
        HTMLDivElement,
        'getBoundingClientRect',
        () => ({
          x: 200,
          y: 200,
          width: 100,
          height: 50,
        }),
      );

      windowSpy = spyElementPrototypes(Window, {
        clientWidth: {
          get: () => 1000,
        },
        clientHeight: {
          get: () => 1000,
        },
      });
    });

    afterAll(() => {
      divSpy.mockRestore();
      windowSpy.mockRestore();
    });

    function test(name, align, style) {
      it(name, async () => {
        render(
          <Trigger
            popupVisible
            popupAlign={align}
            popup={<strong>trigger</strong>}
            arrow
          >
            <div />
          </Trigger>,
        );

        await awaitFakeTimer();

        console.log(document.body.innerHTML);
        expect(document.querySelector('.rc-trigger-popup-arrow')).toHaveStyle(
          style,
        );
      });
    }

    // Top
    test(
      'top',
      {
        points: ['bl', 'tl'],
      },
      {
        bottom: 0,
      },
    );

    // Bottom
    test(
      'bottom',
      {
        points: ['tc', 'bc'],
      },
      {
        top: 0,
      },
    );

    // Left
    test(
      'left',
      {
        points: ['cr', 'cl'],
      },
      {
        right: 0,
      },
    );

    // Right
    test(
      'right',
      {
        points: ['cl', 'cr'],
      },
      {
        left: 0,
      },
    );
  });
});

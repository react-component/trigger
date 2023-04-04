import { act, cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import Trigger from '../src';

/*
                        ***********
    ******************  *         *
    *   Placement    *  *  Popup  *
    *   **********   *  *         *
    *   * Target *   *  *         *
    *   **********   *  ***********
    *                *
    *                *
    ******************

When `placement` is `top`. It will find should flip to bottom:

    ******************
    *                *
    *   **********   *
    *   * Target *   *
    *   **********   *  *********** top: 200
    *   Placement    *  *         *
    *                *  *  Popup  *
    ******************  *         *
                        *         *
                        ***********

When `placement` is `bottom`. It will find should shift to show in viewport:

    ******************
    *                *
    *   **********   *  *********** top: 100
    *   * Target *   *  *         *
    *   **********   *  *  Popup  *
    *   Placement    *  *         *
    *                *  *         *
    ******************  ***********

*/

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustY: true,
      shiftY: true,
    },
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustY: true,
      shiftY: true,
    },
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftX: true,
    },
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftX: true,
    },
  },
};

describe('Trigger.Flip+Shift', () => {
  beforeAll(() => {
    // Viewport size
    spyElementPrototypes(HTMLElement, {
      clientWidth: {
        get: () => 400,
      },
      clientHeight: {
        get: () => 400,
      },
    });

    // Popup size
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        return {
          x: 0,
          y: 0,
          width: 100,
          height: 300,
        };
      },
    });
    spyElementPrototypes(HTMLSpanElement, {
      getBoundingClientRect() {
        return {
          x: 0,
          y: 100,
          width: 100,
          height: 100,
        };
      },
    });
    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('both work', async () => {
    render(
      <Trigger
        popupVisible
        popupPlacement="top"
        builtinPlacements={builtinPlacements}
        popup={<strong>trigger</strong>}
      >
        <span className="target" />
      </Trigger>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    console.log(document.body.innerHTML);

    expect(
      document.querySelector('.rc-trigger-popup-placement-bottom'),
    ).toBeTruthy();

    expect(
      document.querySelector('.rc-trigger-popup-placement-bottom'),
    ).toHaveStyle({
      top: '100px',
    });
  });
});

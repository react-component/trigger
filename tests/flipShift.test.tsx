import { act, cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
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
  topShift: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: true,
    },
    htmlRegion: 'visibleFirst' as const,
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
  let spanRect = { x: 0, y: 0, width: 0, height: 0 };

  beforeEach(() => {
    spanRect = {
      x: 0,
      y: 100,
      width: 100,
      height: 100,
    };

    document.documentElement.scrollLeft = 0;
  });

  beforeAll(() => {
    jest
      .spyOn(document.documentElement, 'scrollWidth', 'get')
      .mockReturnValue(1000);

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
        return spanRect;
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

    expect(
      document.querySelector('.rc-trigger-popup-placement-bottom'),
    ).toBeTruthy();

    expect(
      document.querySelector('.rc-trigger-popup-placement-bottom'),
    ).toHaveStyle({
      top: '100px',
    });
  });

  it('top with visibleFirst region', async () => {
    spanRect.x = -1000;
    document.documentElement.scrollLeft = 500;

    render(
      <Trigger
        popupVisible
        popupPlacement="topShift"
        builtinPlacements={builtinPlacements}
        popup={<strong>trigger</strong>}
      >
        <span className="target" />
      </Trigger>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Just need check left < 0
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      left: '-900px',
    });
  });

  // https://github.com/ant-design/ant-design/issues/44096
  // Note: Safe to modify `top` style compare if refactor
  it('flip not shake by offset with shift', async () => {
    spanRect.y = -1000;

    render(
      <Trigger
        popupVisible
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: {
            adjustY: true,
            shiftY: true,
          },
          offset: [0, 33],
        }}
        popup={<strong>trigger</strong>}
      >
        <span className="target" />
      </Trigger>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Just need check left < 0
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      top: '-867px',
    });
  });
});

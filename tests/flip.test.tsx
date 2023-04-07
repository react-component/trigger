import { act, cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import Trigger from '../src';
import { getVisibleArea } from '../src/util';

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
};

describe('Trigger.Align', () => {
  let spanRect = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
  };

  let popupRect = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };

  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      clientWidth: {
        get: () => 100,
      },
      clientHeight: {
        get: () => 100,
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

    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    spanRect = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    };
    popupRect = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  describe('not flip if cant', () => {
    const list = [
      {
        placement: 'right',
        x: 10,
        className: '.rc-trigger-popup-placement-right',
      },
      {
        placement: 'left',
        x: 90,
        className: '.rc-trigger-popup-placement-left',
      },
      {
        placement: 'top',
        y: 90,
        className: '.rc-trigger-popup-placement-top',
      },
      {
        placement: 'bottom',
        y: 10,
        className: '.rc-trigger-popup-placement-bottom',
      },
    ];

    list.forEach(({ placement, x = 0, y = 0, className }) => {
      it(placement, async () => {
        spanRect.x = x;
        spanRect.y = y;

        render(
          <Trigger
            popupVisible
            popupPlacement={placement}
            builtinPlacements={builtinPlacements}
            popup={<strong>trigger</strong>}
          >
            <span className="target" />
          </Trigger>,
        );

        await act(async () => {
          await Promise.resolve();
        });

        expect(document.querySelector(className)).toBeTruthy();
      });
    });
  });

  describe('flip if can', () => {
    const list = [
      {
        placement: 'right',
        x: 90,
        className: '.rc-trigger-popup-placement-left',
      },
      {
        placement: 'left',
        x: 10,
        className: '.rc-trigger-popup-placement-right',
      },
      {
        placement: 'top',
        y: 10,
        className: '.rc-trigger-popup-placement-bottom',
      },
      {
        placement: 'bottom',
        y: 90,
        className: '.rc-trigger-popup-placement-top',
      },
    ];

    list.forEach(({ placement, x = 0, y = 0, className }) => {
      it(placement, async () => {
        spanRect.x = x;
        spanRect.y = y;

        render(
          <Trigger
            popupVisible
            popupPlacement={placement}
            builtinPlacements={builtinPlacements}
            popup={<strong>trigger</strong>}
          >
            <span className="target" />
          </Trigger>,
        );

        await act(async () => {
          await Promise.resolve();
        });

        expect(document.querySelector(className)).toBeTruthy();
      });
    });
  });

  // `getPopupContainer` sometime makes the popup 0/0 not start at left top.
  // We need cal the real visible position
  /*

  *******************
  *          Target *
  *          *************
  *          *   Popup   *
  *          *************
  *                 *
  *******************

  To:

  *******************
  *          Target *
  *   ************* *
  *   *   Popup   * *
  *   ************* *
  *                 *
  *******************

  */
  it('popup start position not at left top', async () => {
    spanRect.x = 99;
    spanRect.y = 0;

    popupRect = {
      x: 100,
      y: 1,
      width: 100,
      height: 100,
    };

    render(
      <Trigger
        popupVisible
        popupPlacement="topLeft"
        builtinPlacements={{
          topLeft: {
            points: ['tl', 'bl'],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          },
          topRight: {
            points: ['tr', 'br'],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          },
        }}
        popup={<strong>trigger</strong>}
      >
        <span className="target" />
      </Trigger>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Flip
    expect(
      document.querySelector('.rc-trigger-popup-placement-topRight'),
    ).toBeTruthy();

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      left: `-100px`, // (left: 100) - (offset: 100) = 0
      top: `0px`,
    });
  });

  // Static parent should not affect popup position
  // https://github.com/ant-design/ant-design/issues/41644
  it('static parent should not affect popup position', async () => {
    /*

    ********************
    *                  *
    *  **************  *
    *  *   Affect   *  *
    *  * ********** *  *
    *  * *   Not  * *  *
    *  * ********** *  *
    *                  *
    *  **************  *
    *                  *
    ********************

    */
    const initArea = {
      left: 0,
      right: 500,
      top: 0,
      bottom: 500,
    };

    // Affected area
    const affectEle = document.createElement('div');
    document.body.appendChild(affectEle);

    affectEle.style.position = 'absolute';
    Object.defineProperties(affectEle, {
      offsetHeight: {
        get: () => 300,
      },
      offsetWidth: {
        get: () => 300,
      },
      clientHeight: {
        get: () => 300,
      },
      clientWidth: {
        get: () => 300,
      },
    });
    affectEle.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 100,
        width: 300,
        height: 300,
      } as any);

    // Skip area
    const skipEle = document.createElement('div');
    document.body.appendChild(skipEle);

    skipEle.style.position = 'static';
    Object.defineProperties(skipEle, {
      offsetHeight: {
        get: () => 100,
      },
      offsetWidth: {
        get: () => 100,
      },
      clientHeight: {
        get: () => 100,
      },
      clientWidth: {
        get: () => 100,
      },
    });
    skipEle.getBoundingClientRect = () =>
      ({
        x: 200,
        y: 200,
        width: 100,
        height: 100,
      } as any);

    const visibleArea = getVisibleArea(initArea, [affectEle, skipEle]);
    expect(visibleArea).toEqual({
      left: 100,
      right: 400,
      top: 100,
      bottom: 400,
    });
  });

  // e.g. adjustY + shiftX may make popup out but push back in screen
  // which should keep flip
  /*

  *************      Screen
  *   Popup   ********************
  *************                  *
     * Target *                  *
     **********                  *
              *                  *
              ********************

  To:

                    Screen
              ********************
     **********                  *
     * Target *                  *
     ******************          *
          *   Popup   *          *
          ************************

  */
  it('out of screen should keep flip', async () => {
    spanRect.x = -200;
    spanRect.y = 0;

    popupRect = {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    };

    render(
      <Trigger
        popupVisible
        popupPlacement="top"
        builtinPlacements={{
          top: {
            points: ['bc', 'tc'],
            overflow: {
              shiftX: true,
              adjustY: true,
            },
          },
          bottom: {
            points: ['tc', 'bc'],
            overflow: {
              shiftX: true,
              adjustY: true,
            },
          },
        }}
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
  });
});

import { act, cleanup, render } from '@testing-library/react';
import { _rs } from 'rc-resize-observer';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import * as React from 'react';
import type { AlignType, TriggerProps } from '../src';
import Trigger from '../src';
import { getVisibleArea } from '../src/util';

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

const builtinPlacements: Record<string, AlignType> = {
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
  let eleRect = {
    width: 100,
    height: 100,
  };

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
    eleRect = {
      width: 100,
      height: 100,
    };
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

        await flush();

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

        await flush();

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

    await flush();

    // Flip
    expect(
      document.querySelector('.rc-trigger-popup-placement-topRight'),
    ).toBeTruthy();

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      left: `-100px`, // (left: 100) - (offset: 100) = 0
      top: `0px`,
    });
  });

  it('overflowClipMargin support', async () => {
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
    affectEle.style.overflow = 'clip';
    affectEle.style.overflowClipMargin = '50px';

    const oriGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (ele: HTMLElement) => {
      const retObj = oriGetComputedStyle(ele);
      if (ele.style.overflowClipMargin) {
        retObj.overflowClipMargin = ele.style.overflowClipMargin;
      }
      return retObj;
    };

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

    const visibleArea = getVisibleArea(initArea, [affectEle]);
    expect(visibleArea).toEqual({
      left: 50,
      right: 450,
      top: 50,
      bottom: 450,
    });

    window.getComputedStyle = oriGetComputedStyle;
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

    await flush();

    expect(
      document.querySelector('.rc-trigger-popup-placement-bottom'),
    ).toBeTruthy();
  });

  // https://github.com/ant-design/ant-design/issues/41728
  describe('save prev flip position', () => {
    const flipList: {
      name: string;
      placement: string;
      x?: number;
      y?: number;
      className: string;

      // Move target position should back to origin placement which is visible
      backX?: number;
      backY?: number;
      backClassName: string;
    }[] = [
      {
        name: 'top2bottom',
        placement: 'top',
        y: 20,
        className: '.rc-trigger-popup-placement-bottom',
        backY: 95,
        backClassName: '.rc-trigger-popup-placement-top',
      },
      {
        name: 'bottom2top',
        placement: 'bottom',
        y: 80,
        className: '.rc-trigger-popup-placement-top',
        backY: 5,
        backClassName: '.rc-trigger-popup-placement-bottom',
      },
      {
        name: 'left2right',
        placement: 'left',
        x: 20,
        className: '.rc-trigger-popup-placement-right',
        backX: 95,
        backClassName: '.rc-trigger-popup-placement-left',
      },
      {
        name: 'right2left',
        placement: 'right',
        x: 80,
        className: '.rc-trigger-popup-placement-left',
        backX: 5,
        backClassName: '.rc-trigger-popup-placement-right',
      },
    ];

    flipList.forEach(
      ({
        name,
        placement,
        x = 0,
        y = 0,
        backX = 0,
        backY = 0,
        className,
        backClassName,
      }) => {
        it(name, async () => {
          spanRect.x = x;
          spanRect.y = y;
          popupRect.width = 30;
          popupRect.height = 30;

          const onPopupAlign = jest.fn();

          const Demo = ({ popupPlacement }: Partial<TriggerProps>) => (
            <Trigger
              popupVisible
              popupPlacement={popupPlacement}
              builtinPlacements={builtinPlacements}
              popup={<strong>trigger</strong>}
              onPopupAlign={onPopupAlign}
            >
              <span className="target" />
            </Trigger>
          );

          render(<Demo popupPlacement={placement} />);

          await flush();

          expect(document.querySelector(className)).toBeTruthy();
          expect(onPopupAlign).toHaveBeenCalled();
          onPopupAlign.mockReset();

          // Change size to small than target position
          popupRect.width = 10;
          popupRect.height = 10;

          act(() => {
            _rs([
              {
                target: document.querySelector('.rc-trigger-popup'),
              } as ResizeObserverEntry,
            ]);
          });
          await flush();

          expect(document.querySelector(className)).toBeTruthy();
          expect(onPopupAlign).toHaveBeenCalled();
          onPopupAlign.mockReset();

          // Change target position to back of origin placement
          spanRect.x = backX;
          spanRect.y = backY;

          act(() => {
            _rs([
              {
                target: document.querySelector('.target'),
              } as ResizeObserverEntry,
            ]);
          });
          await flush();

          expect(document.querySelector(backClassName)).toBeTruthy();
          expect(onPopupAlign).toHaveBeenCalled();
        });
      },
    );
  });
});

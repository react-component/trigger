/* eslint-disable @typescript-eslint/no-invalid-this */
import { act, cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import * as React from 'react';
import type { AlignType, TriggerProps, TriggerRef } from '../src';
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

const builtinPlacements: Record<string, AlignType> = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    htmlRegion: 'visibleFirst',
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    htmlRegion: 'visibleFirst',
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    htmlRegion: 'visibleFirst',
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    htmlRegion: 'visibleFirst',
  },
};

describe('Trigger.VisibleFirst', () => {
  let containerRect = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };

  let targetRect = {
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

  let scrollLeft = 0;
  let scrollTop = 0;

  beforeEach(() => {
    scrollLeft = 0;
    scrollTop = 0;

    containerRect = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    targetRect = {
      x: 250,
      y: 250,
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

  beforeAll(() => {
    function getBoundingClientRect(ele: HTMLElement) {
      if (ele.classList.contains('container')) {
        return containerRect;
      }
      if (ele.classList.contains('target')) {
        return targetRect;
      }
      if (ele.classList.contains('rc-trigger-popup')) {
        return popupRect;
      }
    }

    spyElementPrototypes(HTMLElement, {
      clientWidth: {
        get() {
          return getBoundingClientRect(this).width;
        },
      },
      clientHeight: {
        get() {
          return getBoundingClientRect(this).height;
        },
      },
      offsetWidth: {
        get() {
          return getBoundingClientRect(this).width;
        },
      },
      offsetHeight: {
        get() {
          return getBoundingClientRect(this).height;
        },
      },
      getBoundingClientRect() {
        return getBoundingClientRect(this);
      },
    });

    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });

    spyElementPrototypes(HTMLHtmlElement, {
      clientWidth: {
        get: () => 500,
      },
      clientHeight: {
        get: () => 500,
      },
      scrollWidth: {
        get: () => 1000,
      },
      scrollHeight: {
        get: () => 1000,
      },
      scrollLeft: {
        get: () => scrollLeft,
      },
      scrollTop: {
        get: () => scrollTop,
      },
    });
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  /**
   * +----------- Window -----------+--+
   * |                    |H100     |  |
   * |  +---- Container ----+       |  |
   * |  |            |      |       +--+
   * |  |       W100 |H200  |       |  |
   * |  |    +--------+     |       |  |  Scroll is higher than target
   * |  |    | Target |H100 |       |  |  `visibleFirst` 下如果上面的空间不足，但是滚动空间够
   * |  |    +--------+     +       |  |  则仍然是在下方展示
   * |  |    |        |     |H100   |  |
   * +--+    +        |     +-------+--+
   *    |    |  Popup |H300 |
   *    |    |        |     |
   *    |    |        |     |
   *    |    +--------+     |
   *    +-------------------+
   */
  const placementList = [
    {
      name: 'bottom',
      scroll: { y: 100, height: 1000, x: 0, width: 500 },
      target: { y: 300 - 1 },
      popup: { height: 300 },

      adjustPlacement: 'top',
      adjustTarget: { y: 400 },
    },

    {
      name: 'top',
      scrollTop: 500,
      scroll: { y: -700, height: 1000, x: 0, width: 500 },
      target: { y: 0 },
      popup: { height: 300 },

      adjustPlacement: 'bottom',
      adjustTarget: { y: -100 },
    },

    {
      name: 'right',
      scroll: { x: 100, width: 1000, y: 0, height: 500 },
      target: { x: 300 - 1 },
      popup: { width: 300 },

      adjustPlacement: 'left',
      adjustTarget: { x: 400 },
    },

    {
      name: 'left',
      scrollLeft: 500,
      scroll: { x: -700, width: 1000, y: 0, height: 500 },
      target: { x: 0 },
      popup: { width: 300 },

      adjustPlacement: 'right',
      adjustTarget: { x: -100 },
    },
  ];

  placementList.forEach(
    ({
      name,
      scroll,
      target,
      popup,
      adjustPlacement,
      adjustTarget,
      scrollTop: st,
      scrollLeft: sl,
    }) => {
      it(`keep show in ${name}`, async () => {
        containerRect = {
          ...containerRect,
          ...scroll,
        };
        targetRect = {
          ...targetRect,
          ...target,
        };
        popupRect = {
          ...popupRect,
          ...popup,
        };

        if (st !== undefined) {
          scrollTop = st;
        }
        if (sl !== undefined) {
          scrollLeft = sl;
        }

        const triggerRef = React.createRef<TriggerRef>();

        const Demo = (props: Partial<TriggerProps>) => (
          <div className="container" style={{ overflow: 'hidden' }}>
            <Trigger
              popupVisible
              popup={<div className="popup" />}
              builtinPlacements={builtinPlacements}
              getPopupContainer={(e) => e.parentElement}
              ref={triggerRef}
              {...props}
            >
              <span className="target" />
            </Trigger>
          </div>
        );

        const { container, rerender } = render(
          <Demo popupPlacement={adjustPlacement} />,
        );

        await flush();
        expect(container.querySelector(`.rc-trigger-popup`)).toHaveClass(
          `rc-trigger-popup-placement-${name}`,
        );

        // Adjust to fit
        targetRect = {
          ...targetRect,
          ...adjustTarget,
        };
        rerender(<Demo popupPlacement={name} />);
        await flush();
        expect(container.querySelector(`.rc-trigger-popup`)).toHaveClass(
          `rc-trigger-popup-placement-${adjustPlacement}`,
        );
      });
    },
  );
});

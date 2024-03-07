/* eslint-disable max-classes-per-file */

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React, { StrictMode, createRef } from 'react';
import ReactDOM from 'react-dom';
import Trigger from '../src';
import { awaitFakeTimer, placementAlignMap } from './util';

describe('Trigger.Basic', () => {
  beforeAll(() => {
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

  function trigger(dom, selector, method = 'click') {
    fireEvent[method](dom.querySelector(selector));
    act(() => jest.runAllTimers());
  }

  function isPopupHidden() {
    return document
      .querySelector('.rc-trigger-popup')
      .className.includes('-hidden');
  }
  function isPopupClassHidden(name) {
    return document.querySelector(name).className.includes('-hidden');
  }
  function isPopupAllHidden() {
    const popupArr = document.querySelectorAll('.rc-trigger-popup');

    return Array.from(popupArr).every((item) =>
      item.className.includes('-hidden'),
    );
  }
  describe('getPopupContainer', () => {
    it('defaults to document.body', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');

      const popupDomNode = document.querySelector('.rc-trigger-popup');
      expect(popupDomNode.parentNode.parentNode).toBeInstanceOf(
        HTMLBodyElement,
      );
    });

    it('can change', () => {
      function getPopupContainer(node) {
        return node.parentNode;
      }

      const { container } = render(
        <div className="holder">
          <Trigger
            action={['click']}
            getPopupContainer={getPopupContainer}
            popupAlign={placementAlignMap.left}
            popup={<strong className="x-content">tooltip2</strong>}
          >
            <div className="target">click</div>
          </Trigger>
        </div>,
        document.createElement('div'),
      );

      trigger(container, '.target');

      const popupDomNode = document.querySelector('.rc-trigger-popup');
      expect(popupDomNode.parentNode).toBe(container.querySelector('.holder'));
    });
  });

  describe('action', () => {
    it('click works', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.x-content').textContent).toBe('tooltip2');

      trigger(container, '.target');
      expect(isPopupHidden).toBeTruthy();
    });

    it('click works with function', () => {
      const popup = function renderPopup() {
        return <strong className="x-content">tooltip3</strong>;
      };
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={popup}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.x-content').textContent).toBe('tooltip3');

      trigger(container, '.target');
      expect(isPopupHidden()).toBeTruthy();
    });

    describe('hover works', () => {
      it('mouse event', () => {
        const { container } = render(
          <Trigger
            action={['hover']}
            popupAlign={placementAlignMap.left}
            popup={<strong>trigger</strong>}
          >
            <div className="target">click</div>
          </Trigger>,
        );

        trigger(container, '.target', 'mouseEnter');
        expect(isPopupHidden()).toBeFalsy();

        trigger(container, '.target', 'mouseLeave');
        expect(isPopupHidden()).toBeTruthy();
      });

      it('pointer event', () => {
        const { container } = render(
          <Trigger
            action={['hover']}
            popupAlign={placementAlignMap.left}
            popup={<strong>trigger</strong>}
          >
            <div className="target">click</div>
          </Trigger>,
        );

        trigger(container, '.target', 'pointerEnter');
        expect(isPopupHidden()).toBeFalsy();

        trigger(container, '.target', 'pointerLeave');
        expect(isPopupHidden()).toBeTruthy();

        // Enter again but move in popup
        trigger(container, '.target', 'pointerEnter');
        expect(isPopupHidden()).toBeFalsy();

        fireEvent.pointerLeave(container.querySelector('.target'));
        trigger(document, '.rc-trigger-popup', 'pointerEnter');
        expect(isPopupHidden()).toBeFalsy();
      });
    });

    it('contextMenu works', () => {
      const triggerRef = createRef();
      const { container } = render(
        <Trigger
          ref={triggerRef}
          action={['contextMenu']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div className="target">contextMenu</div>
        </Trigger>,
      );

      trigger(container, '.target', 'contextMenu');
      expect(isPopupHidden()).toBeFalsy();

      fireEvent.click(document.querySelector('.target'));

      expect(isPopupHidden()).toBeTruthy();
    });
    it('contextMenu all close', () => {
      const triggerRef1 = createRef();
      const triggerRef2 = createRef();
      const { container } = render(
        <>
          <Trigger
            ref={triggerRef1}
            popupClassName="trigger-popup1"
            action={['contextMenu']}
            popupAlign={placementAlignMap.left}
            popup={<strong>trigger1</strong>}
          >
            <div className="target1">contextMenu 1</div>
          </Trigger>
          <Trigger
            ref={triggerRef2}
            action={['contextMenu']}
            popupClassName="trigger-popup2"
            popupAlign={placementAlignMap.right}
            popup={<strong>trigger2</strong>}
          >
            <div className="target2">contextMenu 2</div>
          </Trigger>
        </>,
      );

      trigger(container, '.target1', 'contextMenu');
      trigger(container, '.target2', 'contextMenu');
      expect(isPopupClassHidden('.trigger-popup1')).toBeTruthy();
      expect(isPopupClassHidden('.trigger-popup2')).toBeFalsy();

      trigger(container, '.target1', 'contextMenu');
      expect(isPopupClassHidden('.trigger-popup1')).toBeFalsy();
      expect(isPopupClassHidden('.trigger-popup2')).toBeTruthy();

      fireEvent.mouseDown(document.body);
      expect(isPopupAllHidden()).toBeTruthy();
    });
    describe('afterPopupVisibleChange can be triggered', () => {
      it('uncontrolled', async () => {
        let triggered = 0;
        const { container } = render(
          <Trigger
            action={['click']}
            popupAlign={placementAlignMap.left}
            afterPopupVisibleChange={() => {
              triggered = 1;
            }}
            popup={<strong>trigger</strong>}
          >
            <div className="target">click</div>
          </Trigger>,
        );

        trigger(container, '.target');

        await awaitFakeTimer();

        expect(triggered).toBe(1);
      });

      it('controlled', async () => {
        let triggered = 0;

        const Demo = () => {
          const [visible, setVisible] = React.useState(false);

          return (
            <>
              <button onClick={() => setVisible((v) => !v)} />
              <Trigger
                popupVisible={visible}
                popupAlign={placementAlignMap.left}
                afterPopupVisibleChange={() => {
                  triggered += 1;
                }}
                popup={<strong>trigger</strong>}
              >
                <div className="target">click</div>
              </Trigger>
            </>
          );
        };

        const { container } = render(<Demo />);

        fireEvent.click(container.querySelector('button'));
        await awaitFakeTimer();
        expect(triggered).toBe(1);

        fireEvent.click(container.querySelector('button'));
        await awaitFakeTimer();
        expect(triggered).toBe(2);
      });
    });

    it('nested action works', () => {
      class Test extends React.Component {
        clickTriggerRef = React.createRef();

        hoverTriggerRef = React.createRef();

        render() {
          return (
            <Trigger
              action={['click']}
              popupAlign={placementAlignMap.left}
              ref={this.clickTriggerRef}
              popup={<strong className="click-trigger">click trigger</strong>}
            >
              <Trigger
                action={['hover']}
                popupAlign={placementAlignMap.left}
                ref={this.hoverTriggerRef}
                popup={<strong className="hover-trigger">hover trigger</strong>}
              >
                <div className="target">trigger</div>
              </Trigger>
            </Trigger>
          );
        }
      }

      const { container } = render(<Test />);

      trigger(container, '.target', 'mouseEnter');
      trigger(container, '.target');

      const clickPopupDomNode =
        document.querySelector('.click-trigger').parentElement;
      const hoverPopupDomNode =
        document.querySelector('.hover-trigger').parentElement;
      expect(clickPopupDomNode).toBeTruthy();
      expect(hoverPopupDomNode).toBeTruthy();

      trigger(container, '.target', 'mouseLeave');
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeFalsy();

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeTruthy();
    });
  });

  // Placement & Align can not test in jsdom. This should test in `dom-align`

  describe('forceRender', () => {
    it("doesn't render at first time when forceRender=false", () => {
      render(
        <Trigger popup={<span>Hello!</span>}>
          <span>Hey!</span>
        </Trigger>,
      );

      expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    });

    it('render at first time when forceRender=true', () => {
      render(
        <Trigger forceRender popup={<span>Hello!</span>}>
          <span>Hey!</span>
        </Trigger>,
      );
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    });
  });

  describe('destroyPopupOnHide', () => {
    it('defaults to false', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
    });

    it('set true will destroy tooltip on hide', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          destroyPopupOnHide
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    });
  });

  describe('support autoDestroy', () => {
    it('defaults to false', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
    });

    it('set true will destroy portal on hide', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          autoDestroy
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    });
  });

  describe('github issues', () => {
    // https://github.com/ant-design/ant-design/issues/9114
    it('click in popup of popup', () => {
      const builtinPlacements = {
        right: {
          points: ['cl', 'cr'],
        },
      };
      let innerVisible = null;
      function onInnerPopupVisibleChange(value) {
        innerVisible = value;
      }
      const innerTrigger = (
        <div style={{ background: 'rgba(255, 0, 0, 0.3)' }}>
          <Trigger
            onPopupVisibleChange={onInnerPopupVisibleChange}
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={
              <div
                id="issue_9114_popup"
                style={{ background: 'rgba(0, 255, 0, 0.3)' }}
              >
                Final Popup
              </div>
            }
          >
            <div id="issue_9114_trigger">another trigger in popup</div>
          </Trigger>
        </div>
      );

      let visible = null;
      function onPopupVisibleChange(value) {
        visible = value;
      }
      const { container } = render(
        <Trigger
          onPopupVisibleChange={onPopupVisibleChange}
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
        >
          <span style={{ margin: 20 }} className="target">
            basic trigger
          </span>
        </Trigger>,
      );

      // Basic click
      trigger(container, '.target');
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeFalsy();

      fireEvent.click(document.querySelector('#issue_9114_trigger'));
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeTruthy();

      fireEvent.click(document.querySelector('#issue_9114_popup'));
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeTruthy();
    });
  });

  describe('stretch', () => {
    const createTrigger = (stretch, restProps) =>
      render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
          stretch={stretch}
          {...restProps}
        >
          <div className="target">
            click me to show trigger
            <br />
            react component trigger
          </div>
        </Trigger>,
      );

    const width = 1128;
    const height = 903;
    let domSpy;
    let rect = {};
    let rectCalled = false;

    beforeAll(() => {
      domSpy = spyElementPrototypes(HTMLElement, {
        offsetWidth: {
          get: () => width,
        },
        offsetHeight: {
          get: () => height,
        },
        getBoundingClientRect() {
          rectCalled = true;
          return rect;
        },
      });
    });

    beforeEach(() => {
      rectCalled = false;
    });

    afterAll(() => {
      domSpy.mockRestore();
    });

    [null, { width, height }].forEach((mockRect) => {
      ['width', 'height', 'min-width', 'min-height'].forEach((prop) => {
        it(`${
          mockRect ? 'offset' : 'getBoundingClientRect'
        }: ${prop}`, async () => {
          const onPopupAlign = jest.fn();

          const { container } = createTrigger(prop, {
            onPopupAlign,
          });
          rect = mockRect || {};

          expect(rectCalled).toBeFalsy();
          expect(onPopupAlign).not.toHaveBeenCalled();

          // Click will trigger `onPrepare` which need measure target size
          fireEvent.click(container.querySelector('.target'));
          expect(rectCalled).toBeTruthy();

          // Flush for motion
          await act(async () => {
            jest.advanceTimersByTime(100);
            await Promise.resolve();
          });
          expect(onPopupAlign).toHaveBeenCalled();

          expect(
            document.querySelector('.rc-trigger-popup').style,
          ).toHaveProperty(prop);
        });
      });
    });
  });

  it('className should be undefined by default', () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content">tooltip2</strong>}
      >
        <div>click</div>
      </Trigger>,
    );
    expect(container.querySelector('div')).not.toHaveAttribute('class');
  });

  it('support className', () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content">tooltip2</strong>}
        className="className-in-trigger"
      >
        <div className="target">click</div>
      </Trigger>,
    );

    expect(container.querySelector('div')).toHaveClass(
      'target className-in-trigger',
    );
  });

  it('support className in nested Trigger', () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content">tooltip2</strong>}
        className="className-in-trigger-2"
      >
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
          className="className-in-trigger-1"
        >
          <div className="target">click</div>
        </Trigger>
      </Trigger>,
    );

    expect(container.querySelector('div').className).toBe(
      'target className-in-trigger-1 className-in-trigger-2',
    );
  });

  it('support function component', () => {
    const NoRef = React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => null);
      return (
        <div className="target" {...props}>
          click
        </div>
      );
    });

    const triggerRef = createRef();
    const { container } = render(
      <Trigger
        ref={triggerRef}
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content">tooltip2</strong>}
      >
        <NoRef />
      </Trigger>,
    );

    trigger(container, '.target');
    expect(isPopupHidden()).toBeFalsy();

    fireEvent.click(container.querySelector('.target'));
    act(() => jest.runAllTimers());
    expect(isPopupHidden()).toBeTruthy();
  });

  it('Popup with mouseDown prevent', () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={
          <div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Prevent
            </button>
          </div>
        }
      >
        <h1>233</h1>
      </Trigger>,
    );

    fireEvent.click(container.querySelector('h1'));
    expect(isPopupHidden()).toBeFalsy();

    fireEvent.click(document.querySelector('button'));

    expect(isPopupHidden()).toBeFalsy();
  });

  // https://github.com/ant-design/ant-design/issues/21770
  it('support popupStyle, such as zIndex', () => {
    const style = { color: 'red', zIndex: 9999, top: 100, opacity: 0.93 };
    render(
      <Trigger
        popupVisible
        popupStyle={style}
        popup={<strong className="x-content">tooltip2</strong>}
      >
        <div className="target">click</div>
      </Trigger>,
    );

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      ...style,
      top: '100px',
    });
  });

  describe('getContainer', () => {
    it('not trigger when dom not ready', () => {
      const getPopupContainer = jest.fn((node) => {
        expect(node).toBeTruthy();
        return node.parentElement;
      });

      function Demo() {
        return (
          <Trigger
            popupVisible
            getPopupContainer={getPopupContainer}
            popup={<strong className="x-content">tooltip2</strong>}
          >
            <div className="target">click</div>
          </Trigger>
        );
      }

      render(<Demo />);

      expect(getPopupContainer).toHaveBeenCalled();
    });

    it('not trigger when dom no need', () => {
      const getPopupContainer = jest.fn(() => document.body);

      let effectCalled = false;

      function Demo() {
        const popupRef = React.useRef();

        React.useLayoutEffect(() => {
          effectCalled = true;
          expect(popupRef.current).toBeTruthy();
        }, []);

        return (
          <Trigger
            popupVisible
            getPopupContainer={getPopupContainer}
            popup={<strong ref={popupRef}>tooltip2</strong>}
          >
            <div className="target">click</div>
          </Trigger>
        );
      }

      render(<Demo />);
      expect(effectCalled).toBeTruthy();
    });
  });

  // https://github.com/ant-design/ant-design/issues/30116
  // This conflict with above test for always click to hide
  it.skip('createPortal should also work with stopPropagation', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const div = document.createElement('div');
    document.body.appendChild(div);

    const OuterContent = ({ container }) => {
      return ReactDOM.createPortal(
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          Stop Pop
        </button>,
        container,
      );
    };

    const Demo = () => {
      return (
        <Trigger
          action={['click']}
          popup={
            <strong className="x-content">
              tooltip2
              <OuterContent container={div} />
            </strong>
          }
        >
          <div className="target">click</div>
        </Trigger>
      );
    };

    const { container } = render(<Demo />, { container: root });

    fireEvent.click(container.querySelector('.target'));
    expect(isPopupHidden()).toBeFalsy();

    // Click should not close
    fireEvent.mouseDown(document.querySelector('button'));

    // Mock document mouse click event
    act(() => {
      const mouseEvent = new MouseEvent('mousedown');
      document.dispatchEvent(mouseEvent);
    });

    expect(isPopupHidden()).toBeFalsy();

    document.body.removeChild(div);
    document.body.removeChild(root);
  });

  it('nested Trigger should not force render when ancestor Trigger render', () => {
    let isUpdate = false;
    let isChildUpdate = false;
    let isGrandsonUpdate = false;

    const Grandson = () => {
      if (isUpdate) {
        isGrandsonUpdate = true;
      }

      return null;
    };

    const Child = React.memo(() => {
      if (isUpdate) {
        isChildUpdate = true;
      }

      return (
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          forceRender
          popup={() => (
            <strong className="x-content">
              <Grandson />
            </strong>
          )}
        >
          <div className="target">click</div>
        </Trigger>
      );
    });

    class App extends React.Component {
      render() {
        return (
          <Trigger
            action={['click']}
            popupAlign={placementAlignMap.left}
            popup={<strong className="x-content">tooltip2</strong>}
            className="className-in-trigger-2"
          >
            <div className="target">
              <Child />
            </div>
          </Trigger>
        );
      }
    }

    const appRef = createRef();
    render(<App ref={appRef} />);

    isUpdate = true;

    act(() => appRef.current.setState({}));

    expect(isChildUpdate).toBeFalsy();
    expect(isGrandsonUpdate).toBeFalsy();
  });

  it('should work in StrictMode with autoDestroy', () => {
    const { container } = render(
      <Trigger action={['click']} autoDestroy={true}>
        <div className="target">click</div>
      </Trigger>,
      { wrapper: StrictMode },
    );

    // click to show
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    // click to hide
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    // click to show
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
  });

  it('onPopupClick', () => {
    const onPopupClick = jest.fn();

    render(
      <Trigger
        popupVisible
        popup={<strong>trigger</strong>}
        onPopupClick={onPopupClick}
      >
        <div />
      </Trigger>,
    );

    fireEvent.click(document.querySelector('strong'));

    expect(onPopupClick).toHaveBeenCalled();
  });

  it('find real dom node if children not support `forwardRef`', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const Node = () => <p />;

    render(
      <Trigger popup={<p>trigger</p>}>
        <Node />
      </Trigger>,
    );

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('should trigger align when popupAlign had updated', async () => {
    const onPopupAlign = jest.fn();

    const App = () => {
      const [placementAlign, setPlacementAlign] = React.useState(
        placementAlignMap.leftTop,
      );
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <Trigger
            popupVisible={open}
            popupAlign={placementAlign}
            onPopupAlign={onPopupAlign}
            popup={<strong className="x-content">tooltip2</strong>}
          >
            <div>
              <div
                id="btn"
                onClick={() => {
                  setPlacementAlign((prev) =>
                    prev === placementAlignMap.left
                      ? placementAlignMap.leftTop
                      : placementAlignMap.left,
                  );
                }}
              >
                click
              </div>
              <div
                id="close"
                onClick={() => {
                  setOpen(false);
                }}
              >
                close
              </div>
            </div>
          </Trigger>
        </>
      );
    };
    render(<App />);

    // CSSMotion will trigger `onPrepare` even when motion not support
    // Which means align will trigger twice on `prepare` & `visibleChanged`
    await awaitFakeTimer();
    expect(onPopupAlign).toHaveBeenCalledTimes(2);
    fireEvent.click(document.querySelector('#btn'));

    await awaitFakeTimer();
    expect(onPopupAlign).toHaveBeenCalledTimes(3);

    fireEvent.click(document.querySelector('#close'));
    await awaitFakeTimer();
    fireEvent.click(document.querySelector('#btn'));
    await awaitFakeTimer();
    expect(onPopupAlign).toHaveBeenCalledTimes(3);
  });

  it('popupVisible switch `undefined` and `false` should work', async () => {
    const Demo = (props) => (
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.topRight}
        popup={<strong>trigger</strong>}
        {...props}
      >
        <div className="target">click</div>
      </Trigger>
    );

    const { container, rerender } = render(<Demo />);

    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

    // Back to false
    rerender(<Demo popupVisible={false} />);
    await awaitFakeTimer();
    expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();

    // Back to undefined
    rerender(<Demo popupVisible={undefined} />);
    await awaitFakeTimer();
    expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
  });

  describe('click window to hide', () => {
    it('should hide', async () => {
      const onPopupVisibleChange = jest.fn();

      const { container } = render(
        <Trigger
          onPopupVisibleChange={onPopupVisibleChange}
          action="click"
          popup={<strong>trigger</strong>}
        >
          <div className="target" />
        </Trigger>,
      );

      fireEvent.click(container.querySelector('.target'));
      await awaitFakeTimer();
      expect(onPopupVisibleChange).toHaveBeenCalledWith(true);
      onPopupVisibleChange.mockReset();

      // Click outside to close
      fireEvent.mouseDown(document.body);
      fireEvent.click(document.body);
      await awaitFakeTimer();
      expect(onPopupVisibleChange).toHaveBeenCalledWith(false);
    });

    it('should not hide when mouseDown inside but mouseUp outside', async () => {
      const onPopupVisibleChange = jest.fn();

      const { container } = render(
        <Trigger
          onPopupVisibleChange={onPopupVisibleChange}
          action="click"
          popup={<strong>trigger</strong>}
        >
          <div className="target" />
        </Trigger>,
      );

      fireEvent.click(container.querySelector('.target'));
      await awaitFakeTimer();
      expect(onPopupVisibleChange).toHaveBeenCalledWith(true);
      onPopupVisibleChange.mockReset();

      // Click outside to close
      fireEvent.mouseDown(document.querySelector('strong'));
      fireEvent.click(document.body);
      await awaitFakeTimer();
      expect(onPopupVisibleChange).not.toHaveBeenCalled();
    });

    // https://github.com/ant-design/ant-design/issues/42526
    it('not hide when click button', async () => {
      const Demo = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <>
            <button
              onClick={() => {
                setOpen(true);
              }}
            />
            <Trigger
              onPopupVisibleChange={setOpen}
              action="click"
              popupVisible={open}
              popup={<strong>trigger</strong>}
            >
              <div className="target" />
            </Trigger>
          </>
        );
      };

      const { container } = render(<Demo />);

      fireEvent.click(container.querySelector('button'));
      fireEvent.click(window);
      await awaitFakeTimer();
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeFalsy();
    });

    it('should hide when click outside stopPropagation button', async () => {
      const Demo = () => {
        return (
          <>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <Trigger action="click" popup={<strong>trigger</strong>}>
              <div className="target" />
            </Trigger>
          </>
        );
      };

      const { container } = render(<Demo />);

      fireEvent.click(container.querySelector('.target'));
      await awaitFakeTimer();
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

      fireEvent.mouseDown(container.querySelector('button'));
      fireEvent.mouseUp(container.querySelector('button'));
      fireEvent.click(container.querySelector('button'));
      expect(document.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
    });
  });

  it('not trigger open when hover hidden popup node', () => {
    const onPopupVisibleChange = jest.fn();

    const { container } = render(
      <Trigger
        onPopupVisibleChange={onPopupVisibleChange}
        action="hover"
        popup={<strong className="popup">trigger</strong>}
        getPopupContainer={() => container}
      >
        <div className="target" />
      </Trigger>,
    );

    trigger(container, '.target', 'mouseEnter');
    expect(onPopupVisibleChange).toHaveBeenCalledWith(true);
    onPopupVisibleChange.mockReset();

    trigger(container, '.target', 'mouseLeave');
    expect(onPopupVisibleChange).toHaveBeenCalledWith(false);
    onPopupVisibleChange.mockReset();

    trigger(container, '.popup', 'mouseEnter');
    expect(onPopupVisibleChange).not.toHaveBeenCalled();
  });

  // https://gith(ub.com/ant-design/ant-design/issues/44830
  it('fresh should work', () => {
    const Demo = () => {
      const [open, setOpen] = React.useState(true);

      return (
        <Trigger
          popupVisible={open}
          onPopupVisibleChange={setOpen}
          popup={<strong className="x-content">{String(open)}</strong>}
          action={['click']}
          popupAlign={placementAlignMap.left}
          fresh
        >
          <div className="target">click</div>
        </Trigger>
      );
    };

    const { container } = render(<Demo />);
    expect(document.querySelector('.x-content').textContent).toBe('true');

    trigger(container, '.target');
    expect(document.querySelector('.x-content').textContent).toBe('false');
  });
});

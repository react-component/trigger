/* eslint-disable max-classes-per-file */

import React, { createRef } from 'react';
import ReactDOM from 'react-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import Trigger from '../src';
import { placementAlignMap } from './util';

describe('Trigger.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

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

      fireEvent.click(container.querySelector('.target'));

      const popupDomNode = document.querySelector('.rc-trigger-popup');
      expect(popupDomNode.parentNode.parentNode.parentNode).toBeInstanceOf(
        HTMLBodyElement,
      );
    });

    it('wrapper children with div when multiple children', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={[<div key={0} />, <div key={1} />]}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      fireEvent.click(container.querySelector('.target'));

      expect(
        document.querySelectorAll('.rc-trigger-popup-content').length,
      ).toBeTruthy();
    });

    it('can change', () => {
      function getPopupContainer(node) {
        return node.parentNode;
      }

      const { container } = render(
        <Trigger
          action={['click']}
          getPopupContainer={getPopupContainer}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
        document.createElement('div'),
      );

      fireEvent.click(container.querySelector('.target'));
      const popupDomNode = document.querySelector('.rc-trigger-popup');
      expect(popupDomNode.parentNode.parentNode.parentNode).toBeInstanceOf(
        HTMLDivElement,
      );
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

      fireEvent.click(container.querySelector('.target'));
      expect(document.querySelector('.x-content').textContent).toBe('tooltip2');

      fireEvent.click(container.querySelector('.target'));
      expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
        'rc-trigger-popup-hidden',
      );
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

      fireEvent.click(container.querySelector('.target'));
      expect(document.querySelector('.x-content').textContent).toBe('tooltip3');

      fireEvent.click(container.querySelector('.target'));
      expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
        'rc-trigger-popup-hidden',
      );
    });

    it('hover works', () => {
      const { container } = render(
        <Trigger
          action={['hover']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      fireEvent.mouseEnter(container.querySelector('.target'));
      expect(document.querySelector('.rc-trigger-popup')).not.toHaveClass(
        'rc-trigger-popup-hidden',
      );

      fireEvent.mouseLeave(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
        'rc-trigger-popup-hidden',
      );
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

      fireEvent.contextMenu(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(
        document.querySelector('.rc-trigger-popup').className,
      ).not.toContain('-hidden');

      act(() => {
        triggerRef.current.onDocumentClick({
          target: container.querySelector('.target'),
        });
        jest.runAllTimers();
      });

      expect(document.querySelector('.rc-trigger-popup').className).toContain(
        '-hidden',
      );
    });

    describe('afterPopupVisibleChange can be triggered', () => {
      it('uncontrolled', () => {
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

        fireEvent.click(container.querySelector('.target'));
        expect(triggered).toBe(1);
      });

      it('controlled', () => {
        const demoRef = createRef();
        let triggered = 0;

        class Demo extends React.Component {
          state = {
            visible: false,
          };

          render() {
            return (
              <Trigger
                popupVisible={this.state.visible}
                popupAlign={placementAlignMap.left}
                afterPopupVisibleChange={() => {
                  triggered += 1;
                }}
                popup={<strong>trigger</strong>}
              >
                <div className="target">click</div>
              </Trigger>
            );
          }
        }

        render(<Demo ref={demoRef} />);
        act(() => {
          demoRef.current.setState({ visible: true });
          jest.runAllTimers();
        });
        expect(triggered).toBe(1);

        act(() => {
          demoRef.current.setState({ visible: false });
          jest.runAllTimers();
        });
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

      fireEvent.mouseEnter(container.querySelector('.target'));
      act(() => jest.runAllTimers());

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());

      const clickPopupDomNode =
        document.querySelector('.click-trigger').parentElement;
      const hoverPopupDomNode =
        document.querySelector('.hover-trigger').parentElement;
      expect(clickPopupDomNode).toBeTruthy();
      expect(hoverPopupDomNode).toBeTruthy();

      fireEvent.mouseLeave(container.querySelector('.target'));
      act(() => jest.runAllTimers());
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
      const triggerRef = React.createRef();
      class Test extends React.Component {
        render() {
          return (
            <Trigger ref={triggerRef} forceRender popup={<span>Hello!</span>}>
              <span>Hey!</span>
            </Trigger>
          );
        }
      }
      render(<Test />);
      expect(triggerRef.current.getPopupDomNode()).toBeTruthy();
    });
  });

  describe('destroyPopupOnHide', () => {
    it('defaults to false', () => {
      const triggerRef = createRef();
      const { container } = render(
        <Trigger
          ref={triggerRef}
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(triggerRef.current.getPopupDomNode()).toBeTruthy();

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(triggerRef.current.getPopupDomNode()).toBeTruthy();
    });

    it('set true will destroy tooltip on hide', () => {
      const triggerRef = createRef();
      const { container } = render(
        <Trigger
          ref={triggerRef}
          action={['click']}
          destroyPopupOnHide
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(triggerRef.current.getPopupDomNode()).toBeTruthy();

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(triggerRef.current.getPopupDomNode()).toBeFalsy();
    });
  });

  describe('support autoDestroy', () => {
    it('defaults to false', () => {
      const triggerRef = createRef();
      const { container } = render(
        <Trigger
          ref={triggerRef}
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );
      expect(triggerRef.current.props.autoDestroy).toBeFalsy();
      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      act(() => jest.runAllTimers());
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
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

      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      fireEvent.click(container.querySelector('.target'));
      act(() => jest.runAllTimers());
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
      fireEvent.click(container.querySelector('.target'));
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
    const createTrigger = (stretch) =>
      render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
          stretch={stretch}
        >
          <div className="target">
            click me to show trigger
            <br />
            react component trigger
          </div>
        </Trigger>,
      );

    let domSpy;

    beforeAll(() => {
      domSpy = spyElementPrototypes(HTMLElement, {
        offsetWidth: {
          get: () => 1128,
        },
        offsetHeight: {
          get: () => 903,
        },
      });
    });

    afterAll(() => {
      domSpy.mockRestore();
    });

    ['width', 'height', 'min-width', 'min-height'].forEach((prop) => {
      it(prop, () => {
        const { container } = createTrigger(prop);

        fireEvent.click(container.querySelector('.target'));
        act(() => jest.runAllTimers());

        expect(
          document.querySelector('.rc-trigger-popup').style,
        ).toHaveProperty(prop);
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

    fireEvent.click(container.querySelector('.target'));
    act(() => jest.runAllTimers());
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );

    fireEvent.click(container.querySelector('.target'));
    act(() => jest.runAllTimers());
    expect(document.querySelector('.rc-trigger-popup').className).toContain(
      '-hidden',
    );
  });

  it('Popup with mouseDown prevent', () => {
    const triggerRef = createRef();
    const { container } = render(
      <Trigger
        ref={triggerRef}
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
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );

    triggerRef.current.onDocumentClick({
      target: document.querySelector('button'),
    });
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );
  });

  // https://github.com/ant-design/ant-design/issues/21770
  it('support popupStyle, such as zIndex', () => {
    const triggerRef = createRef();
    const style = { color: 'red', zIndex: 9999, top: 100, opacity: 0.93 };
    render(
      <Trigger
        ref={triggerRef}
        popupVisible
        popupStyle={style}
        popup={<strong className="x-content">tooltip2</strong>}
      >
        <div className="target">click</div>
      </Trigger>,
    );

    const popupDomNode = triggerRef.current.getPopupDomNode();
    expect(popupDomNode.style.zIndex).toBe(style.zIndex.toString());
    expect(popupDomNode.style.color).toBe(style.color);
    expect(popupDomNode.style.top).toBe(`${style.top}px`);
    expect(popupDomNode.style.opacity).toBe(style.opacity.toString());
  });

  describe('getContainer', () => {
    it('not trigger when dom not ready', () => {
      const getPopupContainer = jest.fn((node) => node.parentElement);

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

      const { container } = render(<Demo />);

      expect(getPopupContainer).toHaveReturnedTimes(0);

      act(() => jest.runAllTimers());
      expect(getPopupContainer).toHaveReturnedTimes(1);
      expect(getPopupContainer).toHaveBeenCalledWith(
        container.querySelector('.target'),
      );
    });

    it('not trigger when dom no need', () => {
      let triggerTimes = 0;
      const getPopupContainer = () => {
        triggerTimes += 1;
        return document.body;
      };

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
      expect(triggerTimes).toEqual(1);
    });
  });

  // https://github.com/ant-design/ant-design/issues/30116
  it('createPortal should also work with stopPropagation', () => {
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
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );

    // Click should not close
    fireEvent.mouseDown(document.querySelector('button'));

    // Mock document mouse click event
    act(() => {
      const mouseEvent = new MouseEvent('mousedown');
      document.dispatchEvent(mouseEvent);
    });

    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );

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
});

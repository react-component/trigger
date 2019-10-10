import React from 'react';
import { mount } from 'enzyme';
import Trigger from '../src';

const autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};

const targetOffsetG = [0, 0];

const placementAlignMap = {
  left: {
    points: ['cr', 'cl'],
    overflow: autoAdjustOverflow,
    offset: [-3, 0],
    targetOffsetG,
  },
  right: {
    points: ['cl', 'cr'],
    overflow: autoAdjustOverflow,
    offset: [3, 0],
    targetOffsetG,
  },
  top: {
    points: ['bc', 'tc'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffsetG,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffsetG,
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffsetG,
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffsetG,
  },
  bottomRight: {
    points: ['tr', 'br'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffsetG,
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffsetG,
  },
};

describe('Trigger.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getPopupContainer', () => {
    it('defaults to document.body', () => {
      const wrapper = mount(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      wrapper.trigger();
      const popupDomNode = wrapper.instance().getPopupDomNode();
      expect(popupDomNode.parentNode.parentNode.parentNode instanceof HTMLBodyElement).toBeTruthy();
    });

    it('can change', () => {
      function getPopupContainer(node) {
        return node.parentNode;
      }

      const wrapper = mount(
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

      wrapper.trigger();
      const popupDomNode = wrapper.instance().getPopupDomNode();
      expect(popupDomNode.parentNode.parentNode.parentNode instanceof HTMLDivElement).toBeTruthy();
    });
  });

  describe('action', () => {
    it('click works', () => {
      const wrapper = mount(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      wrapper.trigger();
      expect(
        wrapper
          .find('Popup')
          .find('.x-content')
          .text(),
      ).toBe('tooltip2');

      wrapper.trigger();
      expect(wrapper.isHidden()).toBeTruthy();
    });

    it('click works with function', () => {
      const popup = function renderPopup() {
        return <strong className="x-content">tooltip3</strong>;
      };
      const wrapper = mount(
        <Trigger action={['click']} popupAlign={placementAlignMap.left} popup={popup}>
          <div className="target">click</div>
        </Trigger>,
      );

      wrapper.trigger();
      expect(
        wrapper
          .find('Popup')
          .find('.x-content')
          .text(),
      ).toBe('tooltip3');

      wrapper.trigger();
      expect(wrapper.isHidden()).toBeTruthy();
    });

    it('hover works', () => {
      const wrapper = mount(
        <Trigger
          action={['hover']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      wrapper.trigger('mouseEnter');
      expect(wrapper.isHidden()).toBeFalsy();

      wrapper.trigger('mouseLeave');
      expect(wrapper.isHidden()).toBeTruthy();
    });

    it('contextMenu works', () => {
      const wrapper = mount(
        <Trigger
          action={['contextMenu']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div className="target">contextMenu</div>
        </Trigger>,
      );

      wrapper.trigger('contextMenu');
      expect(wrapper.isHidden()).toBeFalsy();
    });

    describe('afterPopupVisibleChange can be triggered', () => {
      it('uncontrolled', () => {
        let triggered = 0;
        const wrapper = mount(
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

        wrapper.trigger();
        expect(triggered).toBe(1);
      });

      it('controlled', () => {
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

        const wrapper = mount(<Demo />);
        wrapper.setState({ visible: true });
        jest.runAllTimers();
        expect(triggered).toBe(1);

        wrapper.setState({ visible: false });
        jest.runAllTimers();
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

      const wrapper = mount(<Test />);

      wrapper.find('.target').simulate('mouseEnter');
      wrapper.refresh();

      wrapper.find('.target').simulate('click');
      wrapper.refresh();

      const clickPopupDomNode = wrapper.instance().clickTriggerRef.current.getPopupDomNode();
      const hoverPopupDomNode = wrapper.instance().hoverTriggerRef.current.getPopupDomNode();
      expect(clickPopupDomNode).toBeTruthy();
      expect(hoverPopupDomNode).toBeTruthy();

      wrapper.find('.target').simulate('mouseLeave');
      wrapper.refresh();
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeFalsy();

      wrapper.find('.target').simulate('click');
      wrapper.refresh();
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeTruthy();
    });
  });

  // Placement & Align can not test in jsdom. This should test in `dom-align`

  describe('forceRender', () => {
    it("doesn't render at first time when forceRender=false", () => {
      const wrapper = mount(
        <Trigger popup={<span>Hello!</span>}>
          <span>Hey!</span>
        </Trigger>,
      );
      expect(wrapper.instance().getPopupDomNode()).toBeFalsy();
    });

    it('render at first time when forceRender=true', () => {
      class Test extends React.Component {
        triggerRef = React.createRef();

        render() {
          return (
            <Trigger ref={this.triggerRef} forceRender popup={<span>Hello!</span>}>
              <span>Hey!</span>
            </Trigger>
          );
        }
      }
      const wrapper = mount(<Test />);
      expect(wrapper.instance().triggerRef.current.getPopupDomNode()).toBeTruthy();
    });
  });

  /*
  describe('destroyPopupOnHide', () => {
    it('defaults to false', () => {
      const trigger = ReactDOM.render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>, div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      expect(trigger.getPopupDomNode()).to.be.ok();
      Simulate.click(domNode);
      expect(trigger.getPopupDomNode()).to.be.ok();
    });

    it('set true will destroy tooltip on hide', () => {
      const trigger = ReactDOM.render(
        <Trigger
          action={['click']}
          destroyPopupOnHide
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>, div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      expect(trigger.getPopupDomNode()).to.be.ok();
      Simulate.click(domNode);
      expect(trigger.getPopupDomNode()).not.to.be.ok();
    });
  });

  if (window.TransitionEvent) {
    describe('transitionName', () => {
      it.skip('works', (done) => {
        const trigger = ReactDOM.render(
          <Trigger
            action={['click']}
            popupTransitionName="fade"
            popupAlign={placementAlignMap.top}
            popup={<strong>trigger</strong>}
          >
            <div className="target">click</div>
          </Trigger>, div);
        const domNode = ReactDOM.findDOMNode(trigger);
        Simulate.click(domNode);
        async.series([timeout(100),
            (next) => {
              const popupDomNode = trigger.getPopupDomNode();
              expect(popupDomNode).to.be.ok();
              expect($(popupDomNode).css('opacity')).not.to.be('1');
              next();
            },
            timeout(500),
            (next) => {
              const popupDomNode = trigger.getPopupDomNode();
              expect(popupDomNode).to.be.ok();
              expect($(popupDomNode).css('opacity')).to.be('1');
              Simulate.click(domNode);
              next();
            },
            timeout(100),
            (next) => {
              const popupDomNode = trigger.getPopupDomNode();
              expect(popupDomNode).to.be.ok();
              expect($(popupDomNode).css('opacity')).not.to.be('1');
              next();
            },
            timeout(500),
            (next) => {
              const popupDomNode = trigger.getPopupDomNode();
              expect($(popupDomNode).css('display')).to.be('none');
              next();
            }],
          done);
      });
    });
  }

  describe('github issues', () => {
    // https://github.com/ant-design/ant-design/issues/5047
    // https://github.com/react-component/trigger/pull/43
    it('render text without break lines', () => {
      const trigger = ReactDOM.render(
        <Trigger
          popupVisible
          popupAlign={placementAlignMap.top}
          popup={<span>i am a pop up</span>}
          popupClassName="no-fix-width"
        >
          <div>trigger</div>
        </Trigger>
        , div);
      const popupNodeHeightOfSeveralWords = trigger.getPopupDomNode().offsetHeight;

      const trigger2 = ReactDOM.render(
        <Trigger
          popupVisible
          popupAlign={placementAlignMap.top}
          popup={<span>iamapopup</span>}
          popupClassName="no-fix-width"
        >
          <div>trigger</div>
        </Trigger>
        , div);
      const popupNodeHeightOfOneWord = trigger2.getPopupDomNode().offsetHeight;

      // height should be same, should not have break lines inside words
      expect(popupNodeHeightOfOneWord).to.equal(popupNodeHeightOfSeveralWords);
    });

    // https://github.com/ant-design/ant-design/issues/9114
    it('click in popup of popup', (done) => {
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
              <div id="issue_9114_popup" style={{ background: 'rgba(0, 255, 0, 0.3)' }}>
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

      const trigger = ReactDOM.render(
        <Trigger
          onPopupVisibleChange={onPopupVisibleChange}
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
        >
          <span style={{ margin: 20 }}>basic trigger</span>
        </Trigger>,
        div
      );

      // Basic click
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);

      setTimeout(() => {
        expect(visible).to.be(true);
        expect(innerVisible).to.be(null);

        const innerDomNode = document.getElementById('issue_9114_trigger');
        Simulate.click(innerDomNode);

        setTimeout(() => {
          expect(visible).to.be(true);
          expect(innerVisible).to.be(true);

          const popupDomNode = document.getElementById('issue_9114_popup');
          Simulate.click(popupDomNode);

          setTimeout(() => {
            expect(visible).to.be(true);
            expect(innerVisible).to.be(true);

            done();
          });
        }, 100);
      }, 100);
    });
  });

  describe('utils/saveRef', () => {
    const mock = {};
    const saveTestRef = saveRef.bind(mock, 'testInstance');

    it('adds a property with the given name to context', () => {
      expect(mock.testInstance).to.be(undefined);
      saveTestRef('bar');
      expect(mock.testInstance).to.be('bar');
    });
  });

  describe('stretch', () => {
    const createTrigger = (stretch) => ReactDOM.render((
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
      </Trigger>
    ), div);

    it('width', (done) => {
      const trigger = createTrigger('width');
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);

      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).width()).to.be($(domNode).width());
        next();
      }], done);
    });

    it('height', (done) => {
      const trigger = createTrigger('height');
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);

      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).height()).to.be($(domNode).height());
        next();
      }], done);
    });

    it('className should be undefined by default', () => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div>click</div>
        </Trigger>
      ), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      expect(domNode.getAttribute('class')).to.be(null);
    });

    it('support className', () => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
          className="className-in-trigger"
        >
          <div className="target">click</div>
        </Trigger>
      ), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      expect(domNode.className).to.be('target className-in-trigger');
    });

    it('support className in nested Trigger', () => {
      const trigger = ReactDOM.render((
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
        </Trigger>
      ), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      expect(domNode.className).to.be('target className-in-trigger-1 className-in-trigger-2');
    });
  });
  */
});

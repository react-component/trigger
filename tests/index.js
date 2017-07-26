/* eslint no-console:0 */

import expect from 'expect.js';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import $ from 'jquery';
import '../assets/index.less';
import Trigger from '../index';
import './test.less';
import async from 'async';
import { saveRef } from '../src/utils';

const Simulate = TestUtils.Simulate;
window.$ = $;
const scryRenderedDOMComponentsWithClass = TestUtils.scryRenderedDOMComponentsWithClass;

function timeout(ms) {
  return (done) => {
    setTimeout(done, ms);
  };
}

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

describe('rc-trigger', function main() {
  this.timeout(40000);
  const div = document.createElement('div');
  div.style.margin = '100px';
  div.style.position = 'relative';
  document.body.insertBefore(div, document.body.firstChild);

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('getPopupContainer', () => {
    it('defaults to document.body', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode.parentNode.parentNode.parentNode).to.be(document.body);
        next();
      }], done);
    });

    it('can change', (done) => {
      function getPopupContainer(node) {
        return node.parentNode;
      }

      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          getPopupContainer={getPopupContainer}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode.parentNode.parentNode.parentNode).to.be(div);
        next();
      }], done);
    });
  });

  describe('action', () => {
    it('click works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).find('.x-content').html()).to.be('tooltip2');
        expect(popupDomNode).to.be.ok();
        Simulate.click(domNode);
        next();
      }, timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });

    it('click works with function', (done) => {
      let rendered = 42;
      const popup = function renderPopup() {
        rendered += 2;
        return <strong className="x-content">tooltip3</strong>;
      };
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={popup}
        >
          <div className="target">click</div>
        </Trigger>), div);
      expect(rendered).to.be(42);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(rendered).to.be(44);
        expect($(popupDomNode).find('.x-content').html()).to.be('tooltip3');
        expect(popupDomNode).to.be.ok();
        Simulate.click(domNode);
        next();
      }, timeout(20), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });

    it('hover works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['hover']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const target = scryRenderedDOMComponentsWithClass(trigger, 'target')[0];
      // can not simulate mouseenter
      Simulate.mouseEnter(target);
      async.series([timeout(200), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        Simulate.mouseLeave(target);
        next();
      }, timeout(200), (next) => {
        const popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });

    it('afterPopupVisibleChange can be triggered', (done) => {
      let triggered = 0;
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          afterPopupVisibleChange={() => {
            triggered = 1;
          }}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(200), (next) => {
        expect(triggered).to.be(1);
        next();
      }], done);
    });

    it('nested action works', (done) => {
      class Test extends React.Component {
        constructor(props) {
          super(props);

          this.saveClickTriggerRef = saveRef.bind(this, 'clickTriggerInstance');
          this.saveHoverTriggerRef = saveRef.bind(this, 'hoverTriggerInstance');
        }
        render() {
          return (
            <Trigger
              action={['click']}
              popupAlign={placementAlignMap.left}
              ref={this.saveClickTriggerRef}
              popup={<strong>click trigger</strong>}
            >
              <Trigger
                action={['hover']}
                popupAlign={placementAlignMap.left}
                ref={this.saveHoverTriggerRef}
                popup={<strong>hover trigger</strong>}
              >
                <div className="target">trigger</div>
              </Trigger>
            </Trigger>
          );
        }
      }
      const trigger = ReactDOM.render(<Test />, div);

      const target = scryRenderedDOMComponentsWithClass(trigger, 'target')[0];
      // can not simulate mouseenter
      Simulate.mouseEnter(target);
      Simulate.click(target);
      async.series([timeout(200), (next) => {
        const clickPopupDomNode = trigger.clickTriggerInstance.getPopupDomNode();
        const hoverPopupDomNode = trigger.hoverTriggerInstance.getPopupDomNode();
        expect(clickPopupDomNode).to.be.ok();
        expect(hoverPopupDomNode).to.be.ok();
        Simulate.mouseLeave(target);
        next();
      }, timeout(200), (next) => {
        const hoverPopupDomNode = trigger.hoverTriggerInstance.getPopupDomNode();
        expect($(hoverPopupDomNode).css('display')).to.be('none');
        Simulate.click(target);
        next();
      }, timeout(200), (next) => {
        const clickPopupDomNode = trigger.clickTriggerInstance.getPopupDomNode();
        expect($(clickPopupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });
  });

  describe('placement', () => {
    it('left works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popupStyle={{ width: 50 }}
          popup={<div>trigger</div>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        expect(popupOffset.left + $(popupDomNode).outerWidth()).to.be(targetOffset.left - 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('auto adjust left works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popupStyle={{ width: 400 }}
          popup={<div>trigger</div>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        // offset is 3
        if (window.navigator.userAgent.indexOf('PhantomJS') === -1) {
          expect(popupOffset.left).to.be(targetOffset.left + $(domNode).outerWidth() + 3);
        }
        done();
      }, 100);
    });

    it('right works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.right}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.left).to.be(targetOffset.left + $(domNode).outerWidth() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottom works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.bottom}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottomRight works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.bottomRight}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottomLeft works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.bottomLeft}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('top works', (done) => {
      const trigger = ReactDOM.render((
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.top}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>), div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('topLeft works', (done) => {
      const trigger = ReactDOM.render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.topLeft}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>, div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        expect(popupOffset.left).to.be(targetOffset.left);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('topRight works', (done) => {
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
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        expect(popupOffset.left).to.be(targetOffset.left);
        Simulate.click(domNode);
        done();
      }, 20);
    });
  });

  describe('align', () => {
    it('offsetX works', (done) => {
      const offsetX = 10;
      const trigger = ReactDOM.render(
        <Trigger
          action={['click']}
          popupAlign={{ ...placementAlignMap.bottomRight, offset: [offsetX, 3] }}
          popup={<strong>trigger</strong>}
        >
          <div className="target">click</div>
        </Trigger>, div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.left).to.be(targetOffset.left + offsetX);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('offsetY works', (done) => {
      const offsetY = 50;
      const trigger = ReactDOM.render(<Trigger
        action={['click']}
        popupAlign={{ ...placementAlignMap.topRight, offset: [0, offsetY] }}
        popup={<strong>trigger</strong>}
      >
        <div className="target">click</div>
      </Trigger>, div);
      const domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(() => {
        const popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        const targetOffset = $(domNode).offset();
        const popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() + offsetY);
        Simulate.click(domNode);
        done();
      }, 20);
    });
  });

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
      it('works', (done) => {
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
});

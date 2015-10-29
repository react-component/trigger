'use strict';

var expect = require('expect.js');
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var Simulate = TestUtils.Simulate;
var assign = require('object-assign');
var $ = require('jquery');
window.$ = $;
require('../assets/index.less');
var Trigger = require('../index');
var scryRenderedDOMComponentsWithClass = TestUtils.scryRenderedDOMComponentsWithClass;
require('./test.less');
var async = require('async');

function timeout(ms) {
  return (done)=> {
    setTimeout(done, ms);
  }
}

const autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};

const targetOffset = [0, 0];

const placementAlignMap = {
  left: {
    points: ['cr', 'cl'],
    overflow: autoAdjustOverflow,
    offset: [-3, 0],
    targetOffset,
  },
  right: {
    points: ['cl', 'cr'],
    overflow: autoAdjustOverflow,
    offset: [3, 0],
    targetOffset,
  },
  top: {
    points: ['bc', 'tc'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffset,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffset,
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffset,
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffset,
  },
  bottomRight: {
    points: ['tr', 'br'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffset,
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffset,
  },
};

describe('rc-trigger', function () {
  this.timeout(40000);
  var div = document.createElement('div');
  div.style.margin = '100px';
  document.body.insertBefore(div, document.body.firstChild);

  afterEach(()=> {
    ReactDOM.unmountComponentAtNode(div);
  });

  describe('Trigger', ()=> {
    it('click works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']} popupAlign={placementAlignMap.left}
                                             popup={<strong className='x-content'>tooltip2</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([timeout(20), (next)=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).find('.x-content').html()).to.be('tooltip2');
        expect(popupDomNode).to.be.ok();
        Simulate.click(domNode);
        next();
      }, timeout(20), (next)=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });

    it('hover works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['hover']}
                                             popupAlign={placementAlignMap.left}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var target = scryRenderedDOMComponentsWithClass(trigger, 'target')[0];
      // can not simulate mouseenter
      Simulate.mouseEnter(target);
      async.series([timeout(200), (next)=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        Simulate.mouseLeave(target);
        next();
      }, timeout(200), (next)=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect($(popupDomNode).css('display')).to.be('none');
        next();
      }], done);
    });
  });

  describe('placement', ()=> {
    it('left works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.left}
                                             popupStyle={{width:50}}
                                             popup={<div>trigger</div>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        expect(popupOffset.left + $(popupDomNode).outerWidth()).to.be(targetOffset.left - 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('auto adjust left works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.left}
                                             popupStyle={{width:400}}
                                             popup={<div>trigger</div>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        // offset is 3
        if (!window.callPhantom) {
          expect(popupOffset.left).to.be(targetOffset.left + $(domNode).outerWidth() + 3);
        }
        done();
      }, 100);
    });

    it('right works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.right}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.left).to.be(targetOffset.left + $(domNode).outerWidth() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottom works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.bottom}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottomRight works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.bottomRight}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('bottomLeft works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.bottomLeft}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top + $(domNode).outerHeight() + 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('top works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.top}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('topLeft works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.topLeft}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        expect(popupOffset.left).to.be(targetOffset.left);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('topRight works', (done)=> {
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={placementAlignMap.topRight}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() - 3);
        expect(popupOffset.left).to.be(targetOffset.left);
        Simulate.click(domNode);
        done();
      }, 20);
    });
  });

  describe('align', ()=> {
    it('offsetX works', (done)=> {
      let offsetX = 10;
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={assign({},placementAlignMap.bottomRight,{offset:[offsetX,3]})}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.left).to.be(targetOffset.left + offsetX);
        Simulate.click(domNode);
        done();
      }, 20);
    });

    it('offsetY works', (done)=> {
      let offsetY = 50;
      var trigger = ReactDOM.render(<Trigger action={['click']}
                                             popupAlign={assign({},placementAlignMap.topRight,{offset:[0,offsetY]})}
                                             popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      setTimeout(()=> {
        var popupDomNode = trigger.getPopupDomNode();
        expect(popupDomNode).to.be.ok();
        var targetOffset = $(domNode).offset();
        var popupOffset = $(popupDomNode).offset();
        console.log(popupOffset, targetOffset);
        expect(popupOffset.top).to.be(targetOffset.top - $(popupDomNode).outerHeight() + offsetY);
        Simulate.click(domNode);
        done();
      }, 20);
    });
  });

  if (window.TransitionEvent) {
    it('transitionName works', (done)=> {
      var trigger = ReactDOM.render(<Trigger
        action={['click']}
        popupTransitionName="fade"
        popupAlign={placementAlignMap.top}
        popup={<strong>trigger</strong>}>
        <div className="target">click</div>
      </Trigger>, div);
      var domNode = ReactDOM.findDOMNode(trigger);
      Simulate.click(domNode);
      async.series([
          timeout(100),
          (next)=> {
            var popupDomNode = trigger.getPopupDomNode();
            expect(popupDomNode).to.be.ok();
            expect($(popupDomNode).css('opacity')).not.to.be('1');
            next();
          },
          timeout(500),
          (next)=> {
            var popupDomNode = trigger.getPopupDomNode();
            expect(popupDomNode).to.be.ok();
            expect($(popupDomNode).css('opacity')).to.be('1');
            Simulate.click(domNode);
            next();
          },
          timeout(100),
          (next)=> {
            var popupDomNode = trigger.getPopupDomNode();
            expect(popupDomNode).to.be.ok();
            expect($(popupDomNode).css('opacity')).not.to.be('1');
            next();
          },
          timeout(500),
          (next)=> {
            var popupDomNode = trigger.getPopupDomNode();
            expect($(popupDomNode).css('display')).to.be('none');
            next();
          }],
        done);
    });
  }
});

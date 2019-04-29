webpackJsonp([2],{

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(153);


/***/ }),

/***/ 153:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_trigger__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less__);




/* eslint no-console:0, react/no-unused-state:0 */






function getPopupAlign(state) {
  return {
    offset: [state.offsetX, state.offsetY],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  };
}

var builtinPlacements = {
  left: {
    points: ['cr', 'cl']
  },
  right: {
    points: ['cl', 'cr']
  },
  top: {
    points: ['bc', 'tc']
  },
  bottom: {
    points: ['tc', 'bc']
  },
  topLeft: {
    points: ['bl', 'tl']
  },
  topRight: {
    points: ['br', 'tr']
  },
  bottomRight: {
    points: ['tr', 'br']
  },
  bottomLeft: {
    points: ['tl', 'bl']
  }
};

function preventDefault(e) {
  e.preventDefault();
}

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

var Test = function (_React$Component) {
  __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits___default()(Test, _React$Component);

  function Test() {
    var _temp, _this, _ret;

    __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck___default()(this, Test);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default()(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      mask: false,
      maskClosable: false,
      maskAnimation: false,
      placement: 'right',
      trigger: {
        hover: 1
      },
      offsetX: undefined,
      offsetY: undefined,
      stretch: ''
    }, _this.onPlacementChange = function (e) {
      _this.setState({
        placement: e.target.value
      });
    }, _this.onStretch = function (e) {
      _this.setState({
        stretch: e.target.value
      });
    }, _this.onTransitionChange = function (e) {
      _this.setState({
        transitionName: e.target.checked ? e.target.value : ''
      });
    }, _this.onTriggerChange = function (e) {
      var trigger = __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, _this.state.trigger);
      if (e.target.checked) {
        trigger[e.target.value] = 1;
      } else {
        delete trigger[e.target.value];
      }
      _this.setState({
        trigger: trigger
      });
    }, _this.onOffsetXChange = function (e) {
      var targetValue = e.target.value;
      _this.setState({
        offsetX: targetValue || undefined
      });
    }, _this.onOffsetYChange = function (e) {
      var targetValue = e.target.value;
      _this.setState({
        offsetY: targetValue || undefined
      });
    }, _this.onVisibleChange = function (visible) {
      console.log('tooltip', visible);
    }, _this.onMask = function (e) {
      _this.setState({
        mask: e.target.checked
      });
    }, _this.onMaskClosable = function (e) {
      _this.setState({
        maskClosable: e.target.checked
      });
    }, _this.onMaskAnimation = function (e) {
      _this.setState({
        maskAnimation: e.target.checked
      });
    }, _this.destroy = function () {
      _this.setState({
        destroyed: true
      });
    }, _this.destroyPopupOnHide = function (e) {
      _this.setState({
        destroyPopupOnHide: e.target.checked
      });
    }, _temp), __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default()(_this, _ret);
  }

  Test.prototype.render = function render() {
    var state = this.state;
    var trigger = state.trigger;
    if (state.destroyed) {
      return null;
    }

    var maskAnimationProps = {};
    if (this.state.maskAnimation) {
      maskAnimationProps = {
        maskAnimation: 'fade'
      };
    }

    return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        'div',
        { style: { margin: '10px 20px' } },
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          'placement:',
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
            'select',
            { value: state.placement, onChange: this.onPlacementChange },
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'right'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'left'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'top'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'bottom'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'topLeft'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'topRight'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'bottomRight'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              null,
              'bottomLeft'
            )
          )
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          'Stretch:',
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
            'select',
            { value: state.stretch, onChange: this.onStretch },
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              { value: '' },
              '--NONE--'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              { value: 'width' },
              'width'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              { value: 'minWidth' },
              'minWidth'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              { value: 'height' },
              'height'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'option',
              { value: 'minHeight' },
              'minHeight'
            )
          )
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            value: 'rc-trigger-popup-zoom',
            type: 'checkbox',
            onChange: this.onTransitionChange,
            checked: state.transitionName === 'rc-trigger-popup-zoom'
          }),
          'transitionName'
        ),
        '\xA0\xA0\xA0\xA0 trigger:',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            value: 'hover',
            checked: !!trigger.hover,
            type: 'checkbox',
            onChange: this.onTriggerChange
          }),
          'hover'
        ),
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            value: 'focus',
            checked: !!trigger.focus,
            type: 'checkbox',
            onChange: this.onTriggerChange
          }),
          'focus'
        ),
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            value: 'click',
            checked: !!trigger.click,
            type: 'checkbox',
            onChange: this.onTriggerChange
          }),
          'click'
        ),
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            value: 'contextMenu',
            checked: !!trigger.contextMenu,
            type: 'checkbox',
            onChange: this.onTriggerChange
          }),
          'contextMenu'
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            checked: !!this.state.destroyPopupOnHide,
            type: 'checkbox',
            onChange: this.destroyPopupOnHide
          }),
          'destroyPopupOnHide'
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            checked: !!this.state.mask,
            type: 'checkbox',
            onChange: this.onMask
          }),
          'mask'
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            checked: !!this.state.maskClosable,
            type: 'checkbox',
            onChange: this.onMaskClosable
          }),
          'maskClosable'
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            checked: !!this.state.maskAnimation,
            type: 'checkbox',
            onChange: this.onMaskAnimation
          }),
          'maskAnimation'
        ),
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('br', null),
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          'offsetX:',
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            type: 'text',
            onChange: this.onOffsetXChange,
            style: { width: 50 }
          })
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'label',
          null,
          'offsetY:',
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement('input', {
            type: 'text',
            onChange: this.onOffsetYChange,
            style: { width: 50 }
          })
        ),
        '\xA0\xA0\xA0\xA0',
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          'button',
          { onClick: this.destroy },
          'destroy'
        )
      ),
      __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        'div',
        { style: { margin: 120, position: 'relative' } },
        __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_6_rc_trigger__["a" /* default */],
          __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({
            getPopupContainer: undefined && getPopupContainer,
            popupAlign: getPopupAlign(state),
            popupPlacement: state.placement,
            destroyPopupOnHide: this.state.destroyPopupOnHide
            // zIndex={40}
            , mask: this.state.mask,
            maskClosable: this.state.maskClosable,
            stretch: this.state.stretch
          }, maskAnimationProps, {
            // mouseEnterDelay={0.1}
            // mouseLeaveDelay={0.1}
            action: Object.keys(state.trigger),
            builtinPlacements: builtinPlacements,
            popupStyle: {
              border: '1px solid red',
              padding: 10,
              background: 'white',
              boxSizing: 'border-box'
            },
            popup: __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'div',
              null,
              'i am a popup'
            ),
            popupTransitionName: state.transitionName
          }),
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
            'a',
            {
              style: { margin: 20, display: 'inline-block', background: 'rgba(255, 0, 0, 0.05)' },
              href: '#',
              onClick: preventDefault
            },
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'p',
              null,
              'This is a example of trigger usage.'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'p',
              null,
              'You can adjust the value above'
            ),
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'p',
              null,
              'which will also change the behaviour of popup.'
            )
          )
        )
      )
    );
  };

  return Test;
}(__WEBPACK_IMPORTED_MODULE_4_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_5_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[152]);
//# sourceMappingURL=simple.js.map
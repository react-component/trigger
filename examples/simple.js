webpackJsonp([0],{

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(74);


/***/ }),

/***/ 74:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_trigger__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rc_trigger_assets_index_less__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_object_assign__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_object_assign___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_object_assign__);




/* eslint no-console:0 */







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
    var _ref;

    var _temp, _this, _ret;

    __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default()(this, Test);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default()(this, (_ref = Test.__proto__ || Object.getPrototypeOf(Test)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      mask: false,
      maskClosable: false,
      placement: 'right',
      trigger: {
        hover: 1
      },
      offsetX: undefined,
      offsetY: undefined
    }, _this.onPlacementChange = function (e) {
      _this.setState({
        placement: e.target.value
      });
    }, _this.onTransitionChange = function (e) {
      _this.setState({
        transitionName: e.target.checked ? e.target.value : ''
      });
    }, _this.onTriggerChange = function (e) {
      var trigger = __WEBPACK_IMPORTED_MODULE_8_object_assign___default()({}, _this.state.trigger);
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

  __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass___default()(Test, [{
    key: 'render',
    value: function render() {
      var state = this.state;
      var trigger = state.trigger;
      if (state.destroyed) {
        return null;
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
          { style: { margin: 100, position: 'relative' } },
          __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
            __WEBPACK_IMPORTED_MODULE_6_rc_trigger__["a" /* default */],
            {
              getPopupContainer: undefined && getPopupContainer,
              popupAlign: getPopupAlign(state),
              popupPlacement: state.placement,
              destroyPopupOnHide: this.state.destroyPopupOnHide
              // zIndex={40}
              , mask: this.state.mask,
              maskClosable: this.state.maskClosable
              // maskAnimation="fade"
              // mouseEnterDelay={0.1}
              // mouseLeaveDelay={0.1}
              , action: Object.keys(state.trigger),
              builtinPlacements: builtinPlacements,
              popup: __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
                'div',
                { style: { border: '1px solid red', padding: 10, background: 'white' } },
                'i am a popup'
              ),
              popupTransitionName: state.transitionName
            },
            __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
              'a',
              { href: '#', style: { margin: 20 }, onClick: preventDefault },
              'trigger'
            )
          )
        )
      );
    }
  }]);

  return Test;
}(__WEBPACK_IMPORTED_MODULE_4_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_5_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[159]);
//# sourceMappingURL=simple.js.map
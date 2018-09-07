webpackJsonp([0],{

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(156);


/***/ }),

/***/ 156:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rc_trigger__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rc_trigger_assets_index_less__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rc_trigger_assets_index_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rc_trigger_assets_index_less__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__point_less__ = __webpack_require__(157);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__point_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__point_less__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint no-console:0 */







var builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl']
  }
};

var innerTrigger = __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
  'div',
  {
    style: { padding: 20, background: 'rgba(0, 255, 0, 0.3)' }
  },
  'This is popup'
);

var Test = function (_React$Component) {
  _inherits(Test, _React$Component);

  function Test() {
    var _temp, _this, _ret;

    _classCallCheck(this, Test);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      action: 'click',
      mouseEnterDelay: 0
    }, _this.onActionChange = function (_ref) {
      var value = _ref.target.value;

      _this.setState({ action: value });
    }, _this.onDelayChange = function (_ref2) {
      var value = _ref2.target.value;

      _this.setState({ mouseEnterDelay: Number(value) || 0 });
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Test.prototype.render = function render() {
    var _state = this.state,
        action = _state.action,
        mouseEnterDelay = _state.mouseEnterDelay;


    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'label',
        null,
        'Trigger type:',
        ' ',
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'select',
          { value: action, onChange: this.onActionChange },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'option',
            null,
            'click'
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'option',
            null,
            'hover'
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'option',
            null,
            'contextMenu'
          )
        )
      ),
      ' ',
      action === 'hover' && __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'label',
        null,
        'Mouse enter delay:',
        ' ',
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', { type: 'text', value: mouseEnterDelay, onChange: this.onDelayChange })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { style: { margin: 50 } },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_2_rc_trigger__["a" /* default */],
          {
            popupPlacement: 'topLeft',
            action: [action],
            popupAlign: {
              overflow: {
                adjustX: 1,
                adjustY: 1
              }
            },
            mouseEnterDelay: mouseEnterDelay,
            popupClassName: 'point-popup',
            builtinPlacements: builtinPlacements,
            popup: innerTrigger,
            alignPoint: true
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            {
              style: {
                border: '1px solid red',
                padding: '100px 0',
                textAlign: 'center'
              }
            },
            'Interactive region'
          )
        )
      )
    );
  };

  return Test;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ }),

/***/ 157:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[155]);
//# sourceMappingURL=point.js.map
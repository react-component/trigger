webpackJsonp([1],{

/***/ 71:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(72);


/***/ }),

/***/ 72:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_dom__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rc_trigger__ = __webpack_require__(62);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_trigger_assets_index_less__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_trigger_assets_index_less___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rc_trigger_assets_index_less__);



/* eslint no-console:0 */






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

var popupBorderStyle = {
  border: '1px solid red',
  padding: 10
};

function saveRef(name, component) {
  this[name] = component;
}

var Test = function (_React$Component) {
  __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_inherits___default()(Test, _React$Component);

  function Test(props) {
    __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default()(this, Test);

    var _this = __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_possibleConstructorReturn___default()(this, _React$Component.call(this, props));

    _this.saveContainerRef = saveRef.bind(_this, 'containerInstance');
    return _this;
  }

  Test.prototype.render = function render() {
    var _this2 = this;

    var innerTrigger = __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
      'div',
      { style: popupBorderStyle },
      __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement('div', { ref: this.saveContainerRef }),
      __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_5_rc_trigger__["a" /* default */],
        {
          popupPlacement: 'bottom',
          action: ['click'],
          builtinPlacements: builtinPlacements,
          getPopupContainer: function getPopupContainer() {
            return _this2.containerInstance;
          },
          popup: __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
            'div',
            { style: popupBorderStyle },
            'I am inner Trigger Popup'
          )
        },
        __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
          'span',
          { href: '#', style: { margin: 20 } },
          'clickToShowInnerTrigger'
        )
      )
    );
    return __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
        'div',
        null,
        __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_5_rc_trigger__["a" /* default */],
          {
            popupPlacement: 'left',
            action: ['click'],
            builtinPlacements: builtinPlacements,
            popup: __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
              'div',
              { style: popupBorderStyle },
              'i am a click popup'
            )
          },
          __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
            'span',
            null,
            __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
              __WEBPACK_IMPORTED_MODULE_5_rc_trigger__["a" /* default */],
              {
                popupPlacement: 'bottom',
                action: ['hover'],
                builtinPlacements: builtinPlacements,
                popup: __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
                  'div',
                  { style: popupBorderStyle },
                  'i am a hover popup'
                )
              },
              __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
                'span',
                { href: '#', style: { margin: 20 } },
                'trigger'
              )
            )
          )
        )
      ),
      __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
        'div',
        { style: { margin: 50 } },
        __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_5_rc_trigger__["a" /* default */],
          {
            popupPlacement: 'right',
            action: ['hover'],
            builtinPlacements: builtinPlacements,
            popup: innerTrigger
          },
          __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
            'span',
            { href: '#', style: { margin: 20 } },
            'trigger'
          )
        )
      )
    );
  };

  return Test;
}(__WEBPACK_IMPORTED_MODULE_3_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_4_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(
  'div',
  { style: { margin: 200 } },
  __WEBPACK_IMPORTED_MODULE_3_react___default.a.createElement(Test, null)
), document.getElementById('__react-content'));

/***/ })

},[71]);
//# sourceMappingURL=nested.js.map
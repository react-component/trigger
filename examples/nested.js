webpackJsonp([2],{

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(74);


/***/ }),

/***/ 74:
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
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
  _inherits(Test, _React$Component);

  function Test(props) {
    _classCallCheck(this, Test);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.saveContainerRef = saveRef.bind(_this, 'containerInstance');
    return _this;
  }

  Test.prototype.render = function render() {
    var _this2 = this;

    var innerTrigger = __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      { style: popupBorderStyle },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('div', { ref: this.saveContainerRef }),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_2_rc_trigger__["a" /* default */],
        {
          popupPlacement: 'bottom',
          action: ['click'],
          builtinPlacements: builtinPlacements,
          getPopupContainer: function getPopupContainer() {
            return _this2.containerInstance;
          },
          popup: __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            { style: popupBorderStyle },
            'I am inner Trigger Popup'
          )
        },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'span',
          { href: '#', style: { margin: 20 } },
          'clickToShowInnerTrigger'
        )
      )
    );
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        null,
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_2_rc_trigger__["a" /* default */],
          {
            popupPlacement: 'left',
            action: ['click'],
            builtinPlacements: builtinPlacements,
            popup: __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'div',
              { style: popupBorderStyle },
              'i am a click popup'
            )
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'span',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              __WEBPACK_IMPORTED_MODULE_2_rc_trigger__["a" /* default */],
              {
                popupPlacement: 'bottom',
                action: ['hover'],
                builtinPlacements: builtinPlacements,
                popup: __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                  'div',
                  { style: popupBorderStyle },
                  'i am a hover popup'
                )
              },
              __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                'span',
                { href: '#', style: { margin: 20 } },
                'trigger'
              )
            )
          )
        )
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { style: { margin: 50 } },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_2_rc_trigger__["a" /* default */],
          {
            popupPlacement: 'right',
            action: ['hover'],
            builtinPlacements: builtinPlacements,
            popup: innerTrigger
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'span',
            { href: '#', style: { margin: 20 } },
            'trigger'
          )
        )
      )
    );
  };

  return Test;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
  'div',
  { style: { margin: 200 } },
  __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Test, null)
), document.getElementById('__react-content'));

/***/ })

},[73]);
//# sourceMappingURL=nested.js.map
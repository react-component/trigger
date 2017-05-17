webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _possibleConstructorReturn2 = __webpack_require__(3);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(72);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _react = __webpack_require__(80);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(115);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTrigger = __webpack_require__(261);
	
	var _rcTrigger2 = _interopRequireDefault(_rcTrigger);
	
	__webpack_require__(306);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
	
	var Test = function (_React$Component) {
	  (0, _inherits3.default)(Test, _React$Component);
	
	  function Test() {
	    (0, _classCallCheck3.default)(this, Test);
	    return (0, _possibleConstructorReturn3.default)(this, _React$Component.apply(this, arguments));
	  }
	
	  Test.prototype.render = function render() {
	    var _this2 = this;
	
	    var innerTrigger = _react2.default.createElement(
	      'div',
	      { style: popupBorderStyle },
	      _react2.default.createElement('div', { ref: 'container' }),
	      _react2.default.createElement(
	        _rcTrigger2.default,
	        {
	          popupPlacement: 'bottom',
	          action: ['click'],
	          builtinPlacements: builtinPlacements,
	          getPopupContainer: function getPopupContainer() {
	            return _this2.refs.container;
	          },
	          popup: _react2.default.createElement(
	            'div',
	            { style: popupBorderStyle },
	            'I am inner Trigger Popup'
	          )
	        },
	        _react2.default.createElement(
	          'span',
	          { href: '#', style: { margin: 20 } },
	          'clickToShowInnerTrigger'
	        )
	      )
	    );
	    return _react2.default.createElement(
	      'div',
	      null,
	      _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(
	          _rcTrigger2.default,
	          {
	            popupPlacement: 'left',
	            action: ['click'],
	            builtinPlacements: builtinPlacements,
	            popup: _react2.default.createElement(
	              'div',
	              { style: popupBorderStyle },
	              'i am a click popup'
	            )
	          },
	          _react2.default.createElement(
	            'span',
	            null,
	            _react2.default.createElement(
	              _rcTrigger2.default,
	              {
	                popupPlacement: 'bottom',
	                action: ['hover'],
	                builtinPlacements: builtinPlacements,
	                popup: _react2.default.createElement(
	                  'div',
	                  { style: popupBorderStyle },
	                  'i am a hover popup'
	                )
	              },
	              _react2.default.createElement(
	                'span',
	                { href: '#', style: { margin: 20 } },
	                'trigger'
	              )
	            )
	          )
	        )
	      ),
	      _react2.default.createElement(
	        'div',
	        { style: { margin: 50 } },
	        _react2.default.createElement(
	          _rcTrigger2.default,
	          {
	            popupPlacement: 'right',
	            action: ['hover'],
	            builtinPlacements: builtinPlacements,
	            popup: innerTrigger
	          },
	          _react2.default.createElement(
	            'span',
	            { href: '#', style: { margin: 20 } },
	            'trigger'
	          )
	        )
	      )
	    );
	  };
	
	  return Test;
	}(_react2.default.Component);
	
	_reactDom2.default.render(_react2.default.createElement(
	  'div',
	  { style: { margin: 200 } },
	  _react2.default.createElement(Test, null)
	), document.getElementById('__react-content'));

/***/ })
]);
//# sourceMappingURL=nested.js.map
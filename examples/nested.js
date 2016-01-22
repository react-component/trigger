webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint no-console:0 */
	
	'use strict';
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(159);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTrigger = __webpack_require__(160);
	
	var _rcTrigger2 = _interopRequireDefault(_rcTrigger);
	
	__webpack_require__(208);
	
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
	
	var Test = _react2['default'].createClass({
	  displayName: 'Test',
	
	  render: function render() {
	    return _react2['default'].createElement(
	      'div',
	      null,
	      _react2['default'].createElement(
	        _rcTrigger2['default'],
	        {
	          popupPlacement: 'right',
	          action: ['click'],
	          builtinPlacements: builtinPlacements,
	          popup: _react2['default'].createElement(
	            'div',
	            { style: { border: '1px solid red', padding: 10 } },
	            'i am a click popup'
	          ) },
	        _react2['default'].createElement(
	          _rcTrigger2['default'],
	          {
	            popupPlacement: 'bottom',
	            action: ['hover'],
	            builtinPlacements: builtinPlacements,
	            popup: _react2['default'].createElement(
	              'div',
	              { style: { border: '1px solid red', padding: 10 } },
	              'i am a hover popup'
	            ) },
	          _react2['default'].createElement(
	            'span',
	            { href: '#', style: { margin: 20 } },
	            'trigger'
	          )
	        )
	      )
	    );
	  }
	});
	
	_reactDom2['default'].render(_react2['default'].createElement(
	  'div',
	  null,
	  _react2['default'].createElement(Test, null)
	), document.getElementById('__react-content'));

/***/ }
]);
//# sourceMappingURL=nested.js.map
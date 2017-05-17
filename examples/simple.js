webpackJsonp([1],{

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(307);


/***/ }),

/***/ 307:
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
	
	var _objectAssign = __webpack_require__(278);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function getPopupAlign(state) {
	  return {
	    offset: [state.offsetX, state.offsetY],
	    overflow: {
	      adjustX: 1,
	      adjustY: 1
	    }
	  };
	} /* eslint no-console:0 */
	
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
	  (0, _inherits3.default)(Test, _React$Component);
	
	  function Test() {
	    var _temp, _this, _ret;
	
	    (0, _classCallCheck3.default)(this, Test);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
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
	      var trigger = (0, _objectAssign2.default)({}, _this.state.trigger);
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
	    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
	  }
	
	  Test.prototype.render = function render() {
	    var state = this.state;
	    var trigger = state.trigger;
	    if (state.destroyed) {
	      return null;
	    }
	    return _react2.default.createElement(
	      'div',
	      null,
	      _react2.default.createElement(
	        'div',
	        { style: { margin: '10px 20px' } },
	        _react2.default.createElement(
	          'label',
	          null,
	          'placement:',
	          _react2.default.createElement(
	            'select',
	            { value: state.placement, onChange: this.onPlacementChange },
	            _react2.default.createElement(
	              'option',
	              null,
	              'right'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'left'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'top'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'bottom'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'topLeft'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'topRight'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'bottomRight'
	            ),
	            _react2.default.createElement(
	              'option',
	              null,
	              'bottomLeft'
	            )
	          )
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            value: 'rc-trigger-popup-zoom',
	            type: 'checkbox',
	            onChange: this.onTransitionChange,
	            checked: state.transitionName === 'rc-trigger-popup-zoom'
	          }),
	          'transitionName'
	        ),
	        '\xA0\xA0\xA0\xA0 trigger:',
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            value: 'hover',
	            checked: !!trigger.hover,
	            type: 'checkbox',
	            onChange: this.onTriggerChange
	          }),
	          'hover'
	        ),
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            value: 'focus',
	            checked: !!trigger.focus,
	            type: 'checkbox',
	            onChange: this.onTriggerChange
	          }),
	          'focus'
	        ),
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            value: 'click',
	            checked: !!trigger.click,
	            type: 'checkbox',
	            onChange: this.onTriggerChange
	          }),
	          'click'
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            checked: !!this.state.destroyPopupOnHide,
	            type: 'checkbox',
	            onChange: this.destroyPopupOnHide
	          }),
	          'destroyPopupOnHide'
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            checked: !!this.state.mask,
	            type: 'checkbox',
	            onChange: this.onMask
	          }),
	          'mask'
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'label',
	          null,
	          _react2.default.createElement('input', {
	            checked: !!this.state.maskClosable,
	            type: 'checkbox',
	            onChange: this.onMaskClosable
	          }),
	          'maskClosable'
	        ),
	        _react2.default.createElement('br', null),
	        _react2.default.createElement(
	          'label',
	          null,
	          'offsetX:',
	          _react2.default.createElement('input', {
	            type: 'text',
	            onChange: this.onOffsetXChange,
	            style: { width: 50 }
	          })
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'label',
	          null,
	          'offsetY:',
	          _react2.default.createElement('input', {
	            type: 'text',
	            onChange: this.onOffsetYChange,
	            style: { width: 50 }
	          })
	        ),
	        '\xA0\xA0\xA0\xA0',
	        _react2.default.createElement(
	          'button',
	          { onClick: this.destroy },
	          'destroy'
	        )
	      ),
	      _react2.default.createElement(
	        'div',
	        { style: { margin: 100, position: 'relative' } },
	        _react2.default.createElement(
	          _rcTrigger2.default,
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
	            popup: _react2.default.createElement(
	              'div',
	              { style: { border: '1px solid red', padding: 10, background: 'white' } },
	              'i am a popup'
	            ),
	            popupTransitionName: state.transitionName
	          },
	          _react2.default.createElement(
	            'a',
	            { href: '#', style: { margin: 20 }, onClick: preventDefault },
	            'trigger'
	          )
	        )
	      )
	    );
	  };
	
	  return Test;
	}(_react2.default.Component);
	
	_reactDom2.default.render(_react2.default.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

});
//# sourceMappingURL=simple.js.map
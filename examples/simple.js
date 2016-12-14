webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(255);


/***/ },

/***/ 255:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(33);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcTrigger = __webpack_require__(180);
	
	var _rcTrigger2 = _interopRequireDefault(_rcTrigger);
	
	__webpack_require__(254);
	
	var _objectAssign = __webpack_require__(256);
	
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
	
	var Test = _react2.default.createClass({
	  displayName: 'Test',
	  getInitialState: function getInitialState() {
	    return {
	      mask: false,
	      maskClosable: false,
	      placement: 'right',
	      trigger: {
	        hover: 1
	      },
	      offsetX: undefined,
	      offsetY: undefined
	    };
	  },
	  onPlacementChange: function onPlacementChange(e) {
	    this.setState({
	      placement: e.target.value
	    });
	  },
	  onTransitionChange: function onTransitionChange(e) {
	    this.setState({
	      transitionName: e.target.checked ? e.target.value : ''
	    });
	  },
	  onTriggerChange: function onTriggerChange(e) {
	    var trigger = (0, _objectAssign2.default)({}, this.state.trigger);
	    if (e.target.checked) {
	      trigger[e.target.value] = 1;
	    } else {
	      delete trigger[e.target.value];
	    }
	    this.setState({
	      trigger: trigger
	    });
	  },
	  onOffsetXChange: function onOffsetXChange(e) {
	    var targetValue = e.target.value;
	    this.setState({
	      offsetX: targetValue || undefined
	    });
	  },
	  onOffsetYChange: function onOffsetYChange(e) {
	    var targetValue = e.target.value;
	    this.setState({
	      offsetY: targetValue || undefined
	    });
	  },
	  onVisibleChange: function onVisibleChange(visible) {
	    console.log('tooltip', visible);
	  },
	  onMask: function onMask(e) {
	    this.setState({
	      mask: e.target.checked
	    });
	  },
	  onMaskClosable: function onMaskClosable(e) {
	    this.setState({
	      maskClosable: e.target.checked
	    });
	  },
	  destroy: function destroy() {
	    this.setState({
	      destroyed: true
	    });
	  },
	  destroyPopupOnHide: function destroyPopupOnHide(e) {
	    this.setState({
	      destroyPopupOnHide: e.target.checked
	    });
	  },
	  render: function render() {
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
	  }
	});
	
	_reactDom2.default.render(_react2.default.createElement(
	  'div',
	  null,
	  _react2.default.createElement(Test, null)
	), document.getElementById('__react-content'));

/***/ },

/***/ 256:
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ }

});
//# sourceMappingURL=simple.js.map
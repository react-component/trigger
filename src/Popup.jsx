import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Align from 'rc-align';
import Animate from 'rc-animate';
import PopupInner from './PopupInner';

const Popup = React.createClass({
  propTypes: {
    visible: PropTypes.bool,
    wrap: PropTypes.object,
    style: PropTypes.object,
    getClassNameFromAlign: PropTypes.func,
    onMouseEnter: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseLeave: PropTypes.func,
  },

  componentDidMount() {
    this.rootNode = this.getPopupDomNode();
  },

  onAlign(popupDomNode, align) {
    const props = this.props;
    const alignClassName = props.getClassNameFromAlign(props.align);
    const currentAlignClassName = props.getClassNameFromAlign(align);
    if (alignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      popupDomNode.className = this.getClassName(currentAlignClassName);
    }
  },

  getPopupDomNode() {
    return ReactDOM.findDOMNode(this);
  },

  getTarget() {
    return ReactDOM.findDOMNode(this.props.wrap);
  },

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  },

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  },

  render() {
    const props = this.props;
    const { align, style, visible, prefixCls, destroyPopupOnHide } = props;
    const className = this.getClassName(this.currentAlignClassName ||
      props.getClassNameFromAlign(align));
    const hiddenClassName = `${prefixCls}-hidden`;
    if (!visible) {
      this.currentAlignClassName = null;
    }
    if (destroyPopupOnHide) {
      return (<Animate
        component=""
        exclusive
        transitionAppear
        transitionName={this.getTransitionName()}
      >
        {visible ? (<Align
          target={this.getTarget}
          key="popup"
          monitorWindowResize
          align={align}
          onAlign={this.onAlign}
        >
          <PopupInner
            className={className}
            visible
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            style={style}
          >
            {props.children}
          </PopupInner>
        </Align>) : null}
      </Animate>);
    }
    return (<Animate
      component=""
      exclusive
      transitionAppear
      transitionName={this.getTransitionName()}
      showProp="xVisible"
    >
      <Align
        target={this.getTarget}
        key="popup"
        monitorWindowResize
        xVisible={visible}
        childrenProps={{ visible: 'xVisible' }}
        disabled={!visible}
        align={align}
        onAlign={this.onAlign}
      >
        <PopupInner
          className={className}
          hiddenClassName={hiddenClassName}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          style={style}
        >
          {props.children}
        </PopupInner>
      </Align>
    </Animate>);
  },
});

export default Popup;

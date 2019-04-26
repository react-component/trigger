import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Align from 'rc-align';
import classNames from 'classnames';
import CSSMotion from 'rc-animate/lib/CSSMotion';
import { supportTransition } from 'rc-animate/lib/util/motion';
import { polyfill } from 'react-lifecycles-compat';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import { saveRef } from './utils';

class Popup extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    mask: PropTypes.bool,
    style: PropTypes.object,
    getClassNameFromAlign: PropTypes.func,
    onAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
    onTouchStart: PropTypes.func,
    stretch: PropTypes.string,
    children: PropTypes.node,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      // Used for stretch
      stretchUpdated: false,
      targetWidth: undefined,
      targetHeight: undefined,

      // Used for motion
      needAlign: true,
    };

    this.savePopupRef = saveRef.bind(this, 'popupInstance');
    this.saveAlignRef = saveRef.bind(this, 'alignInstance');
  }

  componentDidMount() {
    this.rootNode = this.getPopupDomNode();
    this.syncStretchSize();
  }

  componentDidUpdate() {
    this.syncStretchSize();
  }

  onAlign = (popupDomNode, align) => {
    const { onAlign } = this.props;
    // TODO: Double confirm this
    // const currentAlignClassName = props.getClassNameFromAlign(align);
    // FIX: https://github.com/react-component/trigger/issues/56
    // FIX: https://github.com/react-component/tooltip/issues/79
    // console.log('on align:', this.currentAlignClassName, currentAlignClassName);
    // if (this.currentAlignClassName !== currentAlignClassName) {
    //   this.currentAlignClassName = currentAlignClassName;
    //   popupDomNode.className = this.getClassName(currentAlignClassName);
    // }
    onAlign(popupDomNode, align);
  };

  onMotionStart = () => {
    this.setState({
      needAlign: false,
    });
  };

  /**
   * We manage the motion status by every props change:
   * 1. When visible: false -> true
   *    1. Reset needAlign: true
   *    2. Reset stretchUpdated if needed
   * 2. on componentDidUpdate
   *    1. if stretchUpdated is true, measure the size
   *      1. Set stretchUpdated to true
   * 3. Render popup but hidden it (visibility: false)
   *    1. Set needAlign: false
   *
   * Render visible:
   * 1. true until stretchUpdated & visible
   */
  static getDerivedStateFromProps(nextProps, { prevProps = {} }) {
    const newState = {
      prevProps: nextProps,
    };

    if (nextProps.visible !== prevProps.visible && nextProps.visible) {
      newState.needAlign = true;
      newState.stretchUpdated = false;
    }

    return newState;
  }

  getPopupDomNode() {
    return ReactDOM.findDOMNode(this.popupInstance);
  }

  getTargetElement = () => {
    return this.props.getRootDomNode();
  };

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  getAlignTarget = () => {
    const { point } = this.props;
    if (point) {
      return point;
    }
    return this.getTargetElement;
  };

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    if (!supportTransition) return null;

    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  }

  getZIndexStyle() {
    const style = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  // ============================== Dom ===============================
  syncStretchSize = () => {
    const { stretchUpdated } = this.state;
    const { getRootDomNode, stretch } = this.props;

    if (!stretch || stretchUpdated) return;

    const ele = getRootDomNode();
    const { width, height } = ele.getBoundingClientRect();

    this.setState({
      stretchUpdated: true,
      targetWidth: width,
      targetHeight: height,
    });
  };

  // ============================= Render =============================
  renderPopupElement() {
    const { savePopupRef } = this;
    const { stretchUpdated, targetHeight, targetWidth, needAlign } = this.state;
    const {
      align,
      visible,
      prefixCls,
      style,
      getClassNameFromAlign,
      destroyPopupOnHide,
      stretch,
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
    } = this.props;
    const className = this.getClassName(this.currentAlignClassName || getClassNameFromAlign(align));
    const hiddenClassName = `${prefixCls}-hidden`;

    if (!visible) {
      this.currentAlignClassName = null;
    }

    const sizeStyle = {};
    if (stretch) {
      // Stretch with target
      if (stretch.indexOf('height') !== -1) {
        sizeStyle.height = targetHeight;
      } else if (stretch.indexOf('minHeight') !== -1) {
        sizeStyle.minHeight = targetHeight;
      }
      if (stretch.indexOf('width') !== -1) {
        sizeStyle.width = targetWidth;
      } else if (stretch.indexOf('minWidth') !== -1) {
        sizeStyle.minWidth = targetWidth;
      }
    }

    const newStyle = {
      ...sizeStyle,
      ...style,
      ...this.getZIndexStyle(),
    };

    const popupInnerProps = {
      prefixCls,
      ref: savePopupRef,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
      style: newStyle,
      visible,
    };

    let mergedVisible = visible;
    if (stretch && !stretchUpdated) {
      mergedVisible = false;
    }

    const transitionName = this.getTransitionName();

    let mergedNeedAlign = visible && !transitionName;
    if (transitionName) {
      mergedNeedAlign = visible && needAlign;
    }

    return (
      <CSSMotion
        visible={mergedVisible}
        motionName={transitionName}
        removeOnLeave={destroyPopupOnHide}
        leavedClassName={hiddenClassName}
        onEnterStart={this.onMotionStart}
        onAppearStart={this.onMotionStart}
      >
        {({ className: motionClassName }) => {
          return (
            <Align
              target={this.getAlignTarget()}
              key="popup"
              ref={this.saveAlignRef}
              monitorWindowResize
              disabled={!mergedNeedAlign}
              align={align}
              onAlign={this.onAlign}
            >
              <PopupInner {...popupInnerProps} className={classNames(className, motionClassName)}>
                {children}
              </PopupInner>
            </Align>
          );
        }}
      </CSSMotion>
    );
  }

  renderMaskElement() {
    const { prefixCls, visible, mask } = this.props;
    let maskElement;
    if (mask) {
      const maskTransition = this.getMaskTransitionName();

      const lazyRenderProps = {
        style: this.getZIndexStyle(),
        key: 'mask',
        className: `${prefixCls}-mask`,
        visible,
      };

      maskElement = (
        <CSSMotion
          motionName={maskTransition}
          leavedClassName={`${prefixCls}-mask-hidden`}
          visible={visible}
        >
          {({ className: motionClassName }) => {
            return (
              <LazyRenderBox
                {...lazyRenderProps}
                className={classNames(lazyRenderProps.className, motionClassName)}
              />
            );
          }}
        </CSSMotion>
      );
    }
    return maskElement;
  }

  render() {
    return (
      <div>
        {this.renderMaskElement()}
        {this.renderPopupElement()}
      </div>
    );
  }
}

polyfill(Popup);

export default Popup;

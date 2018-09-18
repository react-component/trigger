import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Align from 'rc-align';
import classNames from 'classnames';
import { CSSMotion } from 'rc-animate';
import { supportTransition } from 'rc-animate/lib/util/motion';
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
    onMouseEnter: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    onMouseLeave: PropTypes.func,
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
      stretchChecked: false,
      targetWidth: undefined,
      targetHeight: undefined,

      // Used for motion
      motionEntered: false,
    };

    this.savePopupRef = saveRef.bind(this, 'popupInstance');
    this.saveAlignRef = saveRef.bind(this, 'alignInstance');
  }

  componentDidMount() {
    this.rootNode = this.getPopupDomNode();
    this.setStretchSize();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.setState({
        motionEntered: false,
      });
    }
  }

  componentDidUpdate() {
    this.setStretchSize();
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
  }

  onMotionStart = () => {
    this.setState({
      motionEntered: true,
    });
  };

  // Record size if stretch needed
  setStretchSize = () => {
    const { stretch, getRootDomNode, visible } = this.props;
    const { stretchChecked, targetHeight, targetWidth } = this.state;

    if (!stretch || !visible) {
      if (stretchChecked) {
        this.setState({ stretchChecked: false });
      }
      return;
    }

    const $ele = getRootDomNode();
    if (!$ele) return;

    const height = $ele.offsetHeight;
    const width = $ele.offsetWidth;

    if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
      this.setState({
        stretchChecked: true,
        targetHeight: height,
        targetWidth: width,
      });
    }
  };

  getPopupDomNode() {
    return ReactDOM.findDOMNode(this.popupInstance);
  }

  getTargetElement = () => {
    return this.props.getRootDomNode();
  }

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  getAlignTarget = () => {
    const { point } = this.props;
    if (point) {
      return point;
    }
    return this.getTargetElement;
  }

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

  getPopupElement() {
    const { savePopupRef } = this;
    const { stretchChecked, targetHeight, targetWidth, motionEntered } = this.state;
    const {
      align, visible,
      prefixCls, style, getClassNameFromAlign,
      destroyPopupOnHide, stretch, children,
      onMouseEnter, onMouseLeave,
    } = this.props;
    const className = this.getClassName(this.currentAlignClassName ||
      getClassNameFromAlign(align));
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

      // Delay force align to makes ui smooth
      if (!stretchChecked) {
        sizeStyle.visibility = 'hidden';
        setTimeout(() => {
          if (this.alignInstance) {
            this.alignInstance.forceAlign();
          }
        }, 0);
      }
    }

    const newStyle = {
      ...sizeStyle,
      ...style,
      ...this.getZIndexStyle(),
    };

    const popupInnerProps = {
      // className,
      prefixCls,
      ref: savePopupRef,
      onMouseEnter,
      onMouseLeave,
      style: newStyle,
      visible,
    };

    const transitionName = supportTransition ? this.getTransitionName() : null;

    let needAlign = !transitionName;
    if (transitionName) {
      needAlign = visible && !motionEntered;
    }

    return (
      <CSSMotion
        visible={visible}
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
              disabled={!needAlign}
              align={align}
              onAlign={this.onAlign}
            >
              <PopupInner
                {...popupInnerProps}
                className={classNames(className, motionClassName)}
              >
                {children}
              </PopupInner>
            </Align>
          );
        }}
      </CSSMotion>
    );
  }

  getZIndexStyle() {
    const style = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getMaskElement() {
    const { prefixCls, visible, mask } = this.props;
    let maskElement;
    if (mask) {
      const maskTransition = this.getMaskTransitionName();

      const lazyRenderProps = {
        style: this.getZIndexStyle(),
        key: 'mask',
        className: `${prefixCls}-mask`,
        // hiddenClassName: `${props.prefixCls}-mask-hidden`,
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

      // if (maskTransition) {
      //   maskElement = (
      //     <Animate
      //       key="mask"
      //       showProp="visible"
      //       transitionAppear
      //       component=""
      //       transitionName={maskTransition}
      //     >
      //       {maskElement}
      //     </Animate>
      //   );
      // }
    }
    return maskElement;
  }

  render() {
    return (
      <div>
        {this.getMaskElement()}
        {this.getPopupElement()}
      </div>
    );
  }
}

export default Popup;

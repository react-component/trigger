/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import Align from 'rc-align';
import Animate from 'rc-animate';
import PopupInner from './PopupInner';
import LazyRenderBox from './LazyRenderBox';
import { StretchType, AlignType, TransitionNameType, AnimationType } from './interface';

interface PopupProps {
  visible?: boolean;
  style?: React.CSSProperties;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;
  getRootDomNode?: () => HTMLElement;
  align?: AlignType;
  destroyPopupOnHide?: boolean;
  className?: string;
  prefixCls?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onTouchStart?: React.TouchEventHandler<HTMLElement>;
  stretch?: StretchType;
  children?: React.ReactNode;
  point?: { pageX: number; pageY: number };
  zIndex?: number;
  mask?: boolean;

  // TODO: handle this
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;
}

interface PopupState {
  stretchChecked: boolean;
  targetWidth: number;
  targetHeight: number;
}

interface AlignRefType {
  forceAlign: () => void;
}

class Popup extends Component<PopupProps, PopupState> {
  state = {
    // Used for stretch
    stretchChecked: false,
    targetWidth: undefined,
    targetHeight: undefined,
  };

  rootNode: HTMLElement;

  currentAlignClassName: string;

  popupRef = React.createRef<HTMLDivElement>();

  alignRef = React.createRef<AlignRefType>();

  componentDidMount() {
    this.rootNode = this.popupRef.current;
    this.setStretchSize();
  }

  componentDidUpdate() {
    this.setStretchSize();
  }

  onAlign = (popupDomNode: HTMLElement, align: AlignType) => {
    const { getClassNameFromAlign, onAlign } = this.props;
    const currentAlignClassName = getClassNameFromAlign(align);
    // FIX: https://github.com/react-component/trigger/issues/56
    // FIX: https://github.com/react-component/tooltip/issues/79
    if (this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      popupDomNode.className = this.getClassName(currentAlignClassName);
    }
    onAlign(popupDomNode, align);
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

  getTargetElement = () => this.props.getRootDomNode();

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
    const { props } = this;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  }

  getTransitionName() {
    const { props } = this;
    let { transitionName } = props;
    if (!transitionName && props.animation) {
      transitionName = `${props.prefixCls}-${props.animation}`;
    }
    return transitionName;
  }

  getClassName(currentAlignClassName) {
    return `${this.props.prefixCls} ${this.props.className} ${currentAlignClassName}`;
  }

  getPopupElement() {
    const { stretchChecked, targetHeight, targetWidth } = this.state;
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

    const sizeStyle: React.CSSProperties = {};
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
          if (this.alignRef.current) {
            this.alignRef.current.forceAlign();
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
      className,
      prefixCls,
      ref: this.popupRef,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
      style: newStyle,
    };
    if (destroyPopupOnHide) {
      return (
        <Animate component="" exclusive transitionAppear transitionName={this.getTransitionName()}>
          {visible ? (
            <Align
              target={this.getAlignTarget()}
              key="popup"
              ref={this.alignRef}
              monitorWindowResize
              align={align}
              onAlign={this.onAlign}
            >
              <PopupInner visible {...popupInnerProps}>
                {children}
              </PopupInner>
            </Align>
          ) : null}
        </Animate>
      );
    }

    return (
      <Animate
        component=""
        exclusive
        transitionAppear
        transitionName={this.getTransitionName()}
        showProp="xVisible"
      >
        <Align
          target={this.getAlignTarget()}
          key="popup"
          ref={this.alignRef}
          monitorWindowResize
          xVisible={visible}
          childrenProps={{ visible: 'xVisible' }}
          disabled={!visible}
          align={align}
          onAlign={this.onAlign}
        >
          <PopupInner hiddenClassName={hiddenClassName} {...popupInnerProps}>
            {children}
          </PopupInner>
        </Align>
      </Animate>
    );
  }

  getZIndexStyle() {
    const style: React.CSSProperties = {};
    const { props } = this;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  }

  getMaskElement() {
    const { props } = this;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getZIndexStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          visible={props.visible}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            showProp="visible"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
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
/* eslint-enable */

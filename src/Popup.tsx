/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import Align from 'rc-align';
import { composeRef } from 'rc-util/lib/ref';
import classNames from 'classnames';
import RawCSSMotion from 'rc-animate/lib/CSSMotion';
import PopupInner from './PopupInner';
import {
  StretchType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  CSSMotionClass,
  MotionType,
} from './interface';

/**
 * Popup should follow the steps for each component work correctly:
 * measure - check for the current stretch size
 * align - let component align the position
 * motion - play the motion
 * stable - everything is done
 */
type PopupStatus = null | 'measure' | 'align' | 'beforeMotion' | 'motion' | 'stable';

const CSSMotion = RawCSSMotion as CSSMotionClass;

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
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // TODO: handle this
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;

  motion: MotionType;
}

interface PopupState {
  stretchChecked: boolean;
  targetWidth: number;
  targetHeight: number;

  status: PopupStatus;
  prevVisible: boolean;
}

interface AlignRefType {
  forceAlign: () => void;
}

class Popup extends Component<PopupProps, PopupState> {
  state: PopupState = {
    // Used for stretch
    stretchChecked: false,
    targetWidth: undefined,
    targetHeight: undefined,

    status: null,
    prevVisible: null,
  };

  public popupRef = React.createRef<HTMLDivElement>();

  public alignRef = React.createRef<AlignRefType>();

  static getDerivedStateFromProps({ visible, stretch }: PopupProps, { status }: PopupState) {
    const newState: Partial<PopupState> = {
      prevVisible: visible,
    };

    if (visible && status !== 'stable') {
      // Should do measure
      switch (status) {
        case null: {
          newState.status = stretch ? 'measure' : 'align';
          break;
        }
        case 'measure':
        case 'align':
        case 'motion': {
          // Go to next status
          const queue: PopupStatus[] = ['measure', 'align', 'beforeMotion', 'motion', 'stable'];
          const index = queue.indexOf(status);
          newState.status = queue[index + 1];
          break;
        }
      }
    } else if (!visible && status !== null) {
      // Restore status to null
      newState.status = null;
    }

    return newState;
  }

  componentDidUpdate() {
    const { status } = this.state;
    const { getRootDomNode } = this.props;

    switch (status) {
      // Measure stretch size
      case 'measure': {
        const $ele = getRootDomNode();
        if ($ele) {
          this.setState({ targetHeight: $ele.offsetHeight, targetWidth: $ele.offsetWidth });
        }
        break;
      }
      case 'align': {
        break;
      }
    }
  }

  onAlign = () => {
    // TODO: handle this
  };

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  getAlignTarget = () => {
    const { point, getRootDomNode } = this.props;
    if (point) {
      return point;
    }
    return getRootDomNode;
  };

  getZIndexStyle(): React.CSSProperties {
    const { zIndex } = this.props;
    return { zIndex };
  }

  // TODO: handle this
  getMaskElement = () => null;

  getPopupElement = () => {
    const { status, targetHeight, targetWidth } = this.state;
    const {
      prefixCls,
      className,
      style,
      stretch,
      visible,
      motion,
      align,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
      children,
    } = this.props;

    const mergedClassName = classNames(prefixCls, className);
    const hiddenClassName = `${prefixCls}-hidden`;

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
    }

    const mergedStyle: React.CSSProperties = {
      ...sizeStyle,
      ...style,
      ...this.getZIndexStyle(),
    };

    return (
      <CSSMotion visible={visible} {...motion} removeOnLeave={false}>
        {({ style: motionStyle, className: motionClassName }, motionRef) => {
          console.log('=>', motionStyle, motionClassName);
          return (
            <Align
              target={this.getAlignTarget()}
              key="popup"
              ref={this.alignRef}
              monitorWindowResize
              disabled={!visible}
              align={align}
              onAlign={this.onAlign}
            >
              <PopupInner
                prefixCls={prefixCls}
                visible={visible}
                hiddenClassName={hiddenClassName}
                className={classNames(mergedClassName, motionClassName)}
                ref={composeRef(motionRef, this.popupRef)}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                style={mergedStyle}
              >
                {children}
              </PopupInner>
            </Align>
          );
        }}
      </CSSMotion>
    );
  };

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

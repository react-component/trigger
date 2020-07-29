/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import raf from 'raf';
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
import { getMotion } from './utils/legacyUtil';

/**
 * Popup should follow the steps for each component work correctly:
 * measure - check for the current stretch size
 * align - let component align the position
 * aligned - re-align again in case additional className changed the size
 * afterAlign - choice next step is trigger motion or finished
 * beforeMotion - should reset motion to invisible so that CSSMotion can do normal motion
 * motion - play the motion
 * stable - everything is done
 */
type PopupStatus =
  | null
  | 'measure'
  | 'align'
  | 'aligned'
  | 'afterAlign'
  | 'beforeMotion'
  | 'motion'
  | 'AfterMotion'
  | 'stable';

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
  prefixCls: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onTouchStart?: React.TouchEventHandler<HTMLElement>;
  stretch?: StretchType;
  children?: React.ReactNode;
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion: MotionType;
  maskMotion: MotionType;

  // Legacy
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;
}

interface PopupState {
  targetWidth: number;
  targetHeight: number;

  status: PopupStatus;
  prevVisible: boolean;
  alignClassName: string;
}

interface AlignRefType {
  forceAlign: () => void;
}

function supportMotion(motion: MotionType) {
  return motion && motion.motionName;
}

class Popup extends Component<PopupProps, PopupState> {
  state: PopupState = {
    targetWidth: undefined,
    targetHeight: undefined,

    status: null,
    prevVisible: null, // eslint-disable-line react/no-unused-state
    alignClassName: null,
  };

  public popupRef = React.createRef<HTMLDivElement>();

  public alignRef = React.createRef<AlignRefType>();

  private nextFrameState: Partial<PopupState> = null;

  private nextFrameId: number = null;

  static getDerivedStateFromProps(
    { visible, ...props }: PopupProps,
    { prevVisible, status }: PopupState,
  ) {
    const newState: Partial<PopupState> = { prevVisible: visible, status };

    const mergedMotion = getMotion(props);

    if (prevVisible === null && visible === false) {
      // Init render should always be stable
      newState.status = 'stable';
    } else if (visible !== prevVisible) {
      if (
        visible ||
        (supportMotion(mergedMotion) &&
          ['motion', 'AfterMotion', 'stable'].includes(status))
      ) {
        newState.status = null;
      } else {
        newState.status = 'stable';
      }

      if (visible) {
        newState.alignClassName = null;
      }
    }

    return newState;
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { status } = this.state;
    const { getRootDomNode, visible, stretch } = this.props;

    // If there is a pending state update, cancel it, a new one will be set if necessary
    this.cancelFrameState();

    if (visible && status !== 'stable') {
      switch (status) {
        case null: {
          this.setStateOnNextFrame({ status: stretch ? 'measure' : 'align' });
          break;
        }

        case 'afterAlign': {
          this.setStateOnNextFrame({
            status: supportMotion(this.getMotion()) ? 'beforeMotion' : 'stable',
          });
          break;
        }

        case 'AfterMotion': {
          this.setStateOnNextFrame({
            status: 'stable',
          });
          break;
        }

        default: {
          // Go to next status
          const queue: PopupStatus[] = [
            'measure',
            'align',
            null,
            'beforeMotion',
            'motion',
          ];
          const index = queue.indexOf(status);
          const nextStatus = queue[index + 1];
          if (index !== -1 && nextStatus) {
            this.setStateOnNextFrame({ status: nextStatus });
          }
        }
      }
    }

    // Measure stretch size
    if (status === 'measure') {
      const $ele = getRootDomNode();
      if ($ele) {
        this.setStateOnNextFrame({
          targetHeight: $ele.offsetHeight,
          targetWidth: $ele.offsetWidth,
        });
      }
    }
  }

  componentWillUnmount() {
    this.cancelFrameState();
  }

  onAlign = (popupDomNode: HTMLElement, align: AlignType) => {
    const { status } = this.state;
    const { getClassNameFromAlign, onAlign } = this.props;
    const alignClassName = getClassNameFromAlign(align);

    if (status === 'align') {
      this.setState({ alignClassName, status: 'aligned' }, () => {
        this.alignRef.current.forceAlign();
      });
    } else if (status === 'aligned') {
      this.setState({ alignClassName, status: 'afterAlign' });
      onAlign(popupDomNode, align);
    } else {
      this.setState({ alignClassName });
    }
  };

  onMotionEnd = () => {
    const { visible } = this.props;
    this.setState({ status: visible ? 'AfterMotion' : 'stable' });
  };

  setStateOnNextFrame = (state: Partial<PopupState>) => {
    this.cancelFrameState();

    this.nextFrameState = {
      ...this.nextFrameState,
      ...state,
    };

    this.nextFrameId = raf(() => {
      const submitState = { ...this.nextFrameState };
      this.nextFrameState = null;
      this.setState(submitState as PopupState);
    });
  };

  getMotion = () => ({ ...getMotion(this.props) });

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

  cancelFrameState = () => {
    raf.cancel(this.nextFrameId);
  };

  renderPopupElement = () => {
    const { status, targetHeight, targetWidth, alignClassName } = this.state;
    const {
      prefixCls,
      className,
      style,
      stretch,
      visible,
      align,
      destroyPopupOnHide,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
      children,
    } = this.props;

    const mergedClassName = classNames(prefixCls, className, alignClassName);
    const hiddenClassName = `${prefixCls}-hidden`;

    // ================== Style ==================
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
      ...this.getZIndexStyle(),
      ...style,
      opacity: status === 'stable' || !visible ? undefined : 0,
    };

    // ================= Motions =================
    const mergedMotion = this.getMotion();
    let mergedMotionVisible = visible;

    if (
      visible &&
      status !== 'beforeMotion' &&
      status !== 'motion' &&
      status !== 'stable'
    ) {
      mergedMotion.motionAppear = false;
      mergedMotion.motionEnter = false;
      mergedMotion.motionLeave = false;
    }

    if (status === 'afterAlign' || status === 'beforeMotion') {
      mergedMotionVisible = false;
    }

    // ================== Align ==================
    const mergedAlignDisabled =
      !visible ||
      (status !== 'align' && status !== 'aligned' && status !== 'stable');

    // ================== Popup ==================
    let mergedPopupVisible = true;
    if (status === 'stable') {
      mergedPopupVisible = visible;
    }

    // Only remove popup since mask may still need animation
    if (destroyPopupOnHide && !mergedPopupVisible) {
      return null;
    }

    return (
      <CSSMotion
        visible={mergedMotionVisible}
        {...mergedMotion}
        removeOnLeave={false}
        onEnterEnd={this.onMotionEnd}
        onLeaveEnd={this.onMotionEnd}
      >
        {({ style: motionStyle, className: motionClassName }, motionRef) => (
          <Align
            target={this.getAlignTarget()}
            key="popup"
            ref={this.alignRef}
            monitorWindowResize
            disabled={mergedAlignDisabled}
            align={align}
            onAlign={this.onAlign}
          >
            <PopupInner
              prefixCls={prefixCls}
              visible={mergedPopupVisible}
              hiddenClassName={hiddenClassName}
              className={classNames(mergedClassName, motionClassName)}
              ref={composeRef(motionRef, this.popupRef)}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              style={{
                ...mergedStyle,
                ...motionStyle,
              }}
            >
              {children}
            </PopupInner>
          </Align>
        )}
      </CSSMotion>
    );
  };

  renderMaskElement = () => {
    const {
      mask,
      maskMotion,
      maskTransitionName,
      maskAnimation,
      prefixCls,
      visible,
    } = this.props;

    if (!mask) {
      return null;
    }

    let motion: MotionType = {};

    if (maskMotion && maskMotion.motionName) {
      motion = {
        motionAppear: true,
        ...getMotion({
          motion: maskMotion,
          prefixCls,
          transitionName: maskTransitionName,
          animation: maskAnimation,
        }),
      };
    }

    return (
      <CSSMotion {...motion} visible={visible} removeOnLeave>
        {({ className }) => (
          <div
            style={this.getZIndexStyle()}
            key="mask"
            className={classNames(`${prefixCls}-mask`, className)}
          />
        )}
      </CSSMotion>
    );
  };

  render() {
    return (
      <div>
        {this.renderMaskElement()}
        {this.renderPopupElement()}
      </div>
    );
  }
}

export default Popup;
/* eslint-enable */

import * as React from 'react';
import { useRef, useState } from 'react';
import Align from 'rc-align';
import { RefAlign } from 'rc-align/lib/Align';
import CSSMotion, { CSSMotionProps, MotionEndEventHandler } from 'rc-motion';
import classNames from 'classnames';
import {
  Point,
  AlignType,
  StretchType,
  TransitionNameType,
  AnimationType,
} from '../interface';
import useVisibleStatus from './useVisibleStatus';
import { getMotion } from '../utils/legacyUtil';
import useStretchStyle from './useStretchStyle';

export interface PopupInnerProps {
  visible?: boolean;

  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  zIndex?: number;

  // Motion
  motion: CSSMotionProps;
  destroyPopupOnHide?: boolean;
  // Legacy Motion
  animation: AnimationType;
  transitionName: TransitionNameType;

  // Measure
  stretch?: StretchType;

  // Align
  align?: AlignType;
  point?: Point;
  getRootDomNode?: () => HTMLElement;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;

  // Events
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
}

export interface PopupInnerRef {
  forceAlign: () => void;
  getElement: () => HTMLElement;
}

const PopupInner = React.forwardRef<PopupInnerRef, PopupInnerProps>(
  (props, ref) => {
    const {
      visible,

      prefixCls,
      className,
      style,
      children,
      zIndex,

      stretch,
      destroyPopupOnHide,

      align,
      point,
      getRootDomNode,
      getClassNameFromAlign,
      onAlign,

      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onTouchStart,
    } = props;

    const alignRef = useRef<RefAlign>();
    const elementRef = useRef<HTMLDivElement>();

    const [alignedClassName, setAlignedClassName] = useState<string>();

    // ======================= Measure ========================
    const [stretchStyle, measureStretchStyle] = useStretchStyle(stretch);

    function doMeasure() {
      if (stretch) {
        measureStretchStyle(getRootDomNode());
      }
    }

    // ======================== Status ========================
    const [status, goNextStatus] = useVisibleStatus(visible, doMeasure);

    // ======================== Aligns ========================
    const prepareResolveRef = useRef<Function>();

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    function getAlignTarget() {
      if (point) {
        return point;
      }
      return getRootDomNode;
    }

    function forceAlign() {
      alignRef.current?.forceAlign();
    }

    function onInternalAlign(popupDomNode: HTMLElement, matchAlign: AlignType) {
      if (status === 'align') {
        const nextAlignedClassName = getClassNameFromAlign(matchAlign);
        setAlignedClassName(nextAlignedClassName);

        // Repeat until not more align needed
        if (alignedClassName !== nextAlignedClassName) {
          Promise.resolve().then(() => {
            forceAlign();
          });
        } else {
          goNextStatus(() => {
            prepareResolveRef.current?.();
          });
        }

        onAlign?.(popupDomNode, matchAlign);
      }
    }

    // ======================== Motion ========================
    const motion = { ...getMotion(props) };
    ['onAppearEnd', 'onEnterEnd', 'onLeaveEnd'].forEach(eventName => {
      const originHandler: MotionEndEventHandler = motion[eventName];
      motion[eventName] = (element, event) => {
        goNextStatus();
        return originHandler?.(element, event);
      };
    });

    function onShowPrepare() {
      return new Promise(resolve => {
        prepareResolveRef.current = resolve;
      });
    }

    // Go to stable directly when motion not provided
    React.useEffect(() => {
      if (!motion.motionName && status === 'motion') {
        goNextStatus();
      }
    }, [motion.motionName, status]);

    // ========================= Refs =========================
    React.useImperativeHandle(ref, () => ({
      forceAlign,
      getElement: () => elementRef.current,
    }));

    // ======================== Render ========================
    const mergedStyle: React.CSSProperties = {
      ...stretchStyle,
      zIndex,
      ...style,
      opacity: status === 'motion' || status === 'stable' || !visible ? undefined : 0,
      pointerEvents: status === 'stable' ? undefined : 'none',
    };

    // Align status
    let alignDisabled = true;
    if (align?.points && (status === 'align' || status === 'stable')) {
      alignDisabled = false;
    }

    let childNode = children;

    // Wrapper when multiple children
    if (React.Children.count(children) > 1) {
      childNode = <div className={`${prefixCls}-content`}>{children}</div>;
    }

    return (
      <CSSMotion
        visible={visible}
        ref={elementRef}
        {...motion}
        onAppearPrepare={onShowPrepare}
        onEnterPrepare={onShowPrepare}
        removeOnLeave={destroyPopupOnHide}
        leavedClassName={`${prefixCls}-hidden`}
      >
        {({ className: motionClassName, style: motionStyle }, motionRef) => {
          const mergedClassName = classNames(
            prefixCls,
            className,
            alignedClassName,
            motionClassName,
          );

          return (
            <Align
              target={getAlignTarget()}
              key="popup"
              ref={alignRef}
              monitorWindowResize
              disabled={alignDisabled}
              align={align}
              onAlign={onInternalAlign}
            >
              <div
                ref={motionRef}
                className={mergedClassName}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                style={{
                  ...motionStyle,
                  ...mergedStyle,
                }}
              >
                {childNode}
              </div>
            </Align>
          );
        }}
      </CSSMotion>
    );
  },
);

PopupInner.displayName = 'PopupInner';

export default PopupInner;

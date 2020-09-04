import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import Align from 'rc-align';
import { RefAlign } from 'rc-align/lib/Align';
import CSSMotion, { CSSMotionProps } from 'rc-motion';
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

export interface PopupInnerProps {
  visible?: boolean;

  prefixCls: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;

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

    const [targetSize, setTargetSize] = useState({ width: 0, height: 0 });
    const [alignedClassName, setAlignedClassName] = useState<string>();

    // ======================= Measure ========================
    function doMeasure() {
      if (stretch) {
        const $ele = getRootDomNode();
        if ($ele) {
          setTargetSize({
            width: $ele.offsetWidth,
            height: $ele.offsetHeight,
          });
        }
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
    const motion = getMotion(props);

    function onShowPrepare() {
      return new Promise(resolve => {
        prepareResolveRef.current = resolve;
      });
    }

    // ========================= Refs =========================
    React.useImperativeHandle(ref, () => ({
      forceAlign,
      getElement: () => elementRef.current,
    }));

    // ======================== Render ========================
    console.log('>>>>>>', visible, targetSize, motion);

    // Align status
    let alignDisabled = true;
    if (status === 'align') {
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
                  ...style,
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

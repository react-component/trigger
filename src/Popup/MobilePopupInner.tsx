import * as React from 'react';
import CSSMotion from 'rc-motion';
import classNames from 'classnames';
import { PopupInnerProps, PopupInnerRef } from './PopupInner';
import { MobileConfig } from '../interface';

interface MobilePopupInnerProps extends PopupInnerProps {
  mobile?: MobileConfig;
}

const MobilePopupInner = React.forwardRef<PopupInnerRef, MobilePopupInnerProps>(
  (props, ref) => {
    const {
      prefixCls,
      visible,
      zIndex,
      children,
      mobile: {
        popupClassName,
        popupStyle,
        popupMotion = {},
        popupRender,
      } = {},
    } = props;
    const elementRef = React.useRef<HTMLDivElement>();

    // ========================= Refs =========================
    React.useImperativeHandle(ref, () => ({
      forceAlign: () => {},
      getElement: () => elementRef.current,
    }));

    // ======================== Render ========================
    const mergedStyle: React.CSSProperties = {
      zIndex,

      ...popupStyle,
    };

    let childNode = children;

    // Wrapper when multiple children
    if (React.Children.count(children) > 1) {
      childNode = <div className={`${prefixCls}-content`}>{children}</div>;
    }

    // Mobile support additional render
    if (popupRender) {
      childNode = popupRender(childNode);
    }

    return (
      <CSSMotion
        visible={visible}
        ref={elementRef}
        removeOnLeave
        {...popupMotion}
      >
        {({ className: motionClassName, style: motionStyle }, motionRef) => {
          const mergedClassName = classNames(
            prefixCls,
            popupClassName,
            motionClassName,
          );

          return (
            <div
              ref={motionRef}
              className={mergedClassName}
              style={{
                ...motionStyle,
                ...mergedStyle,
              }}
            >
              {childNode}
            </div>
          );
        }}
      </CSSMotion>
    );
  },
);

MobilePopupInner.displayName = 'MobilePopupInner';

export default MobilePopupInner;

import * as React from 'react';
import Portal from '@rc-component/portal';
import TriggerContext, {
  UniqueContext,
  type UniqueContextProps,
  type TriggerContextProps,
  type UniqueShowOptions,
} from '../context';
import useDelay from '../hooks/useDelay';
import useAlign from '../hooks/useAlign';
import Popup from '../Popup';
import { useEvent } from '@rc-component/util';
import useTargetState from './useTargetState';
import { isDOM } from '@rc-component/util/lib/Dom/findDOMNode';
import FloatBg from './FloatBg';
import classNames from 'classnames';
import MotionContent from './MotionContent';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [trigger, open, options, onTargetVisibleChanged] = useTargetState();

  // =========================== Popup ============================
  const [popupEle, setPopupEle] = React.useState<HTMLDivElement>(null);
  const [popupSize, setPopupSize] = React.useState<{
    width: number;
    height: number;
  }>(null);

  // Used for forwardRef popup. Not use internal
  const externalPopupRef = React.useRef<HTMLDivElement>(null);

  const setPopupRef = useEvent((node: HTMLDivElement) => {
    externalPopupRef.current = node;

    if (isDOM(node) && popupEle !== node) {
      setPopupEle(node);
    }
  });

  // ========================== Register ==========================
  const [popupId, setPopupId] = React.useState(0);

  const delayInvoke = useDelay();

  const show = useEvent((showOptions: UniqueShowOptions) => {
    delayInvoke(() => {
      if (showOptions.id !== options?.id) {
        setPopupId((i) => i + 1);
      }
      trigger(showOptions);
    }, showOptions.delay);
  });

  const hide = (delay: number) => {
    delayInvoke(() => {
      trigger(false);
      // Don't clear target, currentNode, options immediately, wait until animation completes
    }, delay);
  };

  // Callback after animation completes
  const onVisibleChanged = useEvent((visible: boolean) => {
    // Call useTargetState callback to handle animation state
    onTargetVisibleChanged(visible);
  });

  // =========================== Align ============================
  const [
    ready,
    offsetX,
    offsetY,
    offsetR,
    offsetB,
    arrowX,
    arrowY, // scaleX - not used in UniqueProvider
    ,
    ,
    // scaleY - not used in UniqueProvider
    alignInfo,
    onAlign,
  ] = useAlign(
    open,
    popupEle,
    options?.target,
    options?.popupPlacement,
    options?.builtinPlacements || {},
    options?.popupAlign,
    undefined, // onPopupAlign
    false, // isMobile
  );

  const contextValue = React.useMemo<UniqueContextProps>(
    () => ({
      show,
      hide,
    }),
    [],
  );

  // =========================== Motion ===========================
  const onPrepare = useEvent(() => {
    onAlign();

    return Promise.resolve();
  });

  // ======================== Trigger Context =====================
  const subPopupElements = React.useRef<Record<string, HTMLElement>>({});
  const parentContext = React.useContext(TriggerContext);

  const triggerContextValue = React.useMemo<TriggerContextProps>(
    () => ({
      registerSubPopup: (id, subPopupEle) => {
        subPopupElements.current[id] = subPopupEle;
        parentContext?.registerSubPopup(id, subPopupEle);
      },
    }),
    [parentContext],
  );

  // =========================== Render ===========================
  const prefixCls = options?.prefixCls;

  return (
    <UniqueContext.Provider value={contextValue}>
      {children}
      {options && (
        <TriggerContext.Provider value={triggerContextValue}>
          <Popup
            ref={setPopupRef}
            portal={Portal}
            prefixCls={prefixCls}
            popup={
              <MotionContent prefixCls={prefixCls} key={popupId}>
                {options.popup}
              </MotionContent>
            }
            className={classNames(
              options.popupClassName,
              `${prefixCls}-unique-controlled`,
            )}
            style={options.popupStyle}
            target={options.target}
            open={open}
            keepDom={true}
            fresh={true}
            autoDestroy={false}
            onVisibleChanged={onVisibleChanged}
            ready={ready}
            offsetX={offsetX}
            offsetY={offsetY}
            offsetR={offsetR}
            offsetB={offsetB}
            onAlign={onAlign}
            onPrepare={onPrepare}
            onResize={(size) =>
              setPopupSize({
                width: size.offsetWidth,
                height: size.offsetHeight,
              })
            }
            arrowPos={{
              x: arrowX,
              y: arrowY,
            }}
            align={alignInfo}
            zIndex={options.zIndex}
            mask={options.mask}
            arrow={options.arrow}
            motion={options.popupMotion}
            maskMotion={options.maskMotion}
            getPopupContainer={options.getPopupContainer}
          >
            <FloatBg
              prefixCls={prefixCls}
              isMobile={false}
              ready={ready}
              open={open}
              align={alignInfo}
              offsetR={offsetR}
              offsetB={offsetB}
              offsetX={offsetX}
              offsetY={offsetY}
              popupSize={popupSize}
              motion={options.popupMotion}
            />
          </Popup>
        </TriggerContext.Provider>
      )}
    </UniqueContext.Provider>
  );
};

export default UniqueProvider;

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

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [open, setOpen] = React.useState(false);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [currentNode, setCurrentNode] = React.useState<React.ReactNode>(null);
  const [options, setOptions] = React.useState<UniqueShowOptions | null>(null);
  const [popupEle, setPopupEle] = React.useState<HTMLDivElement>(null);

  // ========================== Register ==========================
  const delayInvoke = useDelay();

  const show = (showOptions: UniqueShowOptions) => {
    delayInvoke(() => {
      setOpen(true);
      setCurrentNode(showOptions.popup);
      setTarget(showOptions.target);
      setOptions(showOptions);
    }, showOptions.delay);
  };

  const hide = (delay: number) => {
    delayInvoke(() => {
      setOpen(false);
      // 不要立即清空 target, currentNode, options，等动画结束后再清空
    }, delay);
  };

  // 动画完成后的回调
  const onVisibleChanged = useEvent((visible: boolean) => {
    if (!visible) {
      setTarget(null);
      setCurrentNode(null);
      setOptions(null);
    }
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
    target,
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
  return (
    <UniqueContext.Provider value={contextValue}>
      {children}
      {options && (
        <TriggerContext.Provider value={triggerContextValue}>
          <Popup
            ref={setPopupEle}
            portal={Portal}
            prefixCls={options.prefixCls}
            popup={currentNode}
            className={options.popupClassName}
            style={options.popupStyle}
            target={target}
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
            onPrepare={() => Promise.resolve()}
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
          />
        </TriggerContext.Provider>
      )}
    </UniqueContext.Provider>
  );
};

export default UniqueProvider;

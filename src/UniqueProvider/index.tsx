import * as React from 'react';
import Portal from '@rc-component/portal';
import TriggerContext, {
  UniqueContext,
  type UniqueContextProps,
  type TriggerContextProps,
  type UniqueShowOptions,
} from '../context';
import useDelay from '../hooks/useDelay';
import Popup from '../Popup';

export interface UniqueProviderProps {
  children: React.ReactNode;
}

const UniqueProvider = ({ children }: UniqueProviderProps) => {
  const [open, setOpen] = React.useState(false);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [currentNode, setCurrentNode] = React.useState<React.ReactNode>(null);
  const [options, setOptions] = React.useState<UniqueShowOptions | null>(null);

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
    }, delay);
  };

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
            portal={Portal}
            prefixCls={options.prefixCls || 'rc-trigger-popup'}
            popup={currentNode}
            className={options.popupClassName}
            style={options.popupStyle}
            target={target}
            open={open}
            keepDom={false}
            fresh={true}
            onVisibleChanged={() => {}}
            ready={true}
            offsetX={0}
            offsetY={0}
            offsetR={0}
            offsetB={0}
            onAlign={() => {}}
            onPrepare={() => Promise.resolve()}
            arrowPos={{}}
            align={
              options.popupAlign || {
                points: ['tl', 'bl'],
                offset: [0, 4],
              }
            }
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

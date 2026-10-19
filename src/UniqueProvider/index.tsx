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
import { isDOM, useEvent } from '@rc-component/util';
import useTargetState from './useTargetState';
import UniqueContainer from './UniqueContainer';
import { clsx } from 'clsx';
import { getAlignPopupClassName } from '../util';

export interface UniqueProviderProps {
  children: React.ReactNode;
  /** Additional handle options data to do the customize info */
  postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions;
}

const UniqueProvider = ({
  children,
  postTriggerProps,
}: UniqueProviderProps) => {
  const [trigger, open, options, onTargetVisibleChanged, releaseTarget] =
    useTargetState();

  // ========================== Options ===========================
  const mergedOptions = React.useMemo(() => {
    if (!options || !postTriggerProps) {
      return options;
    }

    return postTriggerProps(options);
  }, [options, postTriggerProps]);

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
  const ownerRef = React.useRef<string | null>(null);
  const delayedOwnerRef = React.useRef<string | null>(null);
  const isOpenRef = React.useRef(new Map<string, () => boolean>());

  const delayInvoke = useDelay();

  const show = useEvent(
    (showOptions: UniqueShowOptions, isOpen: () => boolean) => {
      ownerRef.current = showOptions.id;
      isOpenRef.current.set(showOptions.id, isOpen);

      delayedOwnerRef.current = showOptions.id;
      delayInvoke(() => {
        delayedOwnerRef.current = null;
        trigger(showOptions);
      }, showOptions.delay);
    },
  );

  const hide = useEvent((id: string, delay: number) => {
    if (ownerRef.current !== id) {
      return;
    }

    delayedOwnerRef.current = id;
    delayInvoke(() => {
      delayedOwnerRef.current = null;
      // A controlled owner may still need to keep its popup open.
      if (ownerRef.current !== id || isOpenRef.current.get(id)?.()) {
        return;
      }

      trigger(false);
      // Don't clear target, currentNode, options immediately, wait until animation completes
    }, delay);
  });

  const release = useEvent((id: string) => {
    // Another owner may already have a show or hide scheduled.
    if (delayedOwnerRef.current === id) {
      delayInvoke(() => {}, 0);
      delayedOwnerRef.current = null;
    }
    isOpenRef.current.delete(id);
    const remainingOwner = releaseTarget(id);
    if (ownerRef.current === id) {
      ownerRef.current = remainingOwner ?? null;
    }
  });

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
    mergedOptions?.target,
    mergedOptions?.popupPlacement,
    mergedOptions?.builtinPlacements || {},
    mergedOptions?.popupAlign,
    undefined, // onPopupAlign
    false, // isMobile
  );

  const alignedClassName = React.useMemo(() => {
    if (!mergedOptions) {
      return '';
    }

    const baseClassName = getAlignPopupClassName(
      mergedOptions.builtinPlacements || {},
      mergedOptions.prefixCls || '',
      alignInfo,
      false, // alignPoint is false for UniqueProvider
    );

    return clsx(
      baseClassName,
      mergedOptions.getPopupClassNameFromAlign?.(alignInfo),
    );
  }, [
    alignInfo,
    mergedOptions?.getPopupClassNameFromAlign,
    mergedOptions?.builtinPlacements,
    mergedOptions?.prefixCls,
  ]);

  const contextValue = React.useMemo<UniqueContextProps>(
    () => ({
      show,
      hide,
      release,
    }),
    [show, hide, release],
  );

  // =========================== Align ============================
  React.useEffect(() => {
    onAlign();
  }, [mergedOptions?.target]);

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
  const prefixCls = mergedOptions?.prefixCls;

  return (
    <UniqueContext.Provider value={contextValue}>
      {children}
      {mergedOptions && (
        <TriggerContext.Provider value={triggerContextValue}>
          <Popup
            ref={setPopupRef}
            portal={Portal}
            onEsc={mergedOptions.onEsc}
            prefixCls={prefixCls}
            popup={mergedOptions.popup}
            className={clsx(
              mergedOptions.popupClassName,
              alignedClassName,
              `${prefixCls}-unique-controlled`,
            )}
            style={mergedOptions.popupStyle}
            target={mergedOptions.target}
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
            zIndex={mergedOptions.zIndex}
            mask={mergedOptions.mask}
            arrow={mergedOptions.arrow}
            motion={mergedOptions.popupMotion}
            maskMotion={mergedOptions.maskMotion}
            getPopupContainer={mergedOptions.getPopupContainer}
          >
            <UniqueContainer
              prefixCls={prefixCls}
              isMobile={false}
              ready={ready}
              open={open}
              align={alignInfo}
              offsetR={offsetR}
              offsetB={offsetB}
              offsetX={offsetX}
              offsetY={offsetY}
              arrowPos={{
                x: arrowX,
                y: arrowY,
              }}
              popupSize={popupSize}
              motion={mergedOptions.popupMotion}
              uniqueContainerClassName={clsx(
                mergedOptions.uniqueContainerClassName,
                alignedClassName,
              )}
              uniqueContainerStyle={mergedOptions.uniqueContainerStyle}
            />
          </Popup>
        </TriggerContext.Provider>
      )}
    </UniqueContext.Provider>
  );
};

export default UniqueProvider;

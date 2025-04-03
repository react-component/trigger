import * as React from 'react';
import type { ActionType } from '../interface';

type InternalActionType = ActionType | 'touch';

type ActionTypes = InternalActionType | InternalActionType[];

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

export default function useAction(
  action: ActionTypes,
  showAction?: ActionTypes,
  hideAction?: ActionTypes,
): [showAction: Set<InternalActionType>, hideAction: Set<InternalActionType>] {
  return React.useMemo(() => {
    const mergedShowAction = toArray(showAction ?? action);
    const mergedHideAction = toArray(hideAction ?? action);

    const showActionSet = new Set(mergedShowAction);
    const hideActionSet = new Set(mergedHideAction);

    if (showActionSet.has('hover') && !showActionSet.has('click')) {
      showActionSet.add('touch');
    }

    if (hideActionSet.has('hover') && !hideActionSet.has('click')) {
      hideActionSet.add('touch');
    }

    return [showActionSet, hideActionSet];
  }, [action, showAction, hideAction]);
}

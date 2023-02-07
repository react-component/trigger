import type { ActionType } from '../interface';

type ActionTypes = ActionType | ActionType[];

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

export default function useAction(
  action: ActionTypes,
  showAction?: ActionTypes,
  hideAction?: ActionTypes,
): [showAction: Set<ActionType>, hideAction: Set<ActionType>] {
  const mergedShowAction = toArray(showAction ?? action);
  const mergedHideAction = toArray(hideAction ?? action);

  return [new Set(mergedShowAction), new Set(mergedHideAction)];
}

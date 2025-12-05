import useEvent from '@rc-component/util/lib/hooks/useEvent';
import * as React from 'react';
import { getWin } from '../util';

interface EscEntry {
  id: string;
  win: Window;
  triggerOpen: (open: boolean) => void;
}

const stackMap = new Map<Window, EscEntry[]>();
const handlerMap = new Map<Window, (event: KeyboardEvent) => void>();

function addEscListener(win: Window) {
  if (handlerMap.has(win)) {
    return;
  }

  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    const stack = stackMap.get(win);

    const top = stack[stack.length - 1];
    top.triggerOpen(false);
  };

  win.addEventListener('keydown', handler);
  handlerMap.set(win, handler);
}

function removeEscListener(win: Window) {
  const handler = handlerMap.get(win);
  win.removeEventListener('keydown', handler);
  handlerMap.delete(win);
}

function unregisterEscEntry(id: string, win: Window) {
  const stack = stackMap.get(win);
  if (!stack) {
    return;
  }

  const next = stack.filter((item) => item.id !== id);

  if (next.length) {
    stackMap.set(win, next);
  } else {
    stackMap.delete(win);
    removeEscListener(win);
  }
}

function registerEscEntry(entry: EscEntry) {
  const { win, id } = entry;
  const prev = stackMap.get(win) || [];
  const next = prev.filter((item) => item.id !== id);
  next.push(entry);
  stackMap.set(win, next);
  addEscListener(win);
}

export default function useEscKeyDown(
  popupId: string,
  open: boolean,
  popupEle: HTMLElement,
  triggerOpen: (open: boolean) => void,
) {
  const memoTriggerOpen = useEvent((nextOpen: boolean) => {
    triggerOpen(nextOpen);
  });

  React.useEffect(() => {
    if (!popupId || !open || !popupEle) {
      return;
    }

    const win = getWin(popupEle);
    registerEscEntry({
      id: popupId,
      win,
      triggerOpen: memoTriggerOpen,
    });

    return () => unregisterEscEntry(popupId, win);
  }, [popupId, open, popupEle, memoTriggerOpen]);
}

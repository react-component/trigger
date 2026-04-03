import type * as React from 'react';

const TABBABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isTabbable(el: HTMLElement, win: Window): boolean {
  if (el.closest('[aria-hidden="true"]')) {
    return false;
  }
  if ('disabled' in el && (el as HTMLButtonElement).disabled) {
    return false;
  }
  if (el instanceof HTMLInputElement && el.type === 'hidden') {
    return false;
  }
  const ti = el.getAttribute('tabindex');
  if (ti !== null && Number(ti) < 0) {
    return false;
  }
  const style = win.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return true;
}

/** Visible, tabbable descendants inside `container` (in DOM order). */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const doc = container.ownerDocument;
  const win = doc.defaultView!;
  const nodeList = container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
  const list: HTMLElement[] = [];
  for (let i = 0; i < nodeList.length; i += 1) {
    const el = nodeList[i];
    if (isTabbable(el, win)) {
      list.push(el);
    }
  }
  return list;
}

export function focusPopupRootOrFirst(
  container: HTMLElement,
): HTMLElement | null {
  const tabbables = getTabbableElements(container);
  if (tabbables.length) {
    tabbables[0].focus();
    return tabbables[0];
  }
  if (!container.hasAttribute('tabindex')) {
    container.setAttribute('tabindex', '-1');
  }
  container.focus();
  return container;
}

export function handlePopupTabTrap(
  e: React.KeyboardEvent,
  container: HTMLElement,
): void {
  if (e.key !== 'Tab' || e.defaultPrevented) {
    return;
  }

  const list = getTabbableElements(container);
  const active = document.activeElement as HTMLElement | null;

  if (!active || !container.contains(active)) {
    return;
  }

  if (list.length === 0) {
    if (active === container) {
      e.preventDefault();
    }
    return;
  }

  const first = list[0];
  const last = list[list.length - 1];

  if (!e.shiftKey) {
    if (active === last || active === container) {
      e.preventDefault();
      first.focus();
    }
  } else if (active === first || active === container) {
    e.preventDefault();
    last.focus();
  }
}

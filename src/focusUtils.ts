import type * as React from 'react';

const TABBABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex^="-"])';

/**
 * Subtree cannot contain tab stops the browser will use.
 * @see https://github.com/KittyGiraudel/a11y-dialog/blob/4674ff3e4d626430a028a64969328e339c533ce8/src/dom-utils.ts
 */
function canHaveTabbableChildren(el: HTMLElement): boolean {
  if (el.shadowRoot && el.getAttribute('tabindex') === '-1') {
    return false;
  }
  return !el.matches(':disabled, [hidden], [inert]');
}

function isNonVisibleForInteraction(el: HTMLElement): boolean {
  if (
    el.matches('details:not([open]) *') &&
    !el.matches('details > summary:first-of-type')
  ) {
    return true;
  }
  return !(
    el.offsetWidth ||
    el.offsetHeight ||
    el.getClientRects().length
  );
}

function isTabbable(el: HTMLElement, win: Window): boolean {
  if (el.shadowRoot?.delegatesFocus) {
    return false;
  }
  if (!el.matches(TABBABLE_SELECTOR)) {
    return false;
  }
  if (isNonVisibleForInteraction(el)) {
    return false;
  }
  if (el.closest('[aria-hidden="true"]') || el.closest('[inert]')) {
    return false;
  }
  if ('disabled' in el && (el as HTMLButtonElement).disabled) {
    return false;
  }
  if (el instanceof HTMLInputElement && el.type === 'hidden') {
    return false;
  }
  const style = win.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return true;
}

function getNextChildEl(parent: ParentNode, forward: boolean): Element | null {
  return forward ? parent.firstElementChild : parent.lastElementChild;
}

function getNextSiblingEl(el: Element, forward: boolean): Element | null {
  return forward ? el.nextElementSibling : el.previousElementSibling;
}

/**
 * First or last tabbable descendant in tree order (light DOM, shadow roots, slots).
 * @see https://github.com/KittyGiraudel/a11y-dialog/blob/4674ff3e4d626430a028a64969328e339c533ce8/src/dom-utils.ts
 */
function findTabbableEl(
  el: HTMLElement,
  forward: boolean,
  win: Window,
): HTMLElement | null {
  if (forward && isTabbable(el, win)) {
    return el;
  }

  if (canHaveTabbableChildren(el)) {
    if (el.shadowRoot) {
      let next = getNextChildEl(el.shadowRoot, forward);
      while (next) {
        const hit = findTabbableEl(next as HTMLElement, forward, win);
        if (hit) {
          return hit;
        }
        next = getNextSiblingEl(next, forward);
      }
    } else if (el.localName === 'slot') {
      const assigned = (el as HTMLSlotElement).assignedElements({
        flatten: true,
      }) as HTMLElement[];
      const ordered = forward ? assigned : [...assigned].reverse();
      for (let i = 0; i < ordered.length; i += 1) {
        const hit = findTabbableEl(ordered[i], forward, win);
        if (hit) {
          return hit;
        }
      }
    } else {
      let next = getNextChildEl(el, forward);
      while (next) {
        const hit = findTabbableEl(next as HTMLElement, forward, win);
        if (hit) {
          return hit;
        }
        next = getNextSiblingEl(next, forward);
      }
    }
  }

  if (!forward && isTabbable(el, win)) {
    return el;
  }

  return null;
}

/** First and last tabbable nodes inside `container` (inclusive). `last === first` if only one. */
export function getTabbableEdges(
  container: HTMLElement,
): readonly [HTMLElement | null, HTMLElement | null] {
  const win = container.ownerDocument.defaultView!;
  const first = findTabbableEl(container, true, win);
  const last = first
    ? findTabbableEl(container, false, win) || first
    : null;
  return [first, last] as const;
}

export function focusPopupRootOrFirst(
  container: HTMLElement,
): HTMLElement | null {
  const [first] = getTabbableEdges(container);
  if (first) {
    first.focus();
    return first;
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

  const [first, last] = getTabbableEdges(container);
  const active = document.activeElement as HTMLElement | null;

  if (!active || !container.contains(active)) {
    return;
  }

  if (!first || !last) {
    if (active === container) {
      e.preventDefault();
    }
    return;
  }

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

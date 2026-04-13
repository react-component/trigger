import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import * as React from 'react';
import {
  focusPopupRootOrFirst,
  getTabbableEdges,
  handlePopupTabTrap,
} from '../src/focusUtils';

describe('focusUtils', () => {
  let eleRect = { width: 100, height: 100 };

  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      offsetWidth: { get: () => eleRect.width },
      offsetHeight: { get: () => eleRect.height },
      offsetParent: { get: () => document.body },
    });
    spyElementPrototypes(HTMLButtonElement, {
      offsetWidth: { get: () => eleRect.width },
      offsetHeight: { get: () => eleRect.height },
      offsetParent: { get: () => document.body },
    });
  });

  beforeEach(() => {
    eleRect = { width: 100, height: 100 };
  });

  function mount(el: HTMLElement) {
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }

  it('getTabbableEdges returns nulls when there are no tabbables', () => {
    const el = document.createElement('div');
    expect(getTabbableEdges(el)).toEqual([null, null]);
  });

  it('getTabbableEdges returns first and last for multiple buttons', () => {
    const el = document.createElement('div');
    el.innerHTML =
      '<button type="button" id="a">a</button><button type="button" id="b">b</button>';
    const unmount = mount(el);
    const [first, last] = getTabbableEdges(el);
    expect(first?.id).toBe('a');
    expect(last?.id).toBe('b');
    unmount();
  });

  it('getTabbableEdges uses one node for first and last when only one tabbable', () => {
    const el = document.createElement('div');
    el.innerHTML = '<button type="button" id="only">x</button>';
    const unmount = mount(el);
    const [first, last] = getTabbableEdges(el);
    expect(first).toBe(last);
    expect(first?.id).toBe('only');
    unmount();
  });

  it('focusPopupRootOrFirst focuses container when there are no tabbables', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const result = focusPopupRootOrFirst(el);
    expect(result).toBe(el);
    expect(document.activeElement).toBe(el);
    expect(el.getAttribute('tabindex')).toBe('-1');
    document.body.removeChild(el);
  });

  it('findTabbableEl walks into open shadow roots', () => {
    const host = document.createElement('div');
    const unmount = mount(host);
    const shadow = host.attachShadow({ mode: 'open', delegatesFocus: false });
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'in-shadow';
    shadow.appendChild(btn);

    const [first] = getTabbableEdges(host);
    expect(first?.id).toBe('in-shadow');

    unmount();
  });

  it('skips shadow host subtree when host has tabindex -1', () => {
    const host = document.createElement('div');
    host.setAttribute('tabindex', '-1');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'skipped';
    shadow.appendChild(btn);

    const [first] = getTabbableEdges(host);
    expect(first).toBeNull();

    document.body.removeChild(host);
  });

  it('findTabbableEl walks slotted light-DOM content', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const slot = document.createElement('slot');
    slot.setAttribute('name', 's');
    shadow.appendChild(slot);

    const slotted = document.createElement('button');
    slotted.type = 'button';
    slotted.id = 'slotted';
    slotted.setAttribute('slot', 's');
    host.appendChild(slotted);

    const unmount = mount(host);
    const [first] = getTabbableEdges(host);
    expect(first?.id).toBe('slotted');

    unmount();
  });

  it('handlePopupTabTrap ignores non-Tab keys', () => {
    const el = document.createElement('div');
    el.innerHTML = '<button type="button">a</button>';
    const unmount = mount(el);
    const btn = el.querySelector('button')!;
    btn.focus();

    const ev = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = jest.spyOn(ev, 'preventDefault');
    handlePopupTabTrap(ev as unknown as React.KeyboardEvent, el);

    expect(preventDefault).not.toHaveBeenCalled();
    unmount();
  });

  it('handlePopupTabTrap respects defaultPrevented', () => {
    const el = document.createElement('div');
    el.innerHTML = '<button type="button">a</button><button type="button">b</button>';
    const unmount = mount(el);
    el.querySelectorAll('button')[1].focus();

    const ev = {
      key: 'Tab',
      shiftKey: false,
      defaultPrevented: true,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;
    handlePopupTabTrap(ev, el);
    expect(ev.preventDefault).not.toHaveBeenCalled();

    unmount();
  });

  it('handlePopupTabTrap does nothing when activeElement is outside container', () => {
    const outer = document.createElement('button');
    outer.type = 'button';
    outer.id = 'outer';
    const inner = document.createElement('div');
    inner.innerHTML = '<button type="button">a</button>';
    document.body.appendChild(outer);
    document.body.appendChild(inner);
    outer.focus();

    const ev = {
      key: 'Tab',
      shiftKey: false,
      defaultPrevented: false,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;
    handlePopupTabTrap(ev, inner);

    expect(ev.preventDefault).not.toHaveBeenCalled();
    document.body.removeChild(outer);
    document.body.removeChild(inner);
  });

  it('handlePopupTabTrap prevents default when no tabbables and focus on container', () => {
    const el = document.createElement('div');
    el.setAttribute('tabindex', '-1');
    const unmount = mount(el);
    el.focus();

    const ev = {
      key: 'Tab',
      shiftKey: false,
      defaultPrevented: false,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;
    handlePopupTabTrap(ev, el);

    expect(ev.preventDefault).toHaveBeenCalled();
    unmount();
  });

  it('handlePopupTabTrap moves focus from first to last with Shift+Tab', () => {
    const el = document.createElement('div');
    el.innerHTML =
      '<button type="button" id="x">a</button><button type="button" id="y">b</button>';
    const unmount = mount(el);
    el.querySelector('#x')!.focus();

    const ev = {
      key: 'Tab',
      shiftKey: true,
      defaultPrevented: false,
      preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent;
    handlePopupTabTrap(ev, el);

    expect(ev.preventDefault).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('y');

    unmount();
  });

  it('skips disabled buttons and hidden inputs', () => {
    const el = document.createElement('div');
    el.innerHTML =
      '<button type="button" disabled id="d">d</button><input type="hidden" /><button type="button" id="ok">ok</button>';
    const unmount = mount(el);
    const [first] = getTabbableEdges(el);
    expect(first?.id).toBe('ok');
    unmount();
  });

  it('skips elements inside closed details (except summary)', () => {
    const el = document.createElement('div');
    el.innerHTML =
      '<details><summary>s</summary><button type="button" id="hidden">h</button></details><button type="button" id="ok">ok</button>';
    const unmount = mount(el);
    const [first] = getTabbableEdges(el);
    expect(first).toBeTruthy();
    expect(first?.id).not.toBe('hidden');
    unmount();
  });
});

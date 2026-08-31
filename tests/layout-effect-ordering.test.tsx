/**
 * Regression coverage for the layout-effect ordering gap flagged in the
 * #622 review by @nrps9909.
 *
 * The dedup baseline (`lastDispatchedOpenRef`) used to be synchronized inside
 * Trigger's own `useLayoutEffect([rawOpen])`. React runs descendant layout
 * effects *before* their parent's, so during a render that flipped
 * `popupVisible` a descendant `useLayoutEffect` could reach
 * `internalTriggerOpen` while the ref still held the previous, stale value —
 * a legitimate opposite dispatch would then be discarded as a duplicate and
 * `onOpenChange` would never fire.
 *
 * The fix synchronizes the ref during render, so descendant layout effects
 * see the up-to-date baseline.
 *
 * Concrete scenario from the review:
 *
 * 1. Render a controlled `<Trigger hideAction={['focus']} popupVisible={false}>`
 *    and focus the target.
 * 2. Rerender with `popupVisible={true}`.
 * 3. In the target component's `useLayoutEffect([open])`, call `target.blur()`.
 * 4. Assert focus actually left the target *and* `onOpenChange(false)` fired
 *    exactly once.
 *
 * Before the fix: focus leaves but the callback count is 0.
 * After the fix: the callback fires once.
 */
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import * as React from 'react';
import Trigger from '../src';

const flush = async () => {
  for (let i = 0; i < 10; i += 1) {
    act(() => {
      jest.runAllTimers();
    });
    await act(async () => {
      await Promise.resolve();
    });
  }
};

describe('Trigger.LayoutEffectOrdering (#622 review)', () => {
  let eleRect = { width: 100, height: 100 };
  let spanRect = { x: 0, y: 0, left: 0, top: 0, width: 1, height: 1 };
  let popupRect = { x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 };

  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      clientWidth: { get: () => eleRect.width },
      clientHeight: { get: () => eleRect.height },
      offsetWidth: { get: () => eleRect.width },
      offsetHeight: { get: () => eleRect.height },
      offsetParent: { get: () => document.body },
    });
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect() {
        return popupRect;
      },
    });
    spyElementPrototypes(HTMLSpanElement, {
      getBoundingClientRect() {
        return spanRect;
      },
    });
  });

  beforeEach(() => {
    eleRect = { width: 100, height: 100 };
    spanRect = { x: 0, y: 0, left: 0, top: 0, width: 1, height: 1 };
    popupRect = { x: 0, y: 0, left: 0, top: 0, width: 100, height: 100 };
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('accepts an opposite dispatch from a descendant layout effect after the parent commits a controlled open change', async () => {
    const onOpenChange = jest.fn();

    // Target that runs a layout effect on every `open` transition. When
    // `open` becomes true it blurs itself synchronously — this executes
    // *before* Trigger's own layout effects on the same commit, which is
    // exactly the ordering window the original PR head mishandled.
    // We fire a real blur event on the DOM node (not just `HTMLElement.blur()`)
    // to ensure Trigger's `onBlur` handler runs under jsdom.
    const Target = React.forwardRef<
      HTMLSpanElement,
      { open: boolean } & React.HTMLAttributes<HTMLSpanElement>
    >(({ open, ...rest }, forwardedRef) => {
      const localRef = React.useRef<HTMLSpanElement>(null);
      React.useImperativeHandle(forwardedRef, () => localRef.current!);
      React.useLayoutEffect(() => {
        if (open && localRef.current) {
          fireEvent.blur(localRef.current);
        }
      }, [open]);
      // Forward any Trigger-injected handlers (onFocus/onBlur/etc.) onto
      // the underlying span; without this, Trigger's `onBlur` never fires
      // and the ordering gap can't be exercised.
      return <span {...rest} className="target" ref={localRef} tabIndex={0} />;
    });

    const Harness: React.FC<{ open: boolean }> = ({ open }) => (
      <Trigger
        action={[]}
        hideAction={['focus']}
        popup={<strong>popup</strong>}
        popupVisible={open}
        onOpenChange={onOpenChange}
      >
        <Target open={open} />
      </Trigger>
    );

    const { container, rerender } = render(<Harness open={false} />);
    const target = container.querySelector('.target') as HTMLSpanElement;

    act(() => {
      fireEvent.focus(target);
    });
    await flush();

    onOpenChange.mockClear();

    // Parent commits false -> true. The descendant layout effect fires blur
    // *during that commit*, before Trigger's own effects could have synced
    // the dedup ref. With the render-body sync, Trigger sees the up-to-date
    // baseline (`rawOpen === true`) and treats the blur-driven dispatch as
    // a real transition to false.
    act(() => {
      rerender(<Harness open />);
    });
    await flush();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

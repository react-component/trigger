/**
 * Regression coverage for the concurrent-render blocker flagged in the second
 * review round of #622 by @nrps9909.
 *
 * The specific scenario:
 *
 *   1. A controlled Trigger is committed with `popupVisible={false}`.
 *   2. A `startTransition` attempts to move to `popupVisible={true}`, but a
 *      child of the Trigger suspends. React holds the previously committed
 *      UI while the transition is pending — the original target stays in
 *      the DOM and remains the one wired to Trigger's `onFocus`/`onBlur`.
 *   3. Focusing that still-committed original target should emit
 *      `onOpenChange(true)` exactly once.
 *
 * A previous revision of the fix synchronized the dedup baseline in the
 * render body:
 *
 *   if (lastDispatchedOpenRef.current !== rawOpen) {
 *     lastDispatchedOpenRef.current = rawOpen;
 *   }
 *
 * That write happens even in the *speculative* render for the suspended
 * transition, and React does not roll back ref writes when a render is
 * discarded. The ref then holds `true` (from the speculative rawOpen),
 * so when the user focuses the still-committed target the dedup check
 * treats the dispatch as a duplicate and drops it — 0 callbacks instead
 * of 1.
 *
 * The current revision moves the ref reset into `React.useEffect` and
 * never writes the ref during render. `useEffect` runs only for
 * committed renders, so a discarded suspended transition cannot pollute
 * the baseline. This test asserts the one-callback behaviour and fails
 * against a render-body-sync revision (0 callbacks).
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

describe('Trigger.ConcurrentRender (#622 review)', () => {
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

  it('a suspended transition attempting popupVisible=false→true does not corrupt the dedup baseline; focusing the still-committed target emits exactly one onOpenChange(true)', async () => {
    const onOpenChange = jest.fn();

    // A never-resolving promise, so a `startTransition` that reaches this
    // component stays pending indefinitely and React keeps the previous
    // commit on screen.
    const suspender: Promise<void> = new Promise(() => {});

    // A child that either renders a Trigger-wired target (attempt=false)
    // or throws the suspender (attempt=true). Forwards Trigger's injected
    // DOM handlers onto the target span so `onFocus`/`onBlur` reach the
    // Trigger's own action wiring.
    const Child = React.forwardRef<
      HTMLSpanElement,
      { attempt: boolean } & React.HTMLAttributes<HTMLSpanElement>
    >(({ attempt, ...rest }, ref) => {
      if (attempt) {
        throw suspender;
      }
      return <span ref={ref} className="target" tabIndex={0} {...rest} />;
    });

    const Harness: React.FC<{ open: boolean; attempt: boolean }> = ({
      open,
      attempt,
    }) => (
      <React.Suspense fallback={<span className="fallback" tabIndex={0} />}>
        <Trigger
          action={['focus']}
          popup={<strong>popup</strong>}
          popupVisible={open}
          onOpenChange={onOpenChange}
        >
          <Child attempt={attempt} />
        </Trigger>
      </React.Suspense>
    );

    // Commit the initial state: closed, no throw. The committed target is
    // what all subsequent focus events must land on.
    const { container, rerender } = render(<Harness open={false} attempt={false} />);
    await flush();

    const committedTarget = container.querySelector('.target') as HTMLSpanElement;
    expect(committedTarget).toBeTruthy();

    // Attempt the transition: popupVisible=false → true, but the child
    // throws the never-resolving suspender. Wrapping in `startTransition`
    // tells React to keep the previous UI committed while this attempt
    // pends. On a render-body-sync revision the speculative render would
    // have written `true` to the dedup ref before suspending.
    act(() => {
      React.startTransition(() => {
        rerender(<Harness open attempt />);
      });
    });
    await flush();

    // The originally committed target must still be in the DOM; the
    // Suspense fallback should not have taken over because the transition
    // is pending.
    const stillCommitted = container.querySelector('.target') as HTMLSpanElement;
    expect(stillCommitted).toBe(committedTarget);
    expect(container.querySelector('.fallback')).toBeNull();

    onOpenChange.mockClear();

    // Focus the still-committed target. `action=['focus']` routes this to
    // Trigger's `internalTriggerOpen(true)`. On the current fix the dedup
    // ref was never written (useEffect only runs for committed renders,
    // and the speculative render's render body never touched the ref), so
    // this dispatch goes through cleanly.
    act(() => {
      fireEvent.focus(committedTarget);
    });
    await flush();

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });
});

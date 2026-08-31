/**
 * Regression coverage for https://github.com/ant-design/ant-design/issues/57789
 *
 * Trigger used to wrap `setInternalOpen` / `onOpenChange` in `flushSync` for
 * synchronous-call dedup (introduced in #601). React 19 warns
 *
 *   `flushSync was called from inside a lifecycle method. React cannot flush
 *    when React is already rendering.`
 *
 * whenever `internalTriggerOpen` is reached from inside a render/commit phase
 * — e.g. clicking a button wrapped by `<Tooltip trigger="focus">` that also
 * opens a Modal: the click handler updates Modal state (entering React's
 * render phase), the focus event in the same batch routes into Trigger's
 * `internalTriggerOpen`, and `flushSync` then fires inside the render.
 *
 * This test pins the fix: opening a Trigger while React is mid-commit must
 * not emit the warning.
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

describe('Trigger.NoFlushSyncWarning', () => {
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

  it('does not emit a flushSync warning when open is triggered from inside a render/commit', async () => {
    // Spy console.error so we can fail the test on the React 19 flushSync warning.
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Sibling whose commit cycle "owns" the render: when its `count` state
    // increases it re-renders, and within that commit we synchronously fire a
    // focus event on the Trigger target. That mirrors the Modal+Tooltip case
    // in #57789 where focus handling lands inside React's render phase.
    const Reproducer: React.FC = () => {
      const targetRef = React.useRef<HTMLSpanElement>(null);
      const [count, setCount] = React.useState(0);

      React.useEffect(() => {
        if (count === 1 && targetRef.current) {
          // Synchronously focus the trigger target while we are still inside
          // an effect that ran during commit.
          targetRef.current.focus();
        }
      }, [count]);

      return (
        <>
          <button
            type="button"
            className="opener"
            onClick={() => setCount((c) => c + 1)}
          >
            open
          </button>
          <Trigger action={['focus']} popup={<strong>popup</strong>}>
            <span className="target" ref={targetRef} tabIndex={0} />
          </Trigger>
        </>
      );
    };

    const { container } = render(<Reproducer />);

    act(() => {
      fireEvent.click(container.querySelector('.opener') as HTMLButtonElement);
    });

    await flush();

    const flushSyncWarnings = errorSpy.mock.calls.filter((call) =>
      String(call[0]).includes('flushSync was called from inside a lifecycle'),
    );
    expect(flushSyncWarnings).toEqual([]);

    errorSpy.mockRestore();
  });

  it('does not import flushSync from react-dom (structural guard)', () => {
    // Soft guard: if anyone re-introduces flushSync in src/index.tsx the
    // structural intent of this fix should be reviewed alongside #57789.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../src/index.tsx'),
      'utf8',
    );
    // Strip block + line comments so the explanatory comment that *mentions*
    // flushSync doesn't trip the guard.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(code).not.toMatch(/from\s+['"]react-dom['"]/);
    expect(code).not.toMatch(/\bflushSync\s*\(/);
  });
});

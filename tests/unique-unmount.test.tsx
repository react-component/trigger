import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Trigger, { UniqueProvider } from '../src';
import type { TriggerProps } from '../src';
import { awaitFakeTimer } from './util';

// The util hook returns the same snapshot ID for every trigger in tests.
jest.mock('@rc-component/util', () => ({
  ...jest.requireActual('@rc-component/util'),
  useId: () => jest.requireActual('react').useId(),
}));

function expectPopup(text: string | null) {
  const popup = document.querySelector(
    '.rc-trigger-popup:not(.rc-trigger-popup-hidden)',
  );
  if (text === null) {
    expect(popup).toBeNull();
  } else {
    expect(popup?.textContent).toBe(text);
  }
}

interface PairProps {
  showA?: boolean;
  showB?: boolean;
  delayB?: number;
  motion?: TriggerProps['popupMotion'];
}

function Pair({ showA = true, showB = true, delayB = 0, motion }: PairProps) {
  return (
    <UniqueProvider>
      {showA && (
        <Trigger
          unique
          action={['hover']}
          popup={<div>Popup A</div>}
          popupMotion={motion}
        >
          <button type="button">A</button>
        </Trigger>
      )}
      {showB && (
        <Trigger
          unique
          action={['hover']}
          mouseEnterDelay={delayB}
          popup={<div>Popup B</div>}
          popupMotion={motion}
        >
          <button type="button">B</button>
        </Trigger>
      )}
    </UniqueProvider>
  );
}

describe('unique popup owner unmount', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it.each([false, true])(
    'closes on owner unmount (unique=%s)',
    async (unique) => {
      const Demo = ({ show }: { show: boolean }) => (
        <UniqueProvider>
          {show && (
            <Trigger
              unique={unique}
              action={['hover']}
              popup={<div>Popup A</div>}
            >
              <button type="button">A</button>
            </Trigger>
          )}
        </UniqueProvider>
      );
      const { getByRole, queryByRole, rerender } = render(<Demo show />);
      fireEvent.mouseEnter(getByRole('button'));
      await awaitFakeTimer();
      expectPopup('Popup A');
      rerender(<Demo show={false} />);
      await awaitFakeTimer();
      expect(queryByRole('button')).toBeNull();
      expectPopup(null);
    },
  );

  it.each([false, true])(
    'releases a controlled owner under StrictMode=%s',
    async (strict) => {
      const onOpenChange = jest.fn();
      const Demo = ({ show }: { show: boolean }) => (
        <UniqueProvider>
          {show && (
            <Trigger
              unique
              popupVisible
              onOpenChange={onOpenChange}
              popup={<div>Popup A</div>}
            >
              <button type="button">A</button>
            </Trigger>
          )}
        </UniqueProvider>
      );
      const wrap = (show: boolean) =>
        strict ? (
          <React.StrictMode>
            <Demo show={show} />
          </React.StrictMode>
        ) : (
          <Demo show={show} />
        );
      const { rerender } = render(wrap(true));
      await awaitFakeTimer();
      expectPopup('Popup A');
      rerender(wrap(false));
      await awaitFakeTimer();
      expectPopup(null);
      expect(onOpenChange).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])(
    'keeps B open when inactive A unmounts (previously open=%s)',
    async (previouslyOpen) => {
      const { getByRole, rerender } = render(<Pair />);
      if (previouslyOpen) {
        fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
        await awaitFakeTimer();
        expectPopup('Popup A');
      }
      fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
      await awaitFakeTimer();
      expectPopup('Popup B');
      rerender(<Pair showA={false} />);
      await awaitFakeTimer();
      expectPopup('Popup B');
    },
  );

  it('cancels a pending show when its owner unmounts', async () => {
    const { getByRole, rerender } = render(<Pair delayB={1} />);
    fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
    rerender(<Pair showB={false} delayB={1} />);
    await awaitFakeTimer();
    expectPopup(null);
  });

  it('preserves A when pending B unmounts and lets A close normally', async () => {
    const { getByRole, rerender } = render(<Pair delayB={1} />);
    fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
    rerender(<Pair showB={false} delayB={1} />);
    await awaitFakeTimer();
    expectPopup('Popup A');
    fireEvent.mouseLeave(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    expectPopup(null);
  });

  it('closes unmounted A while preserving the delayed show for B', async () => {
    const { getByRole, rerender } = render(<Pair delayB={1} />);
    fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
    rerender(<Pair showA={false} delayB={1} />);
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expectPopup(null);
    await awaitFakeTimer();
    expectPopup('Popup B');
  });

  it("does not let a stale leave cancel the next owner's delayed show", async () => {
    const { getByRole } = render(<Pair delayB={1} />);
    fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
    fireEvent.mouseLeave(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    expectPopup('Popup B');
  });

  it('can open again after repeated owner remounts', async () => {
    const { getByRole, rerender } = render(<Pair showB={false} />);
    for (let i = 0; i < 2; i += 1) {
      fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
      await awaitFakeTimer();
      expectPopup('Popup A');
      rerender(<Pair showA={false} showB={false} />);
      await awaitFakeTimer();
      expectPopup(null);
      rerender(<Pair showB={false} />);
    }
    fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    expectPopup('Popup A');
  });

  it("does not let an unmounted owner's delayed hide close B", async () => {
    const { getByRole, rerender } = render(<Pair />);
    fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
    await awaitFakeTimer();
    fireEvent.mouseLeave(getByRole('button', { name: 'A' }));
    rerender(<Pair showA={false} />);
    fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
    await awaitFakeTimer();
    expectPopup('Popup B');
  });

  it("does not release another provider's popup", async () => {
    const Demo = ({ showA }: { showA: boolean }) => (
      <>
        <UniqueProvider>
          {showA && (
            <Trigger
              unique
              popupVisible
              prefixCls="first-popup"
              popup={<div>Popup A</div>}
            >
              <button type="button">A</button>
            </Trigger>
          )}
        </UniqueProvider>
        <UniqueProvider>
          <Trigger unique popupVisible popup={<div>Popup B</div>}>
            <button type="button">B</button>
          </Trigger>
        </UniqueProvider>
      </>
    );
    const { rerender } = render(<Demo showA />);
    await awaitFakeTimer();
    expectPopup('Popup B');
    rerender(<Demo showA={false} />);
    await awaitFakeTimer();
    expect(
      document.querySelector('.first-popup:not(.first-popup-hidden)'),
    ).toBeNull();
    expectPopup('Popup B');
  });

  it.each(['A', 'B', 'both'])(
    "releases %s while B is waiting for A's enter motion",
    async (removed) => {
      const motion = { motionName: 'test-motion', motionDeadline: 1000 };
      const { getByRole, rerender } = render(<Pair motion={motion} />);
      fireEvent.mouseEnter(getByRole('button', { name: 'A' }));
      for (let i = 0; i < 5; i += 1) {
        await act(async () => {
          jest.advanceTimersByTime(20);
        });
      }
      expectPopup('Popup A');
      fireEvent.mouseEnter(getByRole('button', { name: 'B' }));
      expectPopup('Popup A');
      rerender(
        <Pair
          showA={removed === 'B'}
          showB={removed === 'A'}
          motion={motion}
        />,
      );
      await awaitFakeTimer();
      // Allow the interrupted enter and subsequent leave motion to finish.
      await awaitFakeTimer();
      expectPopup(
        removed === 'both' ? null : removed === 'A' ? 'Popup B' : 'Popup A',
      );
    },
  );
});

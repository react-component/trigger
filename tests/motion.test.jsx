import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Trigger from '../src';
import { placementAlignMap } from './util';

describe('Trigger.Motion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  async function awaitFakeTimer() {
    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      });
    }
  }

  it('popup should support motion', async () => {
    const { container } = render(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
      >
        <div className="target">click</div>
      </Trigger>,
    );
    const target = container.querySelector('.target');

    fireEvent.click(target);

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'bamboo-appear',
    );

    expect(
      document.querySelector('.rc-trigger-popup').style.pointerEvents,
    ).toEqual('');
  });

  it('use correct leave motion', async () => {
    // const cssMotionSpy = jest.spyOn(CSSMotion, 'render');

    const renderDemo = (props) => (
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
          leavedClassName: 'light',
          motionDeadline: 300,
        }}
        {...props}
      >
        <div className="target">click</div>
      </Trigger>
    );

    const { rerender } = render(renderDemo({ popupVisible: true }));
    await awaitFakeTimer();

    rerender(renderDemo({ popupVisible: false }));
    await awaitFakeTimer();

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass('light');
  });

  it('not lock on appear', () => {
    const genTrigger = (props) => (
      <Trigger
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
        popupVisible
        {...props}
      >
        <span />
      </Trigger>
    );

    const { rerender } = render(genTrigger());

    expect(document.querySelector('.rc-trigger-popup')).not.toHaveStyle({
      pointerEvents: 'none',
    });

    rerender(genTrigger({ popupVisible: false }));
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      pointerEvents: 'none',
    });
  });

  it('no update when close', () => {
    const genTrigger = ({ children, ...props }) => (
      <Trigger
        popup={children}
        popupMotion={{
          motionName: 'bamboo',
        }}
        popupVisible
        {...props}
      >
        <span />
      </Trigger>
    );

    const { rerender } = render(
      genTrigger({
        children: <div className="bamboo" />,
      }),
    );

    expect(document.querySelector('.bamboo')).toBeTruthy();

    // rerender when open
    rerender(
      genTrigger({
        children: <div className="little" />,
      }),
    );
    expect(document.querySelector('.little')).toBeTruthy();

    // rerender when close
    rerender(
      genTrigger({
        popupVisible: false,
        children: <div className="light" />,
      }),
    );
    expect(document.querySelector('.little')).toBeTruthy();
  });
});

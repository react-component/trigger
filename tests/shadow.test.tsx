import { act, fireEvent } from '@testing-library/react';
import { resetWarned } from '@rc-component/util/lib/warning';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Trigger from '../src';
import { awaitFakeTimer } from './util';

describe('Trigger.Shadow', () => {
  beforeEach(() => {
    resetWarned();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const Demo: React.FC = (props?: any) => (
    <>
      <Trigger
        action={['click']}
        popup={<span className="bamboo" />}
        builtinPlacements={{
          top: {},
        }}
        popupPlacement="top"
        {...props}
      >
        <p className="target" />
      </Trigger>

      {/* Placeholder element which not related with Trigger */}
      <div className="little" />
    </>
  );

  const renderShadow = (props?: any) => {
    const noRelatedSpan = document.createElement('span');
    document.body.appendChild(noRelatedSpan);

    const host = document.createElement('div');
    document.body.appendChild(host);

    const shadowRoot = host.attachShadow({
      mode: 'open',
      delegatesFocus: false,
    });
    const container = document.createElement('div');
    shadowRoot.appendChild(container);

    act(() => {
      createRoot(container).render(<Demo {...props} />);
    });

    return shadowRoot;
  };

  const renderMultiLevelShadow = (props?: any) => {
    const noRelatedSpan = document.createElement('span');
    document.body.appendChild(noRelatedSpan);

    const wrapperHost = document.createElement('div');
    const wrapperShadowRoot = wrapperHost.attachShadow({
      mode: 'open',
      delegatesFocus: false,
    });
    document.body.appendChild(wrapperHost);

    const host = document.createElement('div');
    wrapperShadowRoot.appendChild(host);

    const shadowRoot = host.attachShadow({
      mode: 'open',
      delegatesFocus: false,
    });
    const container = document.createElement('div');
    shadowRoot.appendChild(container);

    act(() => {
      createRoot(container).render(<Demo {...props} />);
    });

    return shadowRoot;
  };

  it('popup not in the same shadow', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const shadowRoot = renderShadow();

    await awaitFakeTimer();

    fireEvent.click(shadowRoot.querySelector('.target'));

    await awaitFakeTimer();

    expect(errSpy).toHaveBeenCalledWith(
      `Warning: trigger element and popup element should in same shadow root.`,
    );
    errSpy.mockRestore();
  });

  it('click in shadow should not close popup', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const shadowRoot = renderShadow({
      getPopupContainer: (item: HTMLElement) => item.parentElement,
      autoDestroy: true,
    });

    await awaitFakeTimer();

    // Click to show
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click outside to hide
    fireEvent.mouseDown(document.body.firstChild);
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeFalsy();

    // Click to show again
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click in side shadow to hide
    fireEvent.mouseDown(shadowRoot.querySelector('.little'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeFalsy();

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('click on target in shadow should not close popup', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const shadowRoot = renderShadow({
      getPopupContainer: (item: HTMLElement) => item.parentElement,
      autoDestroy: true,
    });

    await awaitFakeTimer();

    // Click to show
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click on target
    fireEvent.mouseDown(shadowRoot.querySelector('.bamboo'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('click on target with multilevel shadows should not close popup', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const shadowRoot = renderMultiLevelShadow({
      getPopupContainer: (item: HTMLElement) => item.parentElement,
      autoDestroy: true,
    });

    await awaitFakeTimer();

    // Click to show
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click outside to hide
    fireEvent.mouseDown(document.body.firstChild);
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeFalsy();

    // Click to show again
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click in side shadow to hide
    fireEvent.mouseDown(shadowRoot.querySelector('.little'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeFalsy();

    // Click to show again
    fireEvent.click(shadowRoot.querySelector('.target'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    // Click on target should not hide
    fireEvent.mouseDown(shadowRoot.querySelector('.bamboo'));
    await awaitFakeTimer();
    expect(shadowRoot.querySelector('.bamboo')).toBeTruthy();

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

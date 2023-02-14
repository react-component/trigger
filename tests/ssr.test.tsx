import { cleanup } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import Trigger from '../src';

global.canUseDOM = false;

jest.mock('rc-util/lib/Dom/canUseDom', () => () => global.canUseDOM);

describe('Trigger.SSR', () => {
  beforeEach(() => {
    global.canUseDOM = false;
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('normal', () => {
    const str = renderToString(
      <Trigger popupVisible popup={<strong>trigger</strong>} arrow>
        <div />
      </Trigger>,
    );
    expect(str).toBeTruthy();
  });

  it('default visible should not block render', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const node = (
      <Trigger popupVisible popup={<strong>trigger</strong>} arrow>
        <div />
      </Trigger>
    );
    const str = renderToString(node);
    expect(str).toBeTruthy();

    console.log(str);

    const div = document.createElement('div');
    hydrateRoot(div, node);

    expect(errSpy).not.toHaveBeenCalled();
  });
});

/* eslint-disable max-classes-per-file */
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
import React from 'react';
import Trigger from '../src';
import { awaitFakeTimer, placementAlignMap } from './util';

jest.mock('../src/Popup', () => {
  const OriPopup = jest.requireActual('../src/Popup').default;

  return React.forwardRef((props, ref) => {
    console.log(2333);
    return <OriPopup {...props} ref={ref} />;
  });
});

describe('Trigger.Basic', () => {
  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  function trigger(dom, selector, method = 'click') {
    fireEvent[method](dom.querySelector(selector));
    act(() => jest.runAllTimers());
  }

  describe('Performance', () => {
    it('not create Popup when !open', () => {
      const { container } = render(
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong className="x-content">tooltip2</strong>}
        >
          <div className="target">click</div>
        </Trigger>,
      );

      // trigger(container, '.target');

      // const popupDomNode = document.querySelector('.rc-trigger-popup');
      // expect(popupDomNode.parentNode.parentNode).toBeInstanceOf(
      //   HTMLBodyElement,
      // );
    });
  });
});

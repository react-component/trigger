/* eslint-disable max-classes-per-file */

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from '../src';
import { placementAlignMap } from './util';

describe('Trigger.Portal', () => {
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

  it('no trigger with portal element', () => {
    const PortalBox = () => {
      return ReactDOM.createPortal(
        <div className="portal-box" />,
        document.body,
      );
    };

    const onPopupVisibleChange = jest.fn();

    const { container } = render(
      <div className="holder">
        <Trigger
          action={['hover']}
          popupAlign={placementAlignMap.left}
          onPopupVisibleChange={onPopupVisibleChange}
          popup={
            <strong className="x-content">
              tooltip2
              <PortalBox />
            </strong>
          }
        >
          <div className="target">hover</div>
        </Trigger>
      </div>,
    );

    // Show the popup
    fireEvent.mouseEnter(container.querySelector('.target'));
    expect(onPopupVisibleChange).toHaveBeenCalledWith(true);
    fireEvent.mouseLeave(container.querySelector('.target'));

    // Mouse enter popup
    fireEvent.mouseEnter(document.querySelector('.x-content'));
    fireEvent.mouseLeave(document.querySelector('.x-content'));

    // To Portal
    fireEvent.mouseEnter(document.querySelector('.portal-box'));
    act(() => {
      jest.runAllTimers();
    });

    expect(onPopupVisibleChange).toHaveBeenCalledWith(false);
  });
});

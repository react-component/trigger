/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import { createPortal } from 'react-dom';
import '../../assets/index.less';

const PortalDemo = () => {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'red',
        zIndex: 999,
      }}
    >
      PortalNode
    </div>,
    document.body,
  );
};

export default () => {
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  return (
    <React.StrictMode>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        body {
          overflow-x: hidden;
        }
      `,
        }}
      />

      <Trigger
        arrow
        // forceRender
        // action="click"
        popupVisible={open}
        onPopupVisibleChange={(next) => {
          console.log('Visible Change:', next);
          setOpen(next);
        }}
        popupTransitionName="rc-trigger-popup-zoom"
        popup={
          <div
            style={{
              background: 'yellow',
              border: '1px solid blue',
              width: 200,
              height: 60,
              opacity: 0.9,
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </button>

            <PortalDemo />
          </div>
        }
        // popupVisible
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupAlign={{
          points: ['tc', 'bc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          htmlRegion: 'scroll',
        }}
      >
        <button
          disabled
          style={{
            // background: 'green',
            // color: '#FFF',
            paddingBlock: 30,
            paddingInline: 70,
            opacity: 0.9,
            transform: 'scale(0.6)',
            display: 'inline-block',
          }}
        >
          Button Target
        </button>
      </Trigger>

      <Trigger
        arrow
        action="click"
        popupVisible={open1}
        onPopupVisibleChange={(next) => {
          console.log('Visible Change:', next);
          setOpen1(next);
        }}
        popupTransitionName="rc-trigger-popup-zoom"
        popup={
          <div
            style={{
              background: 'yellow',
              border: '1px solid blue',
              width: 200,
              height: 60,
              opacity: 0.9,
            }}
          >
            <button
              onClick={() => {
                setOpen1(false);
              }}
            >
              Close
            </button>
          </div>
        }
        // popupVisible
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupAlign={{
          points: ['tc', 'bc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          htmlRegion: 'scroll',
        }}
      >
        <span
          style={{
            background: 'green',
            color: '#FFF',
            paddingBlock: 30,
            paddingInline: 70,
            opacity: 0.9,
            transform: 'scale(0.6)',
            display: 'inline-block',
          }}
        >
          Target Click
        </span>
      </Trigger>

      <Trigger
        arrow
        action="contextMenu"
        popupVisible={open2}
        onPopupVisibleChange={(next) => {
          console.log('Visible Change:', next);
          setOpen2(next);
        }}
        popupTransitionName="rc-trigger-popup-zoom"
        popup={
          <div
            style={{
              background: 'yellow',
              border: '1px solid blue',
              width: 200,
              height: 60,
              opacity: 0.9,
            }}
          >
            Target ContextMenu1
          </div>
        }
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupAlign={{
          points: ['tc', 'bc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          htmlRegion: 'scroll',
        }}
      >
        <span
          style={{
            background: 'blue',
            color: '#FFF',
            paddingBlock: 30,
            paddingInline: 70,
            opacity: 0.9,
            transform: 'scale(0.6)',
            display: 'inline-block',
          }}
        >
          Target ContextMenu1
        </span>
      </Trigger>

      <Trigger
        arrow
        action="contextMenu"
        popupVisible={open3}
        onPopupVisibleChange={(next) => {
          console.log('Visible Change:', next);
          setOpen3(next);
        }}
        popupTransitionName="rc-trigger-popup-zoom"
        popup={
          <div
            style={{
              background: 'yellow',
              border: '1px solid blue',
              width: 200,
              height: 60,
              opacity: 0.9,
            }}
          >
            Target ContextMenu2
          </div>
        }
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupAlign={{
          points: ['tc', 'bc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          htmlRegion: 'scroll',
        }}
      >
        <span
          style={{
            background: 'blue',
            color: '#FFF',
            paddingBlock: 30,
            paddingInline: 70,
            opacity: 0.9,
            transform: 'scale(0.6)',
            display: 'inline-block',
          }}
        >
          Target ContextMenu2
        </span>
      </Trigger>
    </React.StrictMode>
  );
};

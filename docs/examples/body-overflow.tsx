/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import '../../assets/index.less';

export default () => {
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
        action="click"
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
            Popup
          </div>
        }
        popupStyle={{ boxShadow: '0 0 5px red' }}
        popupAlign={{
          points: ['tc', 'bc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          offset: [0, -10],
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
          Target
        </span>
      </Trigger>
    </React.StrictMode>
  );
};

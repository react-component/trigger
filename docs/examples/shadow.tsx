/* eslint no-console:0 */
import Trigger from 'rc-trigger';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../assets/index.less';

const Demo = () => {
  return (
    <React.StrictMode>
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
        popupStyle={{ boxShadow: '0 0 5px red', position: 'absolute' }}
        getPopupContainer={(item) => item.parentElement!}
        popupAlign={{
          points: ['bc', 'tc'],
          overflow: {
            shiftX: 50,
            adjustY: true,
          },
          offset: [0, -10],
        }}
        stretch="minWidth"
        autoDestroy
      >
        <span
          style={{
            background: 'green',
            color: '#FFF',
            paddingBlock: 30,
            paddingInline: 70,
            opacity: 0.9,
            display: 'inline-block',
            marginLeft: 500,
            marginTop: 200,
          }}
        >
          Target
        </span>
      </Trigger>
    </React.StrictMode>
  );
};

export default () => {
  React.useEffect(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    host.style.background = 'rgba(255,0,0,0.1)';
    const shadowRoot = host.attachShadow({
      mode: 'open',
      delegatesFocus: false,
    });
    const container = document.createElement('div');
    shadowRoot.appendChild(container);

    createRoot(container).render(<Demo />);
  }, []);

  return null;
};

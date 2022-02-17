/* eslint no-console:0 */

import React from 'react';
import type { CSSMotionProps } from 'rc-motion';
import type { BuildInPlacements } from 'rc-trigger';
import Trigger from 'rc-trigger';
import './case.less';

const builtinPlacements: BuildInPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

const Motion: CSSMotionProps = {
  motionName: 'case-motion',
};

const MaskMotion: CSSMotionProps = {
  motionName: 'mask-motion',
};

function useControl<T>(valuePropName: string, defaultValue: T): [T, any] {
  const [value, setValue] = React.useState<T>(defaultValue);

  return [
    value,
    {
      value,
      checked: value,
      onChange({ target }) {
        setValue(target[valuePropName]);
      },
    },
  ];
}

const LabelItem: React.FC<{
  title: React.ReactNode;
  children: React.ReactElement;
  [prop: string]: any;
}> = ({ title, children, ...rest }) => {
  const { type } = children;

  const style = {
    display: 'inline-flex',
    padding: '0 8px',
    alignItems: 'center',
  };

  const spacing = <span style={{ width: 4 }} />;

  if (type === 'input' && children.props.type === 'checkbox') {
    return (
      <label style={style}>
        {React.cloneElement(children, rest)}
        {spacing}
        {title}
      </label>
    );
  }

  return (
    <label style={style}>
      {title}
      {spacing}
      {React.cloneElement(children, rest)}
    </label>
  );
};

const Demo = () => {
  const [hover, hoverProps] = useControl('checked', true);
  const [focus, focusProps] = useControl('checked', false);
  const [click, clickProps] = useControl('checked', false);
  const [contextMenu, contextMenuProps] = useControl('checked', false);

  const [placement, placementProps] = useControl('value', 'right');
  const [stretch, stretchProps] = useControl('value', '');
  const [motion, motionProps] = useControl('checked', true);
  const [destroyPopupOnHide, destroyPopupOnHideProps] = useControl(
    'checked',
    false,
  );
  const [mask, maskProps] = useControl('checked', false);
  const [maskClosable, maskClosableProps] = useControl('checked', true);
  const [forceRender, forceRenderProps] = useControl('checked', false);
  const [offsetX, offsetXProps] = useControl<number>('value', 0);
  const [offsetY, offsetYProps] = useControl<number>('value', 0);

  const actions = {
    hover,
    focus,
    click,
    contextMenu,
  };

  return (
    <React.StrictMode>
      <div>
        <div style={{ margin: '10px 20px' }}>
          <strong>Actions: </strong>
          <LabelItem title="Hover" {...hoverProps}>
            <input type="checkbox" />
          </LabelItem>
          <LabelItem title="Focus" {...focusProps}>
            <input type="checkbox" />
          </LabelItem>
          <LabelItem title="Click" {...clickProps}>
            <input type="checkbox" />
          </LabelItem>
          <LabelItem title="ContextMenu" {...contextMenuProps}>
            <input type="checkbox" />
          </LabelItem>

          <hr />

          <LabelItem title="Stretch" {...stretchProps}>
            <select>
              <option value="">--NONE--</option>
              <option value="width">width</option>
              <option value="minWidth">minWidth</option>
              <option value="height">height</option>
              <option value="minHeight">minHeight</option>
            </select>
          </LabelItem>

          <LabelItem title="Placement" {...placementProps}>
            <select>
              <option>right</option>
              <option>left</option>
              <option>top</option>
              <option>bottom</option>
              <option>topLeft</option>
              <option>topRight</option>
              <option>bottomRight</option>
              <option>bottomLeft</option>
            </select>
          </LabelItem>

          <LabelItem title="Motion" {...motionProps}>
            <input type="checkbox" />
          </LabelItem>

          <LabelItem title="Destroy Popup On Hide" {...destroyPopupOnHideProps}>
            <input type="checkbox" />
          </LabelItem>

          <LabelItem title="Mask" {...maskProps}>
            <input type="checkbox" />
          </LabelItem>

          <LabelItem title="Mask Closable" {...maskClosableProps}>
            <input type="checkbox" />
          </LabelItem>

          <LabelItem title="Force Render" {...forceRenderProps}>
            <input type="checkbox" />
          </LabelItem>

          <LabelItem title="OffsetX" {...offsetXProps}>
            <input />
          </LabelItem>

          <LabelItem title="OffsetY" {...offsetYProps}>
            <input />
          </LabelItem>
        </div>

        <div style={{ margin: 120, position: 'relative' }}>
          <Trigger
            popupAlign={{
              offset: [offsetX, offsetY],
              overflow: {
                adjustX: 1,
                adjustY: 1,
              },
            }}
            popupPlacement={placement}
            destroyPopupOnHide={destroyPopupOnHide}
            mask={mask}
            maskMotion={motion ? MaskMotion : null}
            maskClosable={maskClosable}
            stretch={stretch}
            action={Object.keys(actions).filter((action) => actions[action])}
            builtinPlacements={builtinPlacements}
            forceRender={forceRender}
            popupStyle={{
              border: '1px solid red',
              padding: 10,
              background: 'white',
              boxSizing: 'border-box',
            }}
            popup={<div>i am a popup</div>}
            popupMotion={motion ? Motion : null}
            onPopupAlign={() => {
              console.warn('Aligned!');
            }}
          >
            <div
              style={{
                margin: 20,
                display: 'inline-block',
                background: 'rgba(255, 0, 0, 0.05)',
              }}
              tabIndex={0}
              role="button"
            >
              <p>This is a example of trigger usage.</p>
              <p>You can adjust the value above</p>
              <p>which will also change the behaviour of popup.</p>
            </div>
          </Trigger>
        </div>
      </div>
    </React.StrictMode>
  );
};

export default Demo;

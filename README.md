<div align="center">
  <h1>@rc-component/trigger</h1>
  <p>🎯 Popup trigger and alignment primitive for React.</p>
  <p>
    <a href="https://ant.design">
      <img width="32" height="32" src="https://gw.alipayobjects.com/zos/bmw-prod/ae669a89-0c24-40ff-a91d-2b83497170f6.svg" alt="Ant Design" />
    </a>
  </p>
  <p>Part of the <a href="https://ant.design">Ant Design</a> ecosystem.</p>
  <p>
    <a href="https://www.npmjs.com/package/@rc-component/trigger"><img src="https://img.shields.io/npm/v/@rc-component/trigger.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@rc-component/trigger"><img src="https://img.shields.io/npm/dm/@rc-component/trigger.svg?style=flat-square" alt="npm downloads" /></a>
    <a href="https://github.com/react-component/trigger/actions/workflows/react-component-ci.yml"><img src="https://github.com/react-component/trigger/actions/workflows/react-component-ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://app.codecov.io/gh/react-component/trigger"><img src="https://img.shields.io/codecov/c/github/react-component/trigger/master.svg?style=flat-square" alt="Codecov" /></a>
    <a href="https://bundlephobia.com/package/@rc-component/trigger"><img src="https://badgen.net/bundlephobia/minzip/@rc-component/trigger" alt="bundle size" /></a>
    <a href="https://github.com/umijs/dumi"><img src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square" alt="dumi" /></a>
  </p>
</div>

## Highlights

- Built for React and maintained by the rc-component team.
- Used by Ant Design and other React component libraries.
- Ships TypeScript declarations with both ES module and CommonJS outputs.
- Keeps examples, tests, and preview builds aligned with the package source.

## Install

```bash
npm install @rc-component/trigger
```

## Usage

```tsx
import Trigger from '@rc-component/trigger';
import '@rc-component/trigger/assets/index.css';

export default () => (
  <Trigger
    action={['click']}
    popup={<span>Popup content</span>}
    popupAlign={{
      points: ['tl', 'bl'],
      offset: [0, 4],
    }}
  >
    <button type="button">Open</button>
  </Trigger>
);
```

## Examples

Run the local dumi site to explore the examples:

```bash
npm install
npm start
```

## API

### Trigger

| Prop                       | Description                                                               | Type                                      | Default            |
| -------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- | ------------------ |
| action                     | Actions that control popup visibility.                                    | `ActionType` \| `ActionType[]`            | `hover`            |
| afterOpenChange            | Called after popup visibility changes.                                    | `(visible) => void`                       | -                  |
| afterPopupVisibleChange    | Deprecated. Use `afterOpenChange` instead.                                | `(visible) => void`                       | -                  |
| alignPoint                 | Align popup to mouse position for click, hover, and context menu actions. | `boolean`                                 | `false`            |
| arrow                      | Render popup arrow.                                                       | `boolean` \| `ArrowType`                  | -                  |
| autoDestroy                | Destroy popup DOM when it is hidden.                                      | `boolean`                                 | `false`            |
| blurDelay                  | Delay before hiding on blur, in seconds.                                  | `number`                                  | -                  |
| builtinPlacements          | Named placement presets.                                                  | `BuildInPlacements`                       | `{}`               |
| defaultPopupVisible        | Initial uncontrolled visibility.                                          | `boolean`                                 | `false`            |
| focusDelay                 | Delay before showing on focus, in seconds.                                | `number`                                  | -                  |
| forceRender                | Render popup before it is first shown.                                    | `boolean`                                 | `false`            |
| fresh                      | Keep popup content updated while closed.                                  | `boolean`                                 | -                  |
| getPopupClassNameFromAlign | Return a popup class name from the current alignment.                     | `(align) => string`                       | -                  |
| getPopupContainer          | Return the element that should contain the popup.                         | `(node) => HTMLElement`                   | -                  |
| hideAction                 | Actions that hide popup visibility.                                       | `ActionType[]`                            | -                  |
| mask                       | Render a mask behind the popup.                                           | `boolean`                                 | `false`            |
| maskClosable               | Close when clicking the mask.                                             | `boolean`                                 | `true`             |
| maskMotion                 | Motion config for the mask.                                               | `CSSMotionProps`                          | -                  |
| mouseEnterDelay            | Delay before showing on mouse enter, in seconds.                          | `number`                                  | -                  |
| mouseLeaveDelay            | Delay before hiding on mouse leave, in seconds.                           | `number`                                  | `0.1`              |
| popup                      | Popup content.                                                            | `ReactNode` \| `() => ReactNode`          | -                  |
| popupAlign                 | Alignment config compatible with dom-align.                               | `AlignType`                               | -                  |
| popupClassName             | Class name added to popup.                                                | `string`                                  | -                  |
| popupMotion                | Motion config for the popup.                                              | `CSSMotionProps`                          | -                  |
| popupPlacement             | Placement key from `builtinPlacements`.                                   | `string`                                  | -                  |
| popupStyle                 | Inline popup style.                                                       | `React.CSSProperties`                     | -                  |
| popupVisible               | Controlled popup visibility.                                              | `boolean`                                 | -                  |
| prefixCls                  | Popup class name prefix.                                                  | `string`                                  | `rc-trigger-popup` |
| showAction                 | Actions that show popup visibility.                                       | `ActionType[]`                            | -                  |
| stretch                    | Stretch popup width and/or height from target.                            | `string`                                  | -                  |
| unique                     | Share popup container through `UniqueProvider`.                           | `boolean`                                 | -                  |
| uniqueContainerClassName   | Class name passed to `UniqueProvider` container.                          | `string`                                  | -                  |
| uniqueContainerStyle       | Style passed to `UniqueProvider` container.                               | `React.CSSProperties`                     | -                  |
| zIndex                     | Popup z-index.                                                            | `number`                                  | -                  |
| onOpenChange               | Called when visibility changes.                                           | `(visible) => void`                       | -                  |
| onPopupAlign               | Called when the popup is aligned.                                         | `(element, align) => void`                | -                  |
| onPopupClick               | Called when popup is clicked.                                             | `React.MouseEventHandler<HTMLDivElement>` | -                  |
| onPopupVisibleChange       | Deprecated. Use `onOpenChange` instead.                                   | `(visible) => void`                       | -                  |

## Development

```bash
npm install
npm start
npm test
npm run build
```

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command after the package build.

## License

@rc-component/trigger is released under the [MIT](./LICENSE) license.

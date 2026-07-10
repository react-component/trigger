<div align="center">
  <h1>@rc-component/trigger</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Ant Design 生态的一部分。</sub></p>
  <p>🎯 React 弹层触发基础组件，支持定位、对齐、动画和事件触发。</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/trigger"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/trigger.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/trigger"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/trigger.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/trigger/actions/workflows/react-component-ci.yml"><img alt="build status" src="https://github.com/react-component/trigger/actions/workflows/react-component-ci.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/trigger"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/trigger/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/trigger"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/trigger?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>


## 特性

- 面向 React 构建，并由 rc-component 团队维护。
- 被 Ant Design 使用和其他 React 组件库使用。
- 提供 TypeScript 类型声明，同时输出 ES module 和 CommonJS 产物。
- 示例、测试和预览构建与包源码保持一致。

## 安装

```bash
npm install @rc-component/trigger
```

## 使用

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

## 示例

运行本地 dumi 站点：

```bash
npm install
npm start
```

然后打开 `http://localhost:8000`。

## API

### Trigger

| 属性 | 说明 | 类型 | 默认值 |
| -------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- | ------------------ |
| action                     | 控制弹层显示状态的触发行为。                                    | `ActionType` \| `ActionType[]`            | `hover`            |
| afterOpenChange            | 弹层窗口可见性更改后调用。                                    | `(visible) => void`                       | -                  |
| afterPopupVisibleChange    | 已废弃。请使用 `afterOpenChange`。                                | `(visible) => void`                       | -                  |
| alignPoint                 | 将弹层对齐到 `click`、`hover` 和 `context menu` 行为的鼠标位置。 | `boolean`                                 | `false`            |
| arrow                      | 渲染弹层箭头。                                                       | `boolean` \| `ArrowType`                  | -                  |
| autoDestroy                | 弹层隐藏时销毁弹层 DOM。                                      | `boolean`                                 | `false`            |
| blurDelay                  | `blur` 后隐藏前的延迟，单位为秒。                                  | `number`                                  | -                  |
| builtinPlacements          | 命名位置预设。                                                  | `BuildInPlacements`                       | `{}`               |
| defaultPopupVisible        | 非受控初始显示状态。                                          | `boolean`                                 | `false`            |
| disabled                   | 临时隐藏弹层，但不主动重置当前打开状态。                       | `boolean`                                 | `false`            |
| focusDelay                 | `focus` 后显示前的延迟，单位为秒。                                | `number`                                  | -                  |
| forceRender                | 首次显示前渲染弹层。                                    | `boolean`                                 | `false`            |
| fresh                      | 关闭时仍保持弹层内容更新。                                  | `boolean`                                 | -                  |
| getPopupClassNameFromAlign | 根据当前对齐信息返回弹层 className。                     | `(align) => string`                       | -                  |
| getPopupContainer          | 返回弹层挂载容器元素。                         | `(node) => HTMLElement`                   | -                  |
| hideAction                 | 隐藏弹层的触发行为。                                       | `ActionType[]`                            | -                  |
| mask                       | 在弹层后渲染遮罩。                                           | `boolean`                                 | `false`            |
| maskClosable               | 点击遮罩时关闭。                                             | `boolean`                                 | `true`             |
| maskMotion                 | 遮罩动画配置。                                               | `CSSMotionProps`                          | -                  |
| mouseEnterDelay            | mouse enter 后显示前的延迟，单位为秒。                          | `number`                                  | -                  |
| mouseLeaveDelay            | 鼠标离开后隐藏前的延迟，单位为秒。                           | `number`                                  | `0.1`              |
| popup                      | 弹层内容。                                                            | `ReactNode` \| `() => ReactNode`          | -                  |
| popupAlign                 | 与 dom-align 兼容的对齐配置。                               | `AlignType`                               | -                  |
| popupClassName             | 添加到弹层的 className。                                                | `string`                                  | -                  |
| popupMotion                | 弹层动画配置。                                              | `CSSMotionProps`                          | -                  |
| popupPlacement             | 来自 `builtinPlacements` 的位置 key。                                   | `string`                                  | -                  |
| popupStyle                 | 弹层内联样式。                                                       | `React.CSSProperties`                     | -                  |
| popupVisible               | 受控的弹层窗口可见性。                                              | `boolean`                                 | -                  |
| prefixCls                  | 弹层 className 前缀。                                                  | `string`                                  | `rc-trigger-popup` |
| showAction                 | 显示弹层的触发行为。                                       | `ActionType[]`                            | -                  |
| stretch                    | 根据目标拉伸弹层宽度和/或高度。                            | `string`                                  | -                  |
| unique                     | 通过 `UniqueProvider` 共享弹层容器。                           | `boolean`                                 | -                  |
| uniqueContainerClassName   | 传给 `UniqueProvider` 容器的 className。                          | `string`                                  | -                  |
| uniqueContainerStyle       | 传给 `UniqueProvider` 容器的样式。                               | `React.CSSProperties`                     | -                  |
| zIndex                     | 弹层 z 索引。                                                            | `number`                                  | -                  |
| onOpenChange               | 当可见性发生变化时调用。                                           | `(visible) => void`                       | -                  |
| onPopupAlign               | 弹层完成对齐时调用。                                         | `(element, align) => void`                | -                  |
| onPopupClick               | 点击弹层时调用。                                             | `React.MouseEventHandler<HTMLDivElement>` | -                  |
| onPopupVisibleChange       | 已废弃。请使用 `onOpenChange`。                                   | `(visible) => void`                       | -                  |

## 本地开发

```bash
npm install
npm start
npm test
npm run build
```

dumi 站点默认运行在 `http://localhost:8000`。

## 发布

```bash
npm run prepublishOnly
```

包构建完成后，发布流程由 `@rc-component/np` 通过 `rc-np` 命令处理。

## 许可证

@rc-component/trigger 基于 [MIT](./LICENSE) 许可证发布。

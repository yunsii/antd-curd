<h1 align="center">antd-curd</h1>

<div align="center">

基于 ant design 、 dva、 [antd-form-mate](https://github.com/theprimone/antd-form-mate) 的增删改查页面组件。

[![GitHub license](https://img.shields.io/github/license/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/blob/master/LICENSE)
[![npm Version](https://img.shields.io/npm/v/antd-curd.svg)](https://www.npmjs.com/package/antd-curd)
[![GitHub stars](https://img.shields.io/github/stars/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/issues)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/commits/master)

</div>

**[在线预览 ->](https://zpr1g.github.io/antd-curd)**

由于没有打包发布的经验，所以在 2.0.0 之前的版本除了一些未知的 bug 外，可能会存在一些兼容性问题。此次重构到 2.0.0 后，移除了依赖 `antd-form-mate` 。后续发包当慎重起见。

## 结合 dva 的使用说明

组件内部调用以下 `effect` 函数:

* `fetch`  获取数据列表
* `detail`  获取对象详情
* `create`  创建对象
* `update`  更新对象
* `delete`  删除对象

以下 `reducer` 函数：

* `_saveDetail`  关闭弹窗时，清空对象详情

并注入以下数据字段：

* `data`  形如 `{ list: any[], pagination: any }`， 分页器属性参考 `Pagination` 组件
* `detail`  [可选]对象详情字段

基于此封装了 [dva-base-models](https://github.com/theprimone/dva-base-models)，配置相关请求函数即可使用。参考 [Demo](https://github.com/zpr1g/ant-design-pro-plus/blob/v2/src/pages/Enhance/models/curdPage.ts) 。

## 关于表单

通过 `ConfigProvider` 组件配置 `createFormItemsFn` ，组件内部关于创建表单的地方都会调用该方法，可直接从 [antd-form-mate](https://github.com/theprimone/antd-form-mate) 导出 `createFormItems` 传入即可。

## [StandardTable](/src/components/StandardTable/index.tsx)

基于 ant-deisgn-pro-v2 中的 [StandardTable](https://github.com/ant-design/ant-design-pro/blob/v2/src/components/StandardTable/index.js) 组件。

* 默认开启 `hideOnSinglePage`
* 间隔行着色
* 多选功能可选，通过 `checkable` 控制

## [StandardList](/src/components/StandardList/index.tsx)

与 StandardTable 类似，只是将容器从 [Table](https://ant.design/components/table-cn/) 替换为 [List](https://ant.design/components/list-cn/) ，并自定义组件（比如 [Card](https://ant.design/components/card-cn/) ）渲染每条记录。支持多选。

### API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `renderItem` | 用于自定义渲染组件 | `({ record, actions, recordSelection, checkable }) => React.ReactNode` | - |

## [DetailDrawer](/src/components/DetailDrawer/index.tsx) 详情抽屉

基于 [antd-form-mate](https://github.com/theprimone/antd-form-mate) 实现的详情表单抽屉，参数定义可参见 [DetailFormDrawer/index.tsx](/src/components/DetailDrawer/index.tsx#L10) 。开启防抖。

## [DetailModal](/src/components/DetailModal/index.tsx) 详情模态框

基于 [antd-form-mate](https://github.com/theprimone/antd-form-mate) 实现的详情模态框，参数定义可参见 [DetailFormModal/index.tsx](/src/components/DetailModal/index.tsx#L28) 。开启防抖。

## [QueryPanel](/src/components/QueryPanel/index.tsx) 查询面板

![K1ousP.png](https://s2.ax1x.com/2019/10/21/K1ousP.png)

基于 antd-form-mate 实现的查询面板组件，具体实现可参考 [QueryPanel/index.tsx](/src/components/QueryPanel/index.tsx) ，只需传入表单配置和 `onSearch` 方法即可使用。同时提供了重置表单后的 `onReset` 函数。

## [Curd](/src/Curd.tsx)

**为包含在 `Curd` 中的子组件注入 `__curd__` 的实例属性**

`state` 中保存了当前页面的查询参数：

* `searchForm` 表单数据
* `searchParams` 分页器，过滤器，排序器参数
  
还有一个 `handleSearch` 方法可供直接（ `innerRef` ）调起当前页面数据查询接口以供**刷新数据**使用。

### API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modelName` | dva 中 model 的名称空间 | `string` | - |
| `data` | 对象分页数据 | `{ list: T[]; pagination?: any }` | - |
| `dipatch` | dva 注入的 dispatch 函数 | `Function` | - |
| `wrapper` | 组件被包裹的容器，默认为无边框 `Card` | `React.ComponentClass \| null` | - |
| `createFormItemsFn` | 创建表单项的函数 | `(form: WrappedFormUtils) => (itemsConfig: ItemConfig[], formLayout?: Layout) => JSX.Element[]` | `() => () => ([])` |

## [Curd.Query](/src/curd-components/CurdQuery/index.tsx)

查询面板组件。

通过 `__curd__` 实例属性为 `Curd` 组件更新 `searchForm` 。

如果需要主动为 `Curd.Query` 组件的表单赋值，通过 `ref` 方法拿到 `Curd.Query` 的实例，再通过 `ref.form` 拿到表单对象即可。

另外，如果需要外部直接调起**新的搜索**，可通过 `ref` 拿到对象实例后调用 `setFieldsValueAndSearch` 并传入查询表单即可调起搜索，自动清空未输入的值。

### API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `queryArgsConfig` | 查询参数配置，参考 [index.js](https://github.com/theprimone/ant-design-pro-v2-plus/blob/79d034d339806c2a24c347036cebc219152f6b33/src/pages/Enhance/CurdPage/index.js#L24) | `any[]` | `[]` |

## [CurdBox](/src/curd-components/CurdBox/index.tsx)

**为包含在 `CurdBox` 中的子组件注入 `__curdBox__` 的实例属性**

通过 `__curd__` 实例属性为 `Curd` 组件更新 `searchParams` 。

增删改查容器，为子组件提供对象相关详情的展示和编辑弹窗，以及对象操作相关的增删改等操作（ Actions ）。

### API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `createTitle` | 新建窗口名称 | `string` | `'新建对象'` |
| `detailTitle` | 详情窗口名称 | `string` | `'对象详情'` |
| `updateTitle` | 编辑窗口名称 | `string` | `'编辑对象'` |
| `fetchLoading` | 请求列表 loading | `boolean` | - |
| `createLoading` | 创建 model loading | `boolean` | - |
| `detailLoading` | 请求 model 详情 loading | `boolean` | - |
| `updateLoading` | 更新 model loading | `boolean` | - |
| `deleteLoading` | 删除 model loading | `boolean` | - |
| `createButtonName` | 新建按钮名称，为空时隐藏按钮 | `string \| false` | `'新建'` |
| `popup` | 弹窗类型 | `'modal' \| 'drawer'` | - |
| `popupProps` | 弹窗配置，根据 `popup` 配置 | [CustomDetailFormDrawerProps](/src/curd-components/CurdBox/index.tsx#L9) \| [CustomDetailFormModalProps](/src/curd-components/CurdBox/index.tsx#L23) | - |
| `setFormItemsConfig` | 配置表单数据 | `(detail: {}, mode: 'create' \| 'detail' \| 'update', form) => any[]` | - |
| `afterPopupClose` | 关闭弹窗后回调函数 | `() => void` | - |
| `interceptors` | 拦截器 | [interceptors](#interceptors) | - |
| `detail` | model 详情 | `any` | - |
| `actionsConfig` | 表格配置 | `[actionsConfig](#actionsConfig) \| false \| null` | - |
| `showOperators` | 是否展示操作栏 | `boolean` | - |
| `extraOperators` | 扩展类似新增按钮的操作栏 | `JSX.Element[]` | - |
| `dipatch` | dva 注入的 dispatch 函数 | `Function` | - |
| `autoFetch` | 渲染后是否自动发起请求，如果需要配置额外的查询参数，可置为 false 手动自定义发起初始化请求 | `boolean` | `true` |
| `reSearchAfterUpdate` | 更新 model 是否自动刷新列表 | `boolean` | `false` |
| `__curd__` | 控制 Curd 相关属性 | Curd 实例 | - |

#### interceptors

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `updateFieldsValue` | 表单数据拦截处理，类似时间区间这样的数据，需要单独处理后再提交 | `(fieldsValue: any, mode?: 'create' \| 'update') => any` | - |
| `handleCreateClick` | 新建点击事件拦截 | `() => boolean \| undefined` | - |
| `handleDetailClick` | 详情点击事件拦截，可通过路由跳转到自定义的对象详情页面 | `(record: any) => boolean \| undefined` | - |
| `handleUpdateClick` | 编辑点击事件拦截 | `(record: any) => boolean \| undefined` | - |
| `handleDeleteClick` | 删除点击事件拦截 | `(record: any) => void` | - |
| `handleFilterAndSort` | 过滤器和排序器处理，可用于使过滤器和分页器受控 | `(filtersArg: Record<keyof any, string[]>, sorter: SorterResult<any>, extra?: TableCurrentDataSource<any>) => any` | - |

#### actionsConfig

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `showActionsCount` | 除更多外需要展示的操作个数 | `number` | `3` |
| `extraActions` | 除 **详情（4）**，**编辑（8）**，**删除（12）** 外，可自行配置额外操作。注意，数字是操作的 `key` ，根据 `key` 不同，会按升序排列 | [ActionType](/src/curd-components/CurdBox/actions/index.tsx) | - |
| `confirmKeys` | 需要弹出确认窗口的 `key` 数组 | `(number \| [number, (record?: any) => string])[]` | `[12]` |
| `confirmProps` | 额外的 Popconfirm 配置 | `PopconfirmProps` | - |
| `hideActions` | 隐藏操作的 `key` 数组 | `number[] \| ((record?: any) => void \| number[])` | - |
| `disabledActions` | 禁用操作的 `key` 数组 | `(record?: any) => void \| number[]` | - |
| `detailActionTitle` | 详情 action 名称 | `string` | `'详情'` |
| `updateActionTitle` | 编辑 action 名称 | `string` | `'编辑'` |
| `deleteActionTitle` | 删除 action 名称 | `string` | `'删除'` |

#### 注意事项

* `handle**Click` 事件（除 `handleDeleteClick` 事件外， `handleDeleteClick` 直接中断）默认不会中断后续流程，如果需要中断， `return true` 即可。
* 如果对象详情不需要再请求接口，不注入 `detail` 或者 `detailLoading` 即可。

## [Curd.Table](/src/curd-components/CurdTable/index.tsx)

![K1oKqf.png](https://s2.ax1x.com/2019/10/21/K1oKqf.png)

由 [CurdBox](/src/curd-components/CurdBox/index.tsx) 封装 [StandardTable](/src/components/StandardTable/index.tsx) 而成。

## [Curd.List](/src/curd-components/CurdList/index.tsx)

![K1oldS.png](https://s2.ax1x.com/2019/10/21/K1oldS.png)

由 [CurdBox](/src/curd-components/CurdBox/index.tsx) 封装 [StandardList](/src/components/StandardList/index.tsx) 而成。

[Demo](/stories/index.stories.tsx)

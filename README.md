# antd-curd

[![GitHub license](https://img.shields.io/github/license/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/blob/master/LICENSE)
[![npm Version](https://img.shields.io/npm/v/antd-curd.svg)](https://www.npmjs.com/package/antd-curd)
[![GitHub stars](https://img.shields.io/github/stars/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/issues)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/theprimone/antd-curd.svg)](https://github.com/theprimone/antd-curd/commits/master)

基于 ant design 、 umi 、 dva 的增删改查页面组件

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

## [DetailFormDrawer](/src/components/DetailFormDrawer/index.tsx) 详情抽屉

基于 antd-form-mate 实现的详情表单抽屉，参数定义可参见 [DetailFormDrawer/index.d.ts](/src/components/DetailFormDrawer/index.d.ts) 。

## [DetailFormModal](/src/components/DetailFormModal/index.tsx) 详情模态框

基于 antd-form-mate 实现的详情模态框，参数定义可参见 [DetailFormModal/index.tsx](/src/components/DetailFormModal/index.tsx) 。

## [QueryPanel](/src/components/QueryPanel/index.tsx) 查询面板

基于 antd-form-mate 实现的查询面板组件，具体实现可参考 [QueryPanel/index.js](/src/components/QueryPanel/index.tsx) ，只需传入表单配置和 `onSearch` 方法即可使用。同时提供了重置表单后的 `onReset` 函数。参数定义可参考 [QueryPanel/index.d.ts](/src/components/QueryPanel/index.tsx) 。

## [CurdBox](/src/components/CurdBox/index.tsx)

**为包含在 `CurdBox` 中的子组件注入 `__curdBox__` 的实例属性**

通过 `__curd__` 实例属性为 `Curd` 组件更新 `searchParams` 。

增删改查容器，为子组件提供相关详情的弹窗和数据操作相关的 Actions 。

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
| `createButtonName` | 新建按钮名称，为空时隐藏按钮 | `string | false` | `'新建'` |
| `popupType` | 弹窗类型 | `'modal' | 'drawer'` | - |
| `popupProps` | 弹窗配置，根据 `popupType` 配置 | [CustomDetailFormDrawerProps](/src/components/CurdBox/index.tsx) \| [CustomDetailFormModalProps](/src/components/CurdBox/index.tsx) | - |
| `setFormItemsConfig` | 配置表单数据 | `(detail: {}, mode: 'create' | 'detail' | 'update', form) => any[]` | - |
| `afterPopupClose` | 关闭弹窗后回调函数 | `() => void` | - |
| `interceptors` | 拦截器 | [interceptors](#interceptors) | - |
| `detail` | model 详情 | `any` | - |
| `actionsConfig` | 表格配置 | `[actionsConfig](#actionsConfig) | false | null` | - |
| `operators` | 类似新增按钮的功能，会注入 Curd 的组件实例（可访问控制该页面组件的所有属性）用于扩展功能，如重新搜索等 | `React.ReactNode[]` | - |
| `dipatch` | dva 注入的 dispatch 函数 | `Function` | - |
| `autoFetch` | 渲染后是否自动发起请求，如果需要配置额外的查询参数，可置为 false 手动自定义发起初始化请求 | `boolean` | `true` |
| `reSearchAfterUpdate` | 更新 model 是否自动刷新列表 | `boolean` | `false` |
| `__curd__` | 控制 Curd 相关属性 | Curd 实例 | - |

#### interceptors

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `updateFieldsValue` | 表单数据拦截处理，类似时间区间这样的数据，需要单独处理后再提交 | `(fieldsValue: any, mode?: 'create' | 'update') => any` | - |
| `handleCreateClick` | 新建点击事件拦截 | `() => boolean | undefined` | - |
| `handleDetailClick` | 详情点击事件拦截，可通过路由跳转到自定义的对象详情页面 | `(record: any) => boolean | undefined` | - |
| `handleUpdateClick` | 编辑点击事件拦截 | `(record: any) => boolean | undefined` | - |
| `handleDeleteClick` | 删除点击事件拦截 | `(record: any) => void` | - |
| `handleFilterAndSort` | 过滤器和排序器处理，可用于使过滤器和分页器受控 | `(filtersArg: Record<keyof any, string[]>, sorter: SorterResult<any>, extra?: TableCurrentDataSource<any>) => any` | - |

#### actionsConfig

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `showActionsCount` | 除更多外需要展示的操作个数 | `number` | `3` |
| `extraActions` | 除 **详情（4）**，**编辑（8）**，**删除（12）** 外，可自行配置额外操作。注意，数字是操作的 `key` ，根据 `key` 不同，会按升序排列 | [ActionType](/src/components/CurdBox/actions/index.tsx) | - |
| `confirmKeys` | 需要弹出确认窗口的 `key` 数组 | `(number | [number, (record?: any) => string])[]` | `[12]` |
| `confirmProps` | 额外的 Popconfirm 配置 | `PopconfirmProps` | - |
| `hideActions` | 隐藏操作的 `key` 数组 | `number[]` | - |
| `detailActionTitle` | 详情 action 名称 | `string` | `'详情'` |
| `updateActionTitle` | 编辑 action 名称 | `string` | `'编辑'` |
| `deleteActionTitle` | 删除 action 名称 | `string` | `'删除'` |

#### 注意事项

handle**Click 事件（除 handleDeleteClick 事件外， handleDeleteClick 直接中断）默认不会中断后续的弹窗事件，如果需要中断， `return true` 即可。

## [Curd](/src/Curd.tsx)

**为包含在 `Curd` 中的子组件注入 `__curd__` 的实例属性**

`state` 中保存了当前页面的查询参数：

* `searchForm` 表单数据
* `searchParams` 分页器，过滤器，排序器参数
  
还有一个 `handleSearch` 方法可供直接调起当前页面数据查询接口以供刷新数据使用。


## [Curd.QueryPanel](/src/components/QueryPanel/index.tsx)

查询面板组件。

通过 `__curd__` 实例属性为 `Curd` 组件更新 `searchForm` 。

如果需要主动为 `QueryPanel` 组件的表单赋值，通过 `wrappedComponentRef` 的方法拿到 `QueryPanel` 的实例即可。

### API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `queryArgsConfig` | 查询参数配置，参考 [index.js](https://github.com/theprimone/ant-design-pro-v2-plus/blob/79d034d339806c2a24c347036cebc219152f6b33/src/pages/Enhance/CurdPage/index.js#L24) | `any[]` | `[]` |

## [Curd.CurdTable](/src/components/CurdTable/index.tsx)

由 [CurdBox](#[CurdBox](/src/components/CurdBox/index.tsx)) 封装 [StandardTable]([StandardTable](/src/components/StandardTable/index.tsx)) 而成。

## [Curd.CurdList](/src/components/CurdList/index.tsx)

由 [CurdBox](#[CurdBox](/src/components/CurdBox/index.tsx)) 封装 [StandardList](#[StandardList](/src/components/StandardList/index.tsx)) 而成。

[Demo](/stories/index.stories.tsx)

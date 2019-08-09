# antd-curd

基于 ant design 、 umi 、 dva 的增删改查页面组件

## [StandardTable](/src/components/StandardTable/index.tsx)

基于 ant-deisgn-pro-v2 中的 StandardTable 组件。

* 默认开启 hideOnSinglePage
* 间隔行着色
* 多选功能可选，通过 `checkable` 控制

## [FormMateContext](/src/FormMateContext.ts)

为 Curd 组件提供 FormProvider 和 createFormItems ，组件内部的表单容器都要用到。

## [Curd](/src/Curd.tsx)

`state` 中保存了当前页面的查询参数 `searchForm` ，还有一个 `handleSearch` 方法可供直接调起查询接口。

为包含在 `Curd` 中的子组件注入 `__curd__` 的实例属性。

## [Curd.QueryPanel](/src/components/QueryPanel/index.tsx)

查询面板组件。

通过 `__curd__` 实例属性为 `Curd` 组件更新 `searchForm` 。

如果需要主动为 `QueryPanel` 组件的表单赋值，通过 `wrappedComponentRef` 的方法拿到 `QueryPanel` 的实例即可。

## [Curd.CurdTable](/src/components/CurdTable/index.tsx)

增删改查表格。

[Demo](/stories/index.stories.tsx)
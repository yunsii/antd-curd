import { SorterResult } from 'antd/lib/table';

export const queryPanelText = {
  collapse: '收起',
  expand: '展开',
  search: '查询',
  reset: '重置',
}

export function setQueryPanelText(config: {
  collapse?: string,
  expand?: string,
  search?: string,
  reset?: string,
}) {
  if (config.collapse) {
    queryPanelText["collapse"] = config.collapse
  }
  if (config.expand) {
    queryPanelText["expand"] = config.expand
  }
  if (config.search) {
    queryPanelText["search"] = config.search
  }
  if (config.reset) {
    queryPanelText["reset"] = config.reset
  }
}

export const detailFormDrawerText = {
  ok: '确定',
  cancel: '取消',
}

export function setDetailFormDrawerText(config: {
  ok?: string,
  cancel?: string,
}) {
  if (config.ok) {
    detailFormDrawerText["ok"] = config.ok
  }
  if (config.cancel) {
    detailFormDrawerText["cancel"] = config.cancel
  }
}

export let formatSorter: (sorter: SorterResult<any>) => any = (sorter: SorterResult<any>) => `${sorter.field}_${sorter.order}`

export function setFormatSorter(customSorter: (sorter: SorterResult<any>) => any) {
  if (customSorter instanceof Function) {
    formatSorter = customSorter
  }
}

export const searchFieldName = {
  page: 'page',
  limit: 'limit',
  sortor: 'sortor',
}

export function setSearchFieldName(config: {
  page?: string,
  limit?: string,
  sortor?: string,
}) {
  if (config.page) {
    searchFieldName["page"] = config.page
  }
  if (config.limit) {
    searchFieldName["limit"] = config.limit
  }
  if (config.sortor) {
    searchFieldName["sortor"] = config.sortor
  }
}
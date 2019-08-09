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

export const curdLocale = {
  createOk: "创建成功",
  updateOk: "更新成功",
  deleteOk: "删除成功",
};

export interface CurdLocale {
  createOk?: string;
  updateOk?: string;
  deleteOk?: string;
}

export function setCurdLocale(options: CurdLocale) {
  if (options.createOk !== undefined) {
    curdLocale.createOk = options.createOk;
  }
  if (options.updateOk !== undefined) {
    curdLocale.updateOk = options.updateOk;
  }
  if (options.deleteOk !== undefined) {
    curdLocale.deleteOk = options.deleteOk;
  }
}
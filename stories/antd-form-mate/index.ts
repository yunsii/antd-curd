import FormMate from 'antd-form-mate';

const { setDefaultExtra } = FormMate;
setDefaultExtra({
  picture: '自定义图片默认提示',
});

export const { FormProvider, createFormItems } = FormMate;

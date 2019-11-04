import React from 'react';
import { Spin, Button, Drawer, Form } from 'antd';
import _debounce from 'lodash/debounce';
import { ColProps } from "antd/lib/col";
import { DrawerProps } from 'antd/lib/drawer';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/form-mate';
import { createFormItems } from '../../FormMate';
import { detailFormDrawerText } from '../../config';

export interface DetailFormDrawerProps {
  drawerConfig: DrawerProps;
  onOk?: Function;
  setItemsConfig: (form: WrappedFormUtils) => ItemConfig[];
  itemsLayout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
  loading?: boolean;
  form?: WrappedFormUtils;
  getFormInstance?: (form: WrappedFormUtils) => void;
}

function DetailFormDrawer(props: DetailFormDrawerProps) {
  const {
    drawerConfig,
    onOk: handleOk = () => { },
    form = {} as any,
    setItemsConfig,
    itemsLayout,
    loading = false,
    getFormInstance = () => { },
  } = props;
  getFormInstance(form);

  const itemsConfig = setItemsConfig(form);

  const okHandle = _debounce(() => {
    console.log('DetailFormDrawer _debounce onOk');
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  }, 600);

  return (
    <Drawer destroyOnClose width={560} {...drawerConfig}>
      <Spin spinning={loading}>
        {createFormItems(form)(itemsConfig, itemsLayout)}
        <div
          style={{
            // position: 'absolute',
            // left: 0,
            // bottom: -10,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={drawerConfig.onClose as any} style={{ marginRight: 8 }}>
            {detailFormDrawerText.cancel}
          </Button>
          <Button onClick={okHandle} type="primary">
            {detailFormDrawerText.ok}
          </Button>
        </div>
      </Spin>
    </Drawer>
  );
};

export default Form.create()(DetailFormDrawer);

import React from 'react';
import { Spin, Button, Drawer, Form } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { FormProps } from 'antd/lib/form';
import { ItemConfig } from 'antd-form-mate/dist/lib/form-mate';
import { createFormItems } from '../../FormMate';
import { detailFormDrawerText } from '../../config';

export interface DetailFormDrawerProps {
  drawerConfig: DrawerProps;
  onOk?: Function;
  setItemsConfig: (detail: any, mode: string, form: FormProps['form']) => ItemConfig[];
  detail?: any;
  mode?: string;
  itemsLayout?: {
    labelCol?: any;
    wrapperCol?: any;
  };
  loading?: boolean;
  form: any;
}

function DetailFormDrawer(props: DetailFormDrawerProps) {
  const {
    drawerConfig,
    onOk: handleOk = () => { },
    form = {} as any,
    detail = {},
    mode = '',
    setItemsConfig,
    itemsLayout,
    loading = false,
  } = props;
  const itemsConfig = setItemsConfig(detail, mode, form);

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  };

  return (
    <Drawer destroyOnClose width={560} {...drawerConfig}>
      <Spin spinning={loading}>
        {createFormItems(form)(itemsConfig, itemsLayout)}
        {handleOk ? (
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
        ) : null}
      </Spin>
    </Drawer>
  );
};

export default Form.create()(DetailFormDrawer);

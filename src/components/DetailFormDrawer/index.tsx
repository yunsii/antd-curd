import React from 'react';
import { Spin, Button, Drawer, Form } from 'antd';
import _debounce from 'lodash/debounce';
import { DrawerProps } from 'antd/lib/drawer';
import { createFormItems } from '../../FormMate';
import { detailFormDrawerText } from '../../config';
import { PopupProps } from '../DetailFormModal';

export interface DetailFormDrawerProps extends PopupProps {
  drawerConfig?: DrawerProps;
  onOk?: Function;
}

function DetailFormDrawer(props: DetailFormDrawerProps) {
  const {
    drawerConfig = {},
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

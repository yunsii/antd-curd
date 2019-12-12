import React, { useContext } from 'react';
import { Spin, Button, Drawer, Form } from 'antd';
import _debounce from 'lodash/debounce';
import _get from 'lodash/get';
import { DrawerProps } from 'antd/lib/drawer';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { createFormItems } from '../../FormMate';
import ConfigContext from '../../ConfigContext';
import defaultLocale from '../../defaultLocale';
import { PopupProps } from '../DetailModal/index';

export interface DetailDrawerProps extends PopupProps {
  drawerProps?: DrawerProps;
  onOk?: Function;
}

function DetailDrawer(props: DetailDrawerProps) {
  const { setLocale, debounceWait } = useContext(ConfigContext);
  const locale = { ...defaultLocale.drawer, ..._get(setLocale, 'drawer', {}) };
  const {
    drawerProps = {},
    onOk: handleOk = () => { },
    form = {} as WrappedFormUtils,
    setItemsConfig,
    itemsLayout,
    loading = false,
    getFormInstance = () => { },
  } = props;
  getFormInstance(form);

  const itemsConfig = setItemsConfig(form);

  const okHandle = _debounce(() => {
    console.log('DetailFormDrawer _debounce onOk');
    form.validateFieldsAndScroll((err?: any, fieldsValue?: any) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  }, debounceWait);

  return (
    <Drawer destroyOnClose width={560} {...drawerProps}>
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
          <Button onClick={drawerProps.onClose as any} style={{ marginRight: 8 }}>
            {locale.cancel}
          </Button>
          <Button onClick={okHandle} type="primary">
            {locale.ok}
          </Button>
        </div>
      </Spin>
    </Drawer>
  );
};

export default Form.create<DetailDrawerProps>()(DetailDrawer);

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

export type CustomModalProps = Omit<DrawerProps,
  | 'title'
  | 'visible'
  | 'onOk'
  | 'onClose'
  | 'afterClose'
>

export interface DetailDrawerProps extends PopupProps {
  drawerProps?: CustomModalProps;
}

function DetailDrawer(props: DetailDrawerProps) {
  const { setLocale, debounceWait } = useContext(ConfigContext);
  const locale = { ...defaultLocale.drawer, ..._get(setLocale, 'drawer', {}) };
  const {
    loading = false,
    setItemsConfig,
    itemsLayout,
    getFormInstance = () => { },
    onOk: handleOk = () => { },
    onClose,
    visible,
    afterClose = () => { },
    title,

    drawerProps = {},
    form = {} as WrappedFormUtils,
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
    <Drawer
      destroyOnClose
      width={560}
      {...drawerProps}
      visible={visible}
      afterVisibleChange={(isVisible) => {
        if (!isVisible) {
          afterClose();
        }
      }}
      title={title}
    >
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
          <Button onClick={onClose} style={{ marginRight: 8 }}>
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

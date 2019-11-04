/* eslint-disable no-use-before-define */
import React, { Fragment } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import _debounce from 'lodash/debounce';
import { ColProps } from "antd/lib/col";
import { ModalProps } from 'antd/lib/modal';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { createFormItems } from '../../FormMate';
import { ItemConfig } from 'antd-form-mate/dist/lib/form-mate';
import { injectChildren } from '../../utils';

export interface DetailFormModalProps {
  modalConfig: ModalProps;
  loading?: boolean;
  setItemsConfig: (form: WrappedFormUtils) => ItemConfig[];
  mode?: string;
  itemsLayout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
  itemsWrapperStyle?: React.CSSProperties;
  itemsWrapperClassName?: string;
  children?: JSX.Element;
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;
  form?: WrappedFormUtils;
  getFormInstance?: (form: WrappedFormUtils) => void;
}

function DetailFormModal(props: DetailFormModalProps) {
  const {
    modalConfig: { onOk: handleOk = () => { }, ...restModalConfig },
    cols = 1,
    children,
    setItemsConfig,
    mode = '',
    itemsLayout,
    itemsWrapperStyle = {} as any,
    itemsWrapperClassName,
    loading = false,
    form = {} as any,
    getFormInstance = () => { },
  } = props;
  getFormInstance(form);


  const onOk = _debounce(() => {
    console.log('DetailFormModal _debounce onOk');
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  }, 600);
  const itemsConfig = setItemsConfig(form);

  const colsItems = cols === 1 ? (
    createFormItems(form)(itemsConfig, itemsLayout)
  ) : (
      <Row type="flex">
        {createFormItems(form)(itemsConfig, itemsLayout).map(item => {
          return (
            <Col span={24 / cols} key={item.key as any}>
              {item}
            </Col>
          );
        })}
      </Row>
    );

  return (
    <Modal destroyOnClose {...restModalConfig} onOk={onOk}>
      <Fragment>
        <div className={itemsWrapperClassName} style={itemsWrapperStyle}>
          <Spin spinning={loading}>
            {colsItems}
          </Spin>
        </div>
        {mode ? injectChildren(children, { mode }) : children}
      </Fragment>
    </Modal>
  );
}

export default Form.create()(DetailFormModal);

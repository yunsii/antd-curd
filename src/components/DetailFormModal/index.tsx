/* eslint-disable no-use-before-define */
import React, { Fragment } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormProps, } from 'antd/lib/form';
import { ItemConfig } from 'antd-form-mate';
import { FormMate } from '../../FormMate';
import { injectChildren } from '../../utils';

export interface DetailFormModalProps {
  modalConfig: ModalProps;
  loading?: boolean;
  setItemsConfig: (detail: any, mode: string, form: FormProps['form']) => ItemConfig[];
  detail?: any;
  mode?: string;
  itemsLayout?: {
    labelCol?: any;
    wrapperCol?: any;
  };
  itemsWrapperStyle?: React.CSSProperties;
  itemsWrapperClassName?: string;
  children?: JSX.Element;
  cols?: number;
  form: FormProps["form"];
}

function DetailFormModal(props: DetailFormModalProps) {
  const {
    modalConfig: { onOk: handleOk = () => { }, ...restModalConfig },
    cols = 1,
    children,
    setItemsConfig,
    detail = {},
    mode = '',
    itemsLayout,
    itemsWrapperStyle = {} as any,
    itemsWrapperClassName,
    loading = false,
    form = {} as any,
  } = props;

  const onOk = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  };
  const itemsConfig = setItemsConfig(detail, mode, form);

  const colsItems = cols === 1 ? (
    FormMate.createFormItems(itemsConfig, itemsLayout)
  ) : (
      <Row type="flex">
        {FormMate.createFormItems(itemsConfig, itemsLayout).map(item => {
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
            <FormMate.FormProvider value={form}>
              {colsItems}
            </FormMate.FormProvider>
          </Spin>
        </div>
        {mode ? injectChildren(children, { mode }) : children}
      </Fragment>
    </Modal>
  );
}

export default Form.create()(DetailFormModal as any);

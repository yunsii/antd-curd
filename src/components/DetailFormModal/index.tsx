/* eslint-disable no-use-before-define */
import React, { Fragment } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FormProps, } from 'antd/lib/form';
import { createFormItems } from '../../FormMate';
import { ItemConfig } from 'antd-form-mate/dist/lib/form-mate';
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

export default Form.create()(DetailFormModal as any);

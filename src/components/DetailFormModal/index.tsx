/* eslint-disable no-use-before-define */
import React, { Fragment } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import _debounce from 'lodash/debounce';
import { ColProps } from "antd/lib/col";
import { ModalProps } from 'antd/lib/modal';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { debounceWait } from '../../config';
import { createFormItems } from '../../FormMate';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import { injectChildren } from '../../utils';

export interface CustomModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: (fieldsValue: any) => void;
}

export interface PopupProps extends FormComponentProps {
  loading?: boolean;
  setItemsConfig: (form: WrappedFormUtils) => ItemConfig[];
  itemsLayout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
  getFormInstance?: (form: WrappedFormUtils) => void;
}

export interface DetailFormModalProps extends PopupProps {
  modalConfig?: CustomModalProps;
  mode?: string;
  itemsWrapperStyle?: React.CSSProperties;
  itemsWrapperClassName?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;
  children?: JSX.Element;
}

function DetailFormModal(props: DetailFormModalProps) {
  const {
    modalConfig,
    cols = 1,
    children,
    setItemsConfig,
    mode = '',
    itemsLayout,
    itemsWrapperStyle = {} as any,
    itemsWrapperClassName,
    loading = false,
    form = {} as WrappedFormUtils,
    getFormInstance = () => { },
  } = props;
  const { onOk: handleOk = () => { }, ...restModalConfig } = modalConfig || {};
  getFormInstance(form);
  const itemsConfig = setItemsConfig(form);


  const onOk = _debounce(() => {
    console.log('DetailFormModal _debounce onOk');
    form.validateFieldsAndScroll((err?: any, fieldsValue?: any) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  }, debounceWait);

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

export default Form.create<DetailFormModalProps>()(DetailFormModal);

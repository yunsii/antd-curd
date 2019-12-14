/* eslint-disable no-use-before-define */
import React, { Fragment, useContext } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import _debounce from 'lodash/debounce';
import { ColProps } from "antd/lib/col";
import { ModalProps } from 'antd/lib/modal';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import ConfigContext from '../../config-provider';
import { createFormItems } from '../../FormMate';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import { injectChildren } from '../../utils';

export interface PopupProps extends FormComponentProps {
  loading?: boolean;
  setItemsConfig: (form: WrappedFormUtils) => ItemConfig[];
  itemsLayout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
  getFormInstance?: (form: WrappedFormUtils) => void;
  mode?: string;
  onOk?: (fieldsValue: any) => void;
  onClose?: () => void;
  visible?: boolean;
  afterClose?: () => void;
  title?: string;
}

export type CustomModalProps = Omit<ModalProps,
  | 'title'
  | 'visible'
  | 'onOk'
  | 'onCancel'
  | 'afterClose'
>

export interface DetailModalProps extends PopupProps {
  modalProps?: CustomModalProps;
  itemsWrapperProps?: React.HTMLAttributes<any>;
  cols?: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;
  children?: JSX.Element;
}

function DetailModal(props: DetailModalProps) {
  const { debounceWait } = useContext(ConfigContext);
  const {
    loading = false,
    setItemsConfig,
    itemsLayout,
    getFormInstance = () => { },
    mode,
    onOk: handleOk = () => { },
    onClose,
    visible,
    afterClose,
    title,

    modalProps,
    cols = 1,
    itemsWrapperProps = {} as any,
    form = {} as WrappedFormUtils,
    children,
  } = props;
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
    <Modal
      destroyOnClose
      {...modalProps}
      onOk={onOk}
      onCancel={onClose}
      visible={visible}
      afterClose={afterClose}
      title={title}
    >
      <Fragment>
        <div {...itemsWrapperProps}>
          <Spin spinning={loading}>
            {colsItems}
          </Spin>
        </div>
        {mode ? injectChildren(children, { mode }) : children}
      </Fragment>
    </Modal>
  );
}

export default Form.create<DetailModalProps>()(DetailModal);

/* eslint-disable no-use-before-define */
import React, { Fragment } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import FormMateContext from '../../FormMateContext';
import { injectChildren } from '../../utils';


function DetailFormModal(props) {
  const {
    modalConfig: { onOk: handleOk, ...restModalConfig },
    cols = 1,
    children,
    setItemsConfig,
    detail = {},
    mode,
    itemsLayout,
    itemsWrapperStyle,
    itemsWrapperClassName,
    loading = false,
    form,
  } = props;

  const onOk = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleOk(fieldsValue);
    });
  };
  const itemsConfig = setItemsConfig(detail, mode, form);

  const setColsItems = (createFormItems) =>
    cols === 1 ? (
      createFormItems(itemsConfig, itemsLayout)
    ) : (
        <Row type="flex">
          {createFormItems(itemsConfig, itemsLayout).map(item => {
            return (
              <Col span={24 / cols} key={item.key}>
                {item}
              </Col>
            );
          })}
        </Row>
      );

  return (
    <Modal destroyOnClose {...restModalConfig} onOk={onOk}>
      <FormMateContext.Consumer>
        {({ FormProvider, createFormItems }) => {
          if (FormProvider && createFormItems) {
            return (
              <Fragment>
                <div className={itemsWrapperClassName} style={itemsWrapperStyle}>
                  <Spin spinning={loading}>
                    <FormProvider value={form}>{setColsItems(createFormItems)}</FormProvider>
                  </Spin>
                </div>
                {mode ? injectChildren(children, { mode }) : children}
              </Fragment>
            )
          }
        }}
      </FormMateContext.Consumer>
    </Modal>
  );
}

export default Form.create()(DetailFormModal);

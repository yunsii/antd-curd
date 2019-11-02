/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { callFunctionIfFunction } from '../../utils';
import styles from './index.less';
import { createFormItems } from '../../FormMate';
import Curd from '../../Curd';
import { queryPanelText } from '../../config';
import { searchFieldName } from '../../config';

const addAllowClearToItemsConfig = itemsConfig =>
  itemsConfig.map(item => {
    const { componentProps = {}, ...rest } = item;
    return {
      componentProps: {
        ...componentProps,
        allowClear: true,
      },
      ...rest,
    };
  });

export interface QueryPanelProps<T> {
  queryArgsConfig: any[];
  onSearch?: (fieldsValue: any) => void;
  onReset?: () => void;
  maxCount?: number;
  rowProps?: RowProps;
  colProps?: ColProps;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  updateSearchValue?: (fieldsValue: any) => any;
  wrappedComponentRef?: (self: QueryPanel<T>) => void;
  form?: WrappedFormUtils;
  reSearchAfterReset?: boolean;
  __curd__?: Curd<T>;
};

interface QueryPanelState {
  expandForm: boolean;
}

@(Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    const { onValuesChange } = props as any;
    if (onValuesChange) {
      onValuesChange(changedValues, allValues);
    }
  }
}) as any)
export default class QueryPanel<T> extends PureComponent<QueryPanelProps<T>, QueryPanelState> {
  state = {
    expandForm: false,
  };

  setSearchFormAndSearch = (fieldsValue) => {
    const { __curd__, updateSearchValue } = this.props;
    if (__curd__) {
      let newSearchValue = { ...fieldsValue };
      if (updateSearchValue) { newSearchValue = updateSearchValue(newSearchValue) }
      const { searchParams } = __curd__.state;

      __curd__.setState({
        searchForm: { ...newSearchValue },
        searchParams: {
          ...searchParams,
          [searchFieldName.page]: 1,
        },
      }, () => {
        __curd__.handleSearch();
      })
    }
  }

  handleFormReset = () => {
    const { form, onReset, onValuesChange, reSearchAfterReset, __curd__ } = this.props;
    form && form.resetFields();
    if (onValuesChange) {
      onValuesChange({}, {});
    }
    if (__curd__) {
      __curd__.setState({ searchForm: {}, searchParams: {} }, () => {
        if (reSearchAfterReset) {
          __curd__.handleSearch();
        }
      });
    }
    callFunctionIfFunction(onReset)();
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleSubmit = event => {
    if (event) { event.preventDefault(); }
    const { form, onSearch } = this.props;
    form && form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (onSearch) {
        onSearch(fieldsValue);
        return;
      }
      this.setSearchFormAndSearch(fieldsValue);
    });
  };

  renderForm() {
    const {
      form,
      queryArgsConfig = [],
      maxCount = 3,
      rowProps = {},
      colProps: customColProps,
    } = this.props;
    if (!queryArgsConfig.length) return null;
    let colProps: any = {
      xs: 24, sm: 12, lg: 8, xxl: 6,
    };
    if (customColProps) {
      colProps = customColProps;
    }
    const { expandForm } = this.state;
    let formItems = [];
    if (!expandForm) {
      formItems = addAllowClearToItemsConfig(queryArgsConfig).slice(0, maxCount);
    } else {
      formItems = addAllowClearToItemsConfig(queryArgsConfig);
    }

    const action = expandForm ? (
      <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
        {queryPanelText.collapse} <Icon type="up" />
      </a>
    ) : (
        <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
          {queryPanelText.expand} <Icon type="down" />
        </a>
      );
    const actions = (
      <div style={{ whiteSpace: 'nowrap' }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" htmlType="submit">
            {queryPanelText.search}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {queryPanelText.reset}
          </Button>
          {queryArgsConfig.length > maxCount ? action : null}
        </div>
      </div>
    );
    const items =
      [...createFormItems(form as any)(formItems, { labelCol: { span: 8 }, wrapperCol: { span: 16 } }), actions];

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Row type="flex" gutter={8} {...rowProps}>
          {items.map(item => (
            <Col {...colProps} key={item.key}>
              {item}
            </Col>
          ))}
        </Row>
      </Form>
    );
  }

  render() {
    return <div className={styles.searchForm}>{this.renderForm()}</div>;
  }
}

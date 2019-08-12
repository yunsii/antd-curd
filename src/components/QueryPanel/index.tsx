/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Icon, Button } from 'antd';
import { FormProps } from 'antd/lib/form';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { callFunctionIfFunction } from '../../utils';
import styles from './index.less';
import { FormMate } from '../../FormMate';
import Curd from '../../Curd';
import { queryPanelText } from '../../config';

const RowCount = [1, 2, 3, 4, 6, 8, 12, 24];
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

function calculateSpan(rowCount) {
  if (RowCount.includes(rowCount)) {
    return 24 / rowCount;
  }
  throw new Error(`QueryPanel: rowCount value only one of [${RowCount}]`);
}

export declare interface QueryPanelProps {
  queryArgsConfig: any[];
  onSearch?: (fieldsValue: any) => void;
  onReset?: () => void;
  rowCount?: 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;
  maxCount?: number;
  rowProps?: RowProps;
  colProps?: ColProps;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  updateSearchValue?: (fieldsValue: any) => any;
  wrappedComponentRef?: (self: QueryPanel) => void;
  form?: FormProps["form"];
  reSearchAfterReset?: boolean;
  __curd__?: Curd;
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
export default class QueryPanel extends PureComponent<QueryPanelProps, QueryPanelState> {
  state = {
    expandForm: false,
  };

  setSearchFormAndSearch = (fieldsValue) => {
    const { __curd__, updateSearchValue } = this.props;
    if (__curd__) {
      let newSearchValue = { ...fieldsValue };
      if (updateSearchValue) {
        newSearchValue = updateSearchValue(newSearchValue);
      }
      __curd__.setState({
        searchForm: { ...newSearchValue },
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
    if (event) {
      event.preventDefault();
    }
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
      rowCount = 3,
      maxCount = 2,
      rowProps = {},
      colProps: customColProps,
    } = this.props;
    if (!queryArgsConfig.length) return null;
    let colProps: any = { span: calculateSpan(rowCount) };
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
      <div style={{ overflow: 'hidden' }}>
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
      [...FormMate.createFormItems(formItems, { labelCol: { span: 8 }, wrapperCol: { span: 16 } }), actions];

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <FormMate.FormProvider value={form as any}>
          <Row type="flex" gutter={{ xs: 8, sm: 12, lg: 24, xl: 48 }} {...rowProps}>
            {items.map(item => (
              <Col {...colProps} key={item.key}>
                {item}
              </Col>
            ))}
          </Row>
        </FormMate.FormProvider>
      </Form>
    );
  }

  render() {
    return <div className={styles.searchForm}>{this.renderForm()}</div>;
  }
}

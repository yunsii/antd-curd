/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Icon, Button } from 'antd';
import { FormProps } from 'antd/lib/form';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { callFunctionIfFunction } from '../../utils';
import styles from './index.less';
import FormMateContext from '../../FormMateContext';
import Curd from '../../Curd';

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
  collapseText?: string;
  expandText?: string;
  searchText?: string;
  resetText?: string;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  updateSearchValue?: (fieldsValue: any) => any;
  wrappedComponentRef?: (self: QueryPanel) => void;
  form?: FormProps["form"];
  __curd__?: Curd;
};

interface QueryPanelState {
  expandForm: boolean;
}

@(Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    const { onValuesChange, __curd__, updateSearchValue } = props as any;
    if (onValuesChange) {
      onValuesChange(changedValues, allValues);
    }
    if (__curd__) {
      let newSearchValue = { ...allValues };
      if (updateSearchValue) {
        newSearchValue = updateSearchValue(newSearchValue);
      }
      __curd__.setState({ searchForm: newSearchValue });
    }
  }
}) as any)
export default class QueryPanel extends PureComponent<QueryPanelProps, QueryPanelState> {
  static defaultProps = {
    collapseText: '收起',
    expandText: '展开',
    searchText: '查询',
    resetText: '重置',
  }

  state = {
    expandForm: false,
  };

  handleFormReset = () => {
    const { form, onReset, onValuesChange } = this.props;
    form && form.resetFields();
    if (onValuesChange) {
      onValuesChange({}, {});
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
    event.preventDefault();
    const { form, onSearch } = this.props;
    form && form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (onSearch) {
        onSearch(fieldsValue);
        return;
      }
      this.handleSearch(fieldsValue)
    });
  };

  handleSearch = async (fieldsValue) => {
    const { __curd__, updateSearchValue } = this.props;
    if (__curd__) {
      const { modelName, dispatch } = __curd__.props;
      let newSearchValue = { ...fieldsValue };
      if (updateSearchValue) {
        newSearchValue = updateSearchValue(newSearchValue);
      }
      dispatch({
        type: `${modelName}/fetch`,
        payload: { ...newSearchValue },
      });
    }
  };

  renderForm() {
    const {
      form,
      queryArgsConfig = [],
      rowCount = 3,
      maxCount = 2,
      rowProps = {},
      colProps: customColProps,
      collapseText,
      expandText,
      searchText,
      resetText,
    } = this.props;
    if (!queryArgsConfig.length) return null;
    let colProps = { span: calculateSpan(rowCount) } as any;
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
        {collapseText} <Icon type="up" />
      </a>
    ) : (
        <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
          {expandText} <Icon type="down" />
        </a>
      );
    const actions = (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" htmlType="submit">
            {searchText}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {resetText}
          </Button>
          {queryArgsConfig.length > maxCount ? action : null}
        </div>
      </div>
    );
    const setFormItems = (createFormItems) => createFormItems ? [...createFormItems(formItems), actions] : [];

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <FormMateContext.Consumer>
          {({ FormProvider, createFormItems }) => {
            if (FormProvider && createFormItems) {
              return (
                <FormProvider value={form}>
                  <Row type="flex" gutter={{ md: 8, lg: 24, xl: 48 }} {...rowProps}>
                    {setFormItems(createFormItems).map(item => (
                      <Col {...colProps} key={item.key}>
                        {item}
                      </Col>
                    ))}
                  </Row>
                </FormProvider>
              )
            }
            return null;
          }}
        </FormMateContext.Consumer>
      </Form>
    );
  }

  render() {
    return <div className={styles.searchForm}>{this.renderForm()}</div>;
  }
}

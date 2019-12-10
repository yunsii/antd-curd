import React, { PureComponent } from 'react';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _filter from 'lodash/filter';
import { Row, Col, Form, Icon, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { callFunctionIfFunction } from '../../utils';
import styles from './index.less';
import { createFormItems } from '../../FormMate';
import Curd from '../../Curd';
import defaultLocale from '../../defaultLocale';
import ConfigContext, { ConfigContextProps } from '../../ConfigContext';
import DataContext, { SharedData } from '../../DataContext';
import { searchFieldName } from '../../defaultConfig';

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

export interface QueryPanelProps {
  queryArgsConfig: ItemConfig[];
  onSearch?: (fieldsValue: any) => void;
  onReset?: () => void;
  maxCount?: number;
  rowProps?: RowProps;
  colProps?: ColProps;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  updateSearchValue?: (fieldsValue: any) => any;
  wrappedComponentRef?: (self: QueryPanel) => void;
  form?: WrappedFormUtils;
  reSearchAfterReset?: boolean;
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

  pageFieldName = searchFieldName.page;

  __curd__?: Curd<any>;

  locale = {
    collapse: defaultLocale.queryPanel.collapse,
    expand: defaultLocale.queryPanel.expand,
    search: defaultLocale.queryPanel.search,
    reset: defaultLocale.queryPanel.reset,
  }

  public setFieldsValueAndSearch = (fieldsValue) => {
    const { form, queryArgsConfig } = this.props;
    const queryArgs = {};
    queryArgsConfig.map(item => item.field).forEach(item => {
      queryArgs[item] = undefined;
    })
    if (form) {
      console.log('new', { ...queryArgs, ...fieldsValue })
      form.setFieldsValue({ ...queryArgs, ...fieldsValue });
      this.setSearchFormAndSearch(fieldsValue);
    }
  }

  setSearchFormAndSearch = (fieldsValue) => {
    const { updateSearchValue } = this.props;
    if (this.__curd__) {
      let newSearchValue = { ...fieldsValue };
      if (updateSearchValue) { newSearchValue = updateSearchValue(newSearchValue) }
      const { searchParams } = this.__curd__.state;

      this.__curd__.setState({
        searchForm: { ...newSearchValue },
        searchParams: {
          ...searchParams,
          [this.pageFieldName]: 1,
        },
      }, () => {
        this.__curd__ && this.__curd__.handleSearch();
      })
    }
  }

  handleFormReset = () => {
    const { form, onReset, onValuesChange, reSearchAfterReset } = this.props;
    form && form.resetFields();
    if (onValuesChange) {
      onValuesChange({}, {});
    }
    if (this.__curd__) {
      this.__curd__.setState({ searchForm: {}, searchParams: {} }, () => {
        if (reSearchAfterReset) {
          this.__curd__ && this.__curd__.handleSearch();
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

  setWantedConfig = ({ setLocale, searchFieldName }: ConfigContextProps) => {
    this.locale = {
      ...this.locale,
      ..._get(setLocale, 'queryPanel', {}),
    };
    const pageFieldName = _get(searchFieldName, 'page');
    if (pageFieldName) {
      this.pageFieldName = pageFieldName;
    }
  }

  setCurd = ({ __curd__ }: SharedData<any>) => {
    if (!__curd__) {
      console.warn('Warning: QueryPanel got no __curd__ object.');
    }
    this.__curd__ = __curd__;
  }

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
        {this.locale.collapse} <Icon type="up" />
      </a>
    ) : (
        <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
          {this.locale.expand} <Icon type="down" />
        </a>
      );
    const actions = (
      <div style={{ whiteSpace: 'nowrap' }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" htmlType="submit">
            {this.locale.search}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {this.locale.reset}
          </Button>
          {queryArgsConfig.length > maxCount ? action : null}
        </div>
      </div>
    );
    const items =
      [...createFormItems(form as any)(formItems, { labelCol: { span: 8 }, wrapperCol: { span: 16 } }), actions];

    return (
      <ConfigContext.Consumer>
        {(config) => {
          this.setWantedConfig(config);
          return (
            <DataContext.Consumer>
              {data => {
                this.setCurd(data);
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
              }}
            </DataContext.Consumer>
          );
        }}
      </ConfigContext.Consumer>
    );
  }

  render() {
    return <div className={styles.searchForm}>{this.renderForm()}</div>;
  }
}

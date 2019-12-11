import React, { PureComponent } from 'react';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _filter from 'lodash/filter';
import { Row, Col, Form, Icon, Button } from 'antd';
import { WrappedFormUtils, FormComponentProps } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import { RowProps } from 'antd/lib/row';
import { ColProps } from 'antd/lib/col';
import { createFormItems } from '../../FormMate';
import defaultLocale from '../../defaultLocale';
import styles from './index.less';

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

export type QueryPanelLocale = 'collapse' | 'expand' | 'search' | 'reset';

export interface QueryPanelProps extends FormComponentProps {
  queryArgsConfig: ItemConfig[];
  onSearch?: (fieldsValue: any) => void;
  onReset?: () => void;
  maxCount?: number;
  rowProps?: RowProps;
  colProps?: ColProps;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  updateSearchValue?: (fieldsValue: any) => any;
  setLocale?: {
    [k in QueryPanelLocale]?: any;
  }
  getFormInstance?: (form: WrappedFormUtils) => void;
};

interface QueryPanelState {
  expandForm: boolean;
}

class QueryPanel extends PureComponent<QueryPanelProps, QueryPanelState> {
  state = {
    expandForm: false,
  };

  handleFormReset = () => {
    const {
      form,
      onValuesChange = () => { },
      onReset = () => { },
    } = this.props;
    form && form.resetFields();
    onValuesChange({}, {});
    onReset();
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleSubmit = event => {
    if (event) { event.preventDefault(); }
    const { form, onSearch = () => { } } = this.props;
    form && form.validateFields((err, fieldsValue) => {
      if (err) return;
      onSearch(fieldsValue);
    });
  };

  getLocale = (field: QueryPanelLocale) => {
    const { setLocale = {} } = this.props;
    return setLocale[field] || defaultLocale.queryPanel[field];
  }

  renderForm() {
    const {
      form,
      queryArgsConfig = [],
      maxCount = 3,
      rowProps = {},
      colProps: customColProps,
      getFormInstance = () => { },
    } = this.props;
    const { expandForm } = this.state;
    getFormInstance(form);

    if (!queryArgsConfig.length) return null;

    const colProps: ColProps = customColProps || {
      xs: 24, sm: 12, lg: 8, xxl: 6,
    };

    let formItems = [];
    if (!expandForm) {
      formItems = addAllowClearToItemsConfig(queryArgsConfig).slice(0, maxCount);
    } else {
      formItems = addAllowClearToItemsConfig(queryArgsConfig);
    }

    const extraAction = expandForm ? (
      <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
        {this.getLocale('collapse')} <Icon type="up" />
      </a>
    ) : (
        <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
          {this.getLocale('expand')} <Icon type="down" />
        </a>
      );
    const actions = (
      <div style={{ whiteSpace: 'nowrap' }}>
        <div style={{ marginBottom: 24 }}>
          <Button type="primary" htmlType="submit">
            {this.getLocale('search')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {this.getLocale('reset')}
          </Button>
          {queryArgsConfig.length > maxCount ? extraAction : null}
        </div>
      </div>
    );

    const items =
      [...createFormItems(form as any)(formItems, { labelCol: { span: 8 }, wrapperCol: { span: 16 } }), actions];

    return (
      <Form onSubmit={this.handleSubmit} layout="inline">
        <Row type="flex" gutter={8} {...rowProps}>
          {items.map(item => (
            <Col {...colProps} key={item.key!}>
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

export default Form.create<QueryPanelProps>({
  onValuesChange: (props, changedValues, allValues) => {
    const { onValuesChange } = props as any;
    if (onValuesChange) {
      onValuesChange(changedValues, allValues);
    }
  }
})(QueryPanel);

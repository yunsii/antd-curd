import React, { PureComponent, useContext, forwardRef } from 'react';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _filter from 'lodash/filter';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { callFunctionIfFunction } from '../../utils';
import Curd from '../../Curd';
import ConfigContext from '../../ConfigContext';
import DataContext from '../../DataContext';
import QueryPanel, { QueryPanelProps } from './QueryPanel';
import { searchFieldName } from '../../defaultConfig';

export interface CurdQueryPanelProps extends Omit<QueryPanelProps, 'form' | 'onSearch'> {
  reSearchAfterReset?: boolean;
  pageFieldName?: string;
  __curd__?: Curd<any>;
  ref?: React.Ref<CurdQueryPanel>;
};

interface CurdQueryPanelState {
  expandForm: boolean;
}

export class CurdQueryPanel extends PureComponent<CurdQueryPanelProps, CurdQueryPanelState> {
  form: WrappedFormUtils;

  public setFieldsValueAndSearch = (fieldsValue) => {
    const { queryArgsConfig } = this.props;
    const queryArgs = {};
    queryArgsConfig.map(item => item.field).forEach(item => {
      queryArgs[item] = undefined;
    })
    if (this.form) {
      console.log('new', { ...queryArgs, ...fieldsValue })
      this.form.setFieldsValue({ ...queryArgs, ...fieldsValue });
      this.setSearchFormAndSearch(fieldsValue);
    }
  }

  setSearchFormAndSearch = (fieldsValue) => {
    const { updateSearchValue, __curd__ } = this.props;
    const searchForm = updateSearchValue ? updateSearchValue(fieldsValue) : fieldsValue;
    const searchParams = { [this.getPageFieldName()]: 1 };

    if (__curd__) {
      __curd__.setState({
        searchForm,
        searchParams,
      }, () => {
        __curd__ && __curd__.handleSearch();
      });
    }
  }

  handleFormReset = () => {
    const { onReset, onValuesChange, reSearchAfterReset, __curd__ } = this.props;
    this.form && this.form.resetFields();
    if (onValuesChange) {
      onValuesChange({}, {});
    }
    if (__curd__) {
      __curd__.setState(
        {
          searchForm: {},
          searchParams: {}
        },
        () => {
          if (reSearchAfterReset) {
            __curd__ && __curd__.handleSearch();
          }
        }
      );
    }
    callFunctionIfFunction(onReset)();
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  getPageFieldName = () => {
    const { pageFieldName } = this.props;
    return pageFieldName || searchFieldName.page;
  }

  getFormInstance = (form: WrappedFormUtils) => {
    const { getFormInstance = () => { } } = this.props;
    this.form = form;
    getFormInstance(form);
  }

  render() {
    const {
      reSearchAfterReset,
      ...rest
    } = this.props;
    return (
      <QueryPanel
        {...rest}
        onSearch={this.setSearchFormAndSearch}
        onReset={this.handleFormReset}
        getFormInstance={this.getFormInstance}
      />
    );
  }
}

const CurdQueryPanelWithContext: React.FC<CurdQueryPanelProps> = forwardRef((props, ref: any) => {
  const { setLocale: setLocaleGlobal, searchFieldName } = useContext(ConfigContext);
  const { __curd__ } = useContext(DataContext);
  const { setLocale, pageFieldName, ...rest } = props;

  const pageFieldNameGlobal = _get(searchFieldName, 'page');
  const queryPanelLocaleGlobal = _get(setLocaleGlobal, 'queryPanel', {});
  return (
    <CurdQueryPanel
      {...rest}
      ref={ref}
      __curd__={__curd__}
      setLocale={{ ...queryPanelLocaleGlobal, ...setLocale }}
      pageFieldName={pageFieldName || pageFieldNameGlobal}
    />
  )
})

export default CurdQueryPanelWithContext;
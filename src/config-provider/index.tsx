import React from 'react';
import _merge from 'lodash/merge';
import { WrappedFormUtils } from "antd/lib/form/Form";
import { ItemConfig, Layout } from 'antd-form-mate/dist/lib/props';
import {
  formatSorter as formatSorterDefault,
  searchFieldName as searchFieldNameDefault,
  debounceWait as debounceWaitDefault,
} from '../defaultConfig';
import defaultLocale from '../defaultLocale';
import ConfigContext, { ConfigConsumerProps } from './context';

export interface ACLocaleProps {
  curd?: {
    createOk?: string;
    updateOk?: string;
    deleteOk?: string;
  },
  queryPanel?: {
    collapse?: string;
    expand?: string;
    search?: string;
    reset?: string;
  },
  drawer?: {
    ok?: string;
    cancel?: string;
  },
}

export interface SearchFieldNameProps {
  page?: string;
  limit?: string;
  sortor?: string;
}

export interface ConfigProviderProps {
  acLocale?: ACLocaleProps;
  /** only set how to format sorter, it's invalid if set container's handleFilterAndSort */
  formatSorter?: typeof formatSorterDefault;
  searchFieldName?: SearchFieldNameProps;
  debounceWait?: number;
  createFormItemsFn?: (form: WrappedFormUtils) => (
    itemsConfig: ItemConfig[],
    formLayout?: Layout,
  ) => JSX.Element[];
  children?: React.ReactNode;
}

function initState(props: ConfigProviderProps) {
  const {
    acLocale,
    formatSorter,
    searchFieldName,
    debounceWait,
    createFormItemsFn = () => () => ([]),
  } = props;

  const config: ConfigConsumerProps = {
    acLocale: _merge(defaultLocale, acLocale),
    formatSorter: formatSorter || formatSorterDefault,
    searchFieldName: {
      ...searchFieldNameDefault,
      ...searchFieldName,
    },
    debounceWait: debounceWait || debounceWaitDefault,
    createFormItemsFn,
  }

  return config;
}

export class ConfigProvider extends React.PureComponent<ConfigProviderProps> {

  state = initState(this.props);

  render() {
    const { children } = this.props;
    return (
      <ConfigContext.Provider value={this.state}>
        {children}
      </ConfigContext.Provider>
    );
  }
}

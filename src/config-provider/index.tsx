import React from 'react';
import _merge from 'lodash/merge';
import {
  formatSorter as formatSorterDefault,
  searchFieldName as searchFieldNameDefault,
  SearchFieldNameProps,
  debounceWait as debounceWaitDefault,
} from '../defaultConfig';
import defaultLocale, { ACLocaleProps } from '../defaultLocale';
import ConfigContext, { ConfigConsumerProps } from './context';

export interface ConfigProviderProps {
  acLocale?: ACLocaleProps;
  /** only set how to format sorter, it's invalid if set container's handleFilterAndSort */
  formatSorter?: typeof formatSorterDefault;
  searchFieldName?: SearchFieldNameProps;
  debounceWait?: number;
  children?: React.ReactNode;
}

export class ConfigProvider extends React.Component<ConfigProviderProps> {
  renderProvider = () => {
    const {
      acLocale,
      formatSorter,
      searchFieldName,
      debounceWait,

      children,
    } = this.props;

    const config: ConfigConsumerProps = {
      acLocale: _merge(defaultLocale, acLocale),
      formatSorter: formatSorter || formatSorterDefault,
      searchFieldName: {
        ...searchFieldNameDefault,
        ...searchFieldName,
      },
      debounceWait: debounceWait || debounceWaitDefault,
    }

    return (
      <ConfigContext.Provider value={config}>
        {children}
      </ConfigContext.Provider>
    )
  }

  render() {
    return this.renderProvider();
  }
}

ConfigContext.displayName = 'antd-curd\'s ConfigContext';

export default ConfigContext;
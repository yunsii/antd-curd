import React from 'react';
import {
  formatSorter,
  searchFieldName,
  debounceWait,
} from '../defaultConfig';
import defaultLocale from '../defaultLocale';

export interface ConfigConsumerProps {
  acLocale: typeof defaultLocale;
  /** only set how to format sorter, it's invalid if set container's handleFilterAndSort */
  formatSorter: typeof formatSorter;
  searchFieldName: typeof searchFieldName;
  debounceWait: number;
}

export const ConfigContext = React.createContext<ConfigConsumerProps>({
  acLocale: defaultLocale,
  formatSorter: formatSorter,
  searchFieldName: searchFieldName,
  debounceWait: debounceWait,
});

ConfigContext.displayName = 'antd-curd\'s ConfigContext';

export default ConfigContext;
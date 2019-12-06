import React from 'react';
import { formatSorter, debounceWait } from './defaultConfig';

export interface SetLocale {
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

export interface SearchFieldName {
  page?: string;
  limit?: string;
  sortor?: string;
}

export interface ConfigContextProps {
  setLocale?: SetLocale;
  /** only set how to format sorter, it's invalid if set container's handleFilterAndSort */
  formatSorter?: typeof formatSorter;
  searchFieldName?: SearchFieldName;
  debounceWait?: number;
}

export const ConfigContext = React.createContext<ConfigContextProps>({
  debounceWait,
});
export default ConfigContext;

export const ConfigProvider = ConfigContext.Provider;

ConfigContext.displayName = 'antd-curd\'s ConfigContext';

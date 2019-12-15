import React from 'react';
import { WrappedFormUtils } from "antd/lib/form/Form";
import { ItemConfig, Layout } from 'antd-form-mate/dist/lib/props';
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
  createFormItemsFn: (form: WrappedFormUtils) => (
    itemsConfig: ItemConfig[],
    formLayout?: Layout,
  ) => JSX.Element[];
}

export const ConfigContext = React.createContext<ConfigConsumerProps>({
  acLocale: defaultLocale,
  formatSorter: formatSorter,
  searchFieldName: searchFieldName,
  debounceWait: debounceWait,
  createFormItemsFn: () => () => ([]),
});

ConfigContext.displayName = 'antd-curd\'s ConfigContext';

export default ConfigContext;
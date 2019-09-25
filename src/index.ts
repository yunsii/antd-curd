import {
  setQueryPanelText,
  setDetailFormDrawerText,
  setFormatSorter,
  setSearchFieldName,
} from './config';

export const config = {
  setQueryPanelText,
  setDetailFormDrawerText,
  /** only set how to format sorter, not set container's handleFilterAndSort */
  setFormatSorter,
  setSearchFieldName,
}

export { default as Curd } from './Curd';
export { createFormItems, config as formMateConfig, locale as formMateLocale } from './FormMate';

export { default as StandardTable } from './components/StandardTable';
export { default as StandardList } from './components/StandardList';

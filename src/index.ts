import {
  setQueryPanelText,
  setDetailFormDrawerText,
  setFormatSorter,
  setSearchFieldName,
  setDebounceWait,
} from './config';

export const config = {
  setQueryPanelText,
  setDetailFormDrawerText,
  /** only set how to format sorter, not set container's handleFilterAndSort */
  setFormatSorter,
  setSearchFieldName,
  setDebounceWait,
}

export { default as Curd } from './Curd';
export { createFormItems, config as formMateConfig, locale as formMateLocale } from './FormMate';

export { default as StandardTable } from './components/StandardTable';
export { default as StandardList } from './components/StandardList';
export { default as DetailFormModal } from './components/DetailFormModal';
export { default as DetailFormDrawer } from './components/DetailFormDrawer';

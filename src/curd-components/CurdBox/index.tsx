import React, { PureComponent, useContext } from 'react';
import _pick from 'lodash/pick';
import _omit from 'lodash/omit';
import _cloneDeep from 'lodash/cloneDeep';
import _get from 'lodash/get';
import { message } from 'antd';
import { FormProps } from 'antd/lib/form';
import { PaginationConfig, SorterResult, TableCurrentDataSource } from 'antd/lib/table';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import { CreateName, DetailName, UpdateName, DeleteName } from '../../constants';
import DetailDrawer from '../../components/DetailDrawer/index';
import DetailModal, { PopupProps } from '../../components/DetailModal/index';
import { DetailModalProps } from '../../components/DetailModal/index';
import { DetailDrawerProps } from '../../components/DetailDrawer/index';
import Curd from '../../Curd';
import Operators from './Operators/index';
import { setActions, ActionType } from './actions/index';
import { injectChildren } from '../../utils';
import ConfigContext, { SearchFieldName } from '../../ConfigContext';
import DataContext from '../../DataContext';
import { formatSorter as formatSorterDefault, searchFieldName as searchFieldNameDefault } from '../../defaultConfig';
import defaultLocale from '../../defaultLocale';

export type CustomDetailDrawerProps = Omit<DetailDrawerProps, 'setItemsConfig' | 'loading' | 'form' | 'onOk'>
export type CustomDetailModalProps = Omit<DetailModalProps, 'setItemsConfig' | 'loading' | 'form'>

export type PopupMode = 'create' | 'detail' | 'update';
export type CurdlLocale = 'createOk' | 'updateOk' | 'deleteOk';

const getValue = (obj) => Object.keys(obj).map((key) => obj[key]).join(',');

async function updateFieldsValueByInterceptors<T>(fieldsValue, interceptors: CurdBoxProps<T>['interceptors'] = {}, mode) {
  const { updateFieldsValue } = interceptors;
  let newFieldsValue = _cloneDeep(fieldsValue);
  if (updateFieldsValue) {
    newFieldsValue = await updateFieldsValue(fieldsValue, mode);
  }
  return newFieldsValue;
}

export interface ActionsConfig<T> {
  showActionsCount?: number;
  extraActions?: ActionType<T>[];
  /** number[] or [number, setTitle()][] */
  confirmKeys?: (number | [number, (record?: T) => string])[];
  confirmProps?: PopconfirmProps;
  hideActions?: number[] | ((record?: T) => void | number[]);
  disabledActions?: (record?: T) => void | number[];
  detailActionTitle?: string;
  updateActionTitle?: string;
  deleteActionTitle?: string;
}

const curdBoxProps = [
  'fetchLoading',
  'deleteLoading',
  'createLoading',
  'detailLoading',
  'updateLoading',
  'createButtonName',
  'popupType',
  'popupProps',
  'setFormItemsConfig',
  'afterPopupClose',
  'interceptors',
  'detail',
  'actionsConfig',
  'showOperators',
  'extraOperators',
  'dispatch',
  'autoFetch',
  'reSearchAfterUpdate',
  '__curd__',

  'setLocale',
  'formatSorter',
  'searchFieldName',
]

export interface CurdBoxProps<T> {
  modelName?: string;
  title?: {
    create?: any;
    detail?: any;
    update?: any;
  },
  fetchLoading?: boolean;
  deleteLoading?: boolean;
  createLoading?: boolean;
  detailLoading?: boolean;
  updateLoading?: boolean;
  /** if value is falsy, hide the button */
  createButtonName?: string | false | null;
  popup?: JSX.Element | 'modal' | 'drawer' | false | null;
  popupProps?: CustomDetailDrawerProps | CustomDetailModalProps;
  setFormItemsConfig: (detail: any, mode: PopupMode, form?: FormProps['form']) => ItemConfig[];
  afterPopupClose?: (mode: PopupMode) => void;
  interceptors?: {
    /** update form values after click ok */
    updateFieldsValue?: (fieldsValue: T, mode?: 'create' | 'update') => T;
    /** callback on click create button, will break default behavior if return value is true */
    handleCreateClick?: () => boolean | undefined;
    /** callback on click detail button, will break default behavior if return value is true */
    handleDetailClick?: (record: T) => boolean | undefined;
    /** callback on click update button, will break default behavior if return value is true */
    handleUpdateClick?: (record: T) => boolean | undefined;
    handleDeleteClick?: (record: T) => void;
    /** custom how to generate params to query when change of filter or sorter */
    handleFilterAndSort?: (
      filtersArg: Record<keyof any, string[]>,
      sorter: SorterResult<any>,
      extra?: TableCurrentDataSource<any>
    ) => any;
  };
  detail?: {};
  actionsConfig?: ActionsConfig<T> | false | null;
  showOperators?: boolean;
  extraOperators?: JSX.Element[];
  dispatch?: any;
  /** call model's fetch effect when componentDidMount */
  autoFetch?: boolean;
  reSearchAfterUpdate?: boolean;
  __curd__?: Curd<T>;

  setLocale?: {
    createOk?: string;
    updateOk?: string;
    deleteOk?: string;
  };
  formatSorter?: typeof formatSorterDefault;
  searchFieldName?: SearchFieldName;
}

interface CurdState<T> {
  mode: PopupMode;
  popupVisible: boolean;
  record: T;
}

export default class CurdBox<T extends { id: number | string }> extends PureComponent<CurdBoxProps<T>, CurdState<T>> {
  static defaultProps = {
    fetchLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    createButtonName: '新建',
    dispatch: () => { },
    queryArgsConfig: [],
    queryPanelProps: {},
    containerType: 'table',
    containerProps: {},
    actionsConfig: {},
    popupType: 'drawer',
    popupProps: {},
    setFormItemsConfig: () => [],
    interceptors: {},
    showOperators: true,
    autoFetch: true,
    reSearchAfterUpdate: false,
    afterPopupClose: () => { },
    __curd__: null
  };

  state = {
    mode: 'create' as PopupMode,
    popupVisible: false,
    record: {} as T,
  };

  componentDidMount() {
    const { dispatch, autoFetch, modelName } = this.props;
    autoFetch && dispatch({ type: `${modelName}/fetch` });
  }

  willFetchDetail = () => DetailName in this.props && 'detailLoading' in this.props;

  fetchDetailOrNot = (record: T) => {
    const { dispatch, modelName } = this.props;
    if (this.willFetchDetail()) {
      dispatch({
        type: `${modelName}/detail`,
        id: record.id,
      });
    }
  };

  // handlePopupOpen = (action: PopupMode, record?: T) => {
  //   const { interceptors = {} } = this.props;
  //   const { handleCreateClick } = interceptors;
  //   if (handleCreateClick && action === CreateName) {
  //     const isBreak = handleCreateClick();
  //     if (isBreak) return;
  //   }
  //   this.setState({
  //     mode: action,
  //     popupVisible: true,
  //     record: record || {} as T,
  //   });
  // };

  handleDefaultActionClick = (action: PopupMode | 'delete', record?: T) => {
    const { interceptors = {} } = this.props;
    const {
      handleCreateClick,
      handleDetailClick,
      handleUpdateClick,
      handleDeleteClick,
    } = interceptors;
    if (action === CreateName) {
      if (handleCreateClick) {
        const isBreak = handleCreateClick();
        if (isBreak) return;
      }
    } else if (action === DetailName) {
      if (handleDetailClick) {
        const isBreak = handleDetailClick(record!);
        if (isBreak) return;
      }
      this.fetchDetailOrNot(record!);
    } else if (action === UpdateName) {
      if (handleUpdateClick) {
        const isBreak = handleUpdateClick(record!);
        if (isBreak) return;
      }
      this.fetchDetailOrNot(record!);
    } else if (action === DeleteName) {
      if (handleDeleteClick) {
        handleDeleteClick(record!);
        return;
      }
      this.deleteModel(record!.id);
      return;
    }
    this.setState({
      mode: action,
      popupVisible: true,
      record: record || {} as T,
    });
  };

  closePopup = () => { this.setState({ popupVisible: false }) };

  handlePopupAfterClose = () => {
    const { dispatch, modelName, afterPopupClose = () => { } } = this.props;
    const { mode } = this.state;
    console.log('handlePopupAfterClose', mode)
    if (mode === 'detail' || mode === 'update') {
      dispatch({
        type: `${modelName}/_saveDetail`,
        payload: {},
      });
    }
    afterPopupClose(mode);
  }

  reSearch = (type?: 'create' | 'update' | 'delete') => {
    const { __curd__ } = this.props;
    if (__curd__) {
      __curd__.handleSearch(type);
    }
  };

  deleteModel = (id: T['id']) => {
    const { dispatch, modelName } = this.props;
    dispatch({
      type: `${modelName}/delete`,
      id,
      onOk: () => {
        message.success(this.getLocale('deleteOk'));
        this.reSearch('delete');
      },
    });
  };

  renderActions = (record: T) => {
    const { actionsConfig } = this.props;
    if (actionsConfig) {
      const { confirmKeys, ...rest } = actionsConfig;
      return setActions(record, this.handleDefaultActionClick, {
        ...rest,
        confirmKeys: confirmKeys || [12]
      });
    }
    return null;
  };

  getPopupTitle = () => {
    const { title } = this.props;
    const { mode } = this.state;
    return {
      create: '新建对象',
      detail: '对象详情',
      update: '编辑对象',
      ...title,
    }[mode]
  };

  handleCreateOk = async (fieldsValue) => {
    console.log('handleCreateOk', fieldsValue);
    const { interceptors, dispatch, modelName } = this.props;
    const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, CreateName);
    if (!newFieldsValue) return;
    dispatch({
      type: `${modelName}/create`,
      payload: newFieldsValue,
      onOk: () => {
        message.success(this.getLocale('createOk'));
        this.closePopup();
        this.reSearch('create');
      }
    });
  };

  handleUpdateOk = async (fieldsValue) => {
    console.log('handleUpdateOk', fieldsValue);
    const { dispatch, interceptors, reSearchAfterUpdate, modelName } = this.props;
    const { record } = this.state;
    const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, UpdateName);
    if (!newFieldsValue) return;
    dispatch({
      type: `${modelName}/update`,
      id: record.id,
      payload: newFieldsValue,
      onOk: () => {
        message.success(this.getLocale('updateOk'));
        this.closePopup();
        if (reSearchAfterUpdate) {
          this.reSearch('update');
        }
      }
    });
  };

  handleOk = (fieldsValue) => {
    const { mode } = this.state;
    if (mode === DetailName) {
      this.closePopup();
      return;
    }
    if (mode === UpdateName) {
      this.handleUpdateOk(fieldsValue);
      return;
    }
    this.handleCreateOk(fieldsValue);
  };

  defaultHandleFilterAndSort = (
    filtersArg = {} as Record<keyof any, string[]>,
    sorter = {} as SorterResult<any>,
    extra?: TableCurrentDataSource<any>
  ) => {
    console.log(filtersArg, sorter);
    let result: any = {};
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      if (filtersArg[key]) {
        newObj[key] = getValue(filtersArg[key]);
      }
      return newObj;
    }, {});
    result = {
      ...filters
    };
    if (sorter.field) {
      result[this.getSearchFieldName('sortor')] = this.getFormatSorter()(sorter);
    }
    return { ...result };
  }

  // https://ant.design/components/table-cn/#components-table-demo-reset-filter
  // 只支持一个 sorter
  handleDataChange = (
    pagination: PaginationConfig,
    filtersArg = {} as Record<keyof any, string[]>,
    sorter = {} as SorterResult<any>,
    extra?: TableCurrentDataSource<any>
  ) => {
    // console.log('pagination', pagination);
    // console.log('filtersArg', filtersArg);
    // console.log('sorter', sorter);
    const { interceptors = {}, __curd__ } = this.props;
    const { handleFilterAndSort = () => { } } = interceptors;

    const hasCustomFilterAndSorter: boolean = handleFilterAndSort && handleFilterAndSort(filtersArg, sorter, extra);

    const params = {
      [this.getSearchFieldName('page')]: pagination.current,
      [this.getSearchFieldName('limit')]: pagination.pageSize,
      ...hasCustomFilterAndSorter
        ? handleFilterAndSort(filtersArg, sorter, extra)
        : this.defaultHandleFilterAndSort(filtersArg, sorter, extra)
    };

    // console.log('changed params', params);
    // sync curd's searchParams
    if (__curd__) {
      __curd__.setState({ searchParams: params }, () => {
        __curd__.handleSearch();
      });
    }
  };

  getLocale = (field: CurdlLocale) => {
    const { setLocale = {} } = this.props;
    return setLocale[field] || defaultLocale.curd[field];
  }

  getSearchFieldName = (field: 'page' | 'limit' | 'sortor') => {
    const { searchFieldName = {} } = this.props;
    return searchFieldName[field] || searchFieldNameDefault[field];
  }

  getFormatSorter = () => {
    const { formatSorter } = this.props;
    return formatSorter || formatSorterDefault;
  }

  renderOperators = () => {
    const { showOperators, createButtonName, extraOperators } = this.props;
    return showOperators && (
      <Operators
        createButtonName={createButtonName}
        handleCreateClick={() => { this.handleDefaultActionClick(CreateName) }}
      >
        {extraOperators}
      </Operators>
    )
  }

  renderContainer = () => {
    const { actionsConfig, children, fetchLoading, deleteLoading } = this.props;
    return injectChildren(children, {
      actionsConfig,
      renderActions: this.renderActions,
      handleDataChange: this.handleDataChange,
      loading: fetchLoading || deleteLoading,
    });
  };

  renderPopup = () => {
    let result: React.ReactNode = null;
    const {
      detail,
      createLoading,
      detailLoading,
      updateLoading,
      setFormItemsConfig,
      popup,
      popupProps,
    } = this.props;
    const { drawerProps, modalProps, ...restPopupProps } = popupProps as any;
    const loading = createLoading || detailLoading || updateLoading;
    const { mode, popupVisible, record } = this.state;
    const isDetailMode = [DetailName, UpdateName].includes(mode);
    const displayDetail = this.willFetchDetail() && isDetailMode ? detail : record;

    const commenPopupProps: Omit<PopupProps, 'form'> = {
      title: this.getPopupTitle(),
      visible: popupVisible,
      onClose: this.closePopup,
      afterClose: this.handlePopupAfterClose,
      mode,
      loading,
      onOk: this.handleOk,
      setItemsConfig: (form: WrappedFormUtils) => setFormItemsConfig(displayDetail, mode, form),
    };

    if (popup === 'drawer') {
      result = (
        <DetailDrawer
          drawerProps={drawerProps}
          {...commenPopupProps}
          {...restPopupProps}
        />
      );
    } else if (popup === 'modal') {
      result = (
        <DetailModal
          modalProps={modalProps}
          {...commenPopupProps}
          {...restPopupProps}
        />
      );
    } else if (popup) {
      result = React.cloneElement(popup, { ...commenPopupProps });
    }
    return result;
  };

  render() {
    return (
      <>
        {this.renderOperators()}
        {this.renderContainer()}
        {this.renderPopup()}
      </>
    );
  }
}

export interface InjectContainerProps<T extends { id: number | string }> {
  renderActions: CurdBox<T>['renderActions'];
  handleDataChange: CurdBox<T>['handleDataChange'];
}

export function withCurdBox<P>(WrappedComponent: React.ComponentClass<P> | React.FC<P>) {
  function WithCurdBox<P, T>(props: Omit<P & CurdBoxProps<T>, keyof InjectContainerProps<T & { id: number | string }>>) {
    if (!WrappedComponent) { return null; }

    const {
      setLocale: setLocaleGlobal,
      searchFieldName: searchFieldNameGlobal,
      formatSorter: formatSorterGlobal,
    } = useContext(ConfigContext);
    const { __curd__, modelName } = useContext(DataContext);
    const { setLocale, searchFieldName, formatSorter, ...rest } = props;

    const mergeProps = {
      ...rest,
      setLocale: {
        ..._get(setLocaleGlobal, 'curd', {}),
        ...setLocale,
      },
      formatSorter: formatSorter || formatSorterGlobal,
      searchFieldName: {
        ...searchFieldNameGlobal || {},
        ...searchFieldName,
      },
    }

    return (
      <CurdBox
        {..._pick(mergeProps, curdBoxProps)}
        __curd__={__curd__}
        modelName={modelName}
      >
        <WrappedComponent {..._omit(mergeProps, curdBoxProps) as any} />
      </CurdBox>
    )
  }

  return WithCurdBox;
}

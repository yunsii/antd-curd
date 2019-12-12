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
import { CreateName, DetailName, UpdateName } from '../../constants';
import DetailFormDrawer from '../../components/DetailDrawer/index';
import DetailFormModal from '../../components/DetailModal/index';
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

export type CustomDetailFormDrawerProps = Omit<DetailDrawerProps, 'setItemsConfig' | 'loading' | 'form' | 'onOk'>
export type CustomDetailFormModalProps = Omit<DetailModalProps, 'setItemsConfig' | 'loading' | 'form'>

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
  'createTitle',
  'detailTitle',
  'updateTitle',
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
  /** popup title of create */
  createTitle?: string;
  /** popup title of detail */
  detailTitle?: string;
  /** popup title of update */
  updateTitle?: string;
  fetchLoading?: boolean;
  deleteLoading?: boolean;
  createLoading?: boolean;
  detailLoading?: boolean;
  updateLoading?: boolean;
  /** if value is '' or false, hide the button */
  createButtonName?: string | false | null;
  popup?: JSX.Element | 'modal' | 'drawer' | false | null;
  popupProps?: CustomDetailFormDrawerProps | CustomDetailFormModalProps;
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
    createTitle: '新建对象',
    detailTitle: '对象详情',
    updateTitle: '编辑对象',
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
    if (autoFetch) {
      dispatch({
        type: `${modelName}/fetch`,
      });
    }
  }

  willFetchDetail = () => {
    return DetailName in this.props && 'detailLoading' in this.props;
  };

  fetchDetail = (record: T) => {
    const { dispatch, modelName } = this.props;
    dispatch({
      type: `${modelName}/detail`,
      id: record.id
    });
  };

  fetchDetailOrNot = (record: T) => {
    if (this.willFetchDetail()) {
      this.fetchDetail(record);
    }
  };

  handleVisible = (action: PopupMode, visible, record?: T) => {
    const { interceptors = {} } = this.props;
    const { handleCreateClick } = interceptors;
    if (handleCreateClick && action === CreateName) {
      const isBreak = handleCreateClick();
      if (isBreak) return;
    }
    this.setState({
      mode: action,
      popupVisible: true,
    });
    if (visible) {
      this.setState({
        record: record || {} as T,
      });
    }
  };

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

  setActionsMethod = () => {
    const { interceptors } = this.props;
    return {
      fetchDetailOrNot: this.fetchDetailOrNot,
      handleVisible: this.handleVisible,
      deleteModel: this.deleteModel,
      interceptors
    };
  };

  renderActions = (record: T) => {
    const { actionsConfig } = this.props;
    if (actionsConfig) {
      const { confirmKeys, ...rest } = actionsConfig;
      return setActions(record, this.setActionsMethod(), {
        ...rest,
        confirmKeys: confirmKeys || [12]
      });
    }
    return null;
  };

  getPopupTitle = () => {
    const { createTitle, detailTitle, updateTitle } = this.props;
    const { mode } = this.state;
    if (mode === DetailName) {
      return detailTitle;
    }
    if (mode === UpdateName) {
      return updateTitle;
    }
    return createTitle;
  };

  closePopup = () => this.setState({ popupVisible: false });

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

  handlePopupClose = () => {
    const { dispatch, modelName, afterPopupClose = () => { } } = this.props;
    const { mode } = this.state;
    console.log('handlePopupClose', mode)
    if (mode === 'detail' || mode === 'update') {
      dispatch({
        type: `${modelName}/_saveDetail`,
        payload: {},
      });
    }
    afterPopupClose(mode);
  }

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

    const commenPopupProps = {
      title: this.getPopupTitle(),
      visible: popupVisible,
      onCancel: this.closePopup,
      onClose: this.closePopup
    };

    if (popup === 'drawer') {
      result = (
        <DetailFormDrawer
          drawerConfig={{
            ...drawerProps,
            ...commenPopupProps,
            afterVisibleChange: (visible) => {
              if (!visible) { this.handlePopupClose() }
            },
          }}
          {...restPopupProps}
          loading={loading}
          onOk={this.handleOk}
          setItemsConfig={(form: WrappedFormUtils) => setFormItemsConfig(displayDetail, mode, form)}
        />
      );
    } else if (popup === 'modal') {
      result = (
        <DetailFormModal
          modalConfig={{
            ...modalProps,
            ...commenPopupProps,
            onOk: this.handleOk,
            afterClose: this.handlePopupClose,
          }}
          {...restPopupProps}
          loading={loading}
          setItemsConfig={(form: WrappedFormUtils) => setFormItemsConfig(displayDetail, mode, form)}
          mode={mode}
        />
      );
    } else if (popup) {
      result = React.cloneElement(popup, { ...commenPopupProps });
    }
    return result;
  };

  render() {
    const { showOperators, extraOperators, createButtonName } = this.props;
    return (
      <>
        {showOperators ? (
          <Operators
            createButtonName={createButtonName}
            handleCreateClick={() => { this.handleVisible(CreateName, true) }}
          >
            {extraOperators}
          </Operators>
        ) : null}
        {this.renderContainer()}
        {this.renderPopup()}
      </>
    );
  }
}

export interface InjectContainerProps<T extends { id: number | string }> {
  actionsConfig: CurdBoxProps<T>['actionsConfig'];
  renderActions: CurdBox<T>['renderActions'];
  handleDataChange: CurdBox<T>['handleDataChange'];
}

export function withCurdBox<T>(WrappedComponent: React.ComponentClass<T> | React.FC<T>) {
  const WithCurdBox = (props: T & CurdBoxProps<any>) => {
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

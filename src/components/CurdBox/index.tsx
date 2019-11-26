import React, { PureComponent, Fragment, useContext } from 'react';
import _pick from 'lodash/pick';
import _omit from 'lodash/omit';
import { message } from 'antd';
import { FormProps } from 'antd/lib/form';
import { PaginationConfig, SorterResult, TableCurrentDataSource } from 'antd/lib/table';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/props';
import _cloneDeep from 'lodash/cloneDeep';
import { setActions, ActionType } from './actions/index';
import { injectChildren } from '../../utils';
import Operators from './Operators/index';
import StandardTable from '../StandardTable/index';
import StandardList from '../StandardList/index';
import DetailFormDrawer from '../DetailFormDrawer/index';
import DetailFormModal from '../DetailFormModal/index';
import { CreateName, DetailName, UpdateName } from '../../constants';
import { formatSorter, searchFieldName } from '../../config';
import { callFunctionIfFunction } from '../../utils';
import Curd from '../../Curd';
import { DetailFormModalProps } from '../DetailFormModal/index';
import { DetailFormDrawerProps } from '../DetailFormDrawer/index';
import DataContext from '../../DataContext';
import { curdLocale } from '../../locale';
import { CurdTableProps } from '../CurdTable';
import { CurdListProps } from '../CurdList';

export type CustomDetailFormDrawerProps = Omit<DetailFormDrawerProps, 'setItemsConfig' | 'loading' | 'form' | 'onOk'>
export type CustomDetailFormModalProps = Omit<DetailFormModalProps, 'setItemsConfig' | 'loading' | 'form'>

export type PopupMode = 'create' | 'detail' | 'update'

const getValue = (obj) => Object.keys(obj).map((key) => obj[key]).join(',');

async function updateFieldsValueByInterceptors<T>(fieldsValue, interceptors: CurdBoxProps<T>['interceptors'] = {}, mode) {
  const { updateFieldsValue } = interceptors;
  let newFieldsValue = _cloneDeep(fieldsValue);
  if (updateFieldsValue) {
    newFieldsValue = await updateFieldsValue(fieldsValue, mode);
  }
  return newFieldsValue;
}

function getModelName<T>(props: CurdBoxProps<T>) {
  const { __curd__ } = props;
  if (__curd__) {
    return __curd__.props.modelName;
  }
  throw new Error("CurdBox can't get modelName from __curd__");
}

function defaultHandleFilterAndSort(
  filtersArg = {} as Record<keyof any, string[]>,
  sorter = {} as SorterResult<any>,
  extra?: TableCurrentDataSource<any>
) {
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
    result[searchFieldName.sortor] = formatSorter(sorter);
  }
  return { ...result };
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
  'actionsConfig',
  'showOperators',
  'extraOperators',
  'dispatch',
  'autoFetch',
  'reSearchAfterUpdate',
  '__curd__',
]

export interface CurdBoxProps<T> {
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
  popupType?: 'modal' | 'drawer' | false | null;
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
}

interface CurdState<T> {
  mode: PopupMode;
  popupVisible: boolean;
  record: T;
}

class CurdBox<T extends { id: number | string }> extends PureComponent<CurdBoxProps<T>, CurdState<T>> {
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

  static StandardTable = StandardTable;
  static StandardList = StandardList;

  state = {
    mode: 'create' as PopupMode,
    popupVisible: false,
    record: {} as T,
  };

  componentDidMount() {
    const { dispatch, autoFetch } = this.props;
    if (autoFetch) {
      dispatch({
        type: `${getModelName(this.props)}/fetch`,
      });
    }
  }

  willFetchDetail = () => {
    return DetailName in this.props && 'detailLoading' in this.props;
  };

  fetchDetail = (record: T) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${getModelName(this.props)}/detail`,
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
    const { dispatch } = this.props;
    dispatch({
      type: `${getModelName(this.props)}/delete`,
      id,
      onOk: () => {
        message.success(curdLocale.deleteOk);
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
    const { interceptors, dispatch } = this.props;
    const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, CreateName);
    if (!newFieldsValue) return;
    dispatch({
      type: `${getModelName(this.props)}/create`,
      payload: newFieldsValue,
      onOk: () => {
        message.success(curdLocale.createOk);
        this.closePopup();
        this.reSearch('create');
      }
    });
  };

  handleUpdateOk = async (fieldsValue) => {
    console.log('handleUpdateOk', fieldsValue);
    const { dispatch, interceptors, reSearchAfterUpdate } = this.props;
    const { record } = this.state;
    const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, UpdateName);
    if (!newFieldsValue) return;
    dispatch({
      type: `${getModelName(this.props)}/update`,
      id: record.id,
      payload: newFieldsValue,
      onOk: () => {
        message.success(curdLocale.updateOk);
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
      [searchFieldName.page]: pagination.current,
      [searchFieldName.limit]: pagination.pageSize,
      ...hasCustomFilterAndSorter
        ? handleFilterAndSort(filtersArg, sorter, extra)
        : defaultHandleFilterAndSort(filtersArg, sorter, extra)
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
    const { dispatch, afterPopupClose } = this.props;
    const { mode } = this.state;
    console.log('handlePopupClose', mode)
    if (mode === 'detail' || mode === 'update') {
      dispatch({
        type: `${getModelName(this.props)}/_saveDetail`,
        payload: {},
      });
    }
    callFunctionIfFunction(afterPopupClose)(mode);
  }

  renderContainer = () => {
    const { children, fetchLoading, deleteLoading } = this.props;
    return injectChildren(children, {
      __curdBox__: this,
      loading: fetchLoading || deleteLoading,
    });
  };

  renderPopup = () => {
    let result: React.ReactNode;
    const {
      detail,
      createLoading,
      detailLoading,
      updateLoading,
      setFormItemsConfig,
      popupType,
      popupProps,
    } = this.props;
    const { drawerConfig, modalConfig, ...restPopupProps } = popupProps as any;
    const loading = createLoading || detailLoading || updateLoading;
    const { mode, popupVisible, record } = this.state;
    const isDetailMode = [DetailName, UpdateName].includes(mode);
    const displayDetail = this.willFetchDetail() && isDetailMode ? detail : record;

    const composePopupProps = {
      ...modalConfig,
      ...drawerConfig,
      title: this.getPopupTitle(),
      visible: popupVisible,
      onCancel: this.closePopup,
      onClose: this.closePopup
    };

    if (popupType === 'drawer') {
      result = (
        <DetailFormDrawer
          drawerConfig={{
            ...composePopupProps,
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
    } else if (popupType === 'modal') {
      result = (
        <DetailFormModal
          modalConfig={{
            ...composePopupProps,
            onOk: this.handleOk,
            afterClose: this.handlePopupClose,
          }}
          {...restPopupProps}
          loading={loading}
          setItemsConfig={(form: WrappedFormUtils) => setFormItemsConfig(displayDetail, mode, form)}
          mode={mode}
        />
      );
    }
    return result;
  };

  render() {
    const { showOperators, extraOperators, createButtonName } = this.props;

    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

export default CurdBox;

export function withCurdBox(WrappedComponent: React.ComponentClass<CurdTableProps<any> | CurdListProps<any>> | React.FC<any> | null) {
  return (props: any) => {
    const { __curd__ } = useContext(DataContext);
    if (!WrappedComponent) { return null; }
    return (
      <CurdBox {..._pick(props, curdBoxProps)} __curd__={__curd__} >
        <WrappedComponent {..._omit(props, curdBoxProps) as any} />
      </CurdBox>
    )
  }
}

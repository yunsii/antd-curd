import React, { PureComponent, Fragment } from 'react';
import { FormProps } from 'antd/lib/form';
import { PaginationConfig, SorterResult, TableCurrentDataSource } from 'antd/lib/table';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import { ItemConfig } from 'antd-form-mate';
import { setActions, ActionType } from './actions';
import { addDivider } from '../../utils';
import Operators from './Operators';
import StandardTable, { StandardTableProps } from '../StandardTable/index';
import DetailFormDrawer from '../DetailFormDrawer';
import DetailFormModal from '../DetailFormModal';
import { CustomDetailFormDrawerProps } from './CustomDetailFormDrawerProps';
import { CustomDetailFormModalProps } from './CustomDetailFormModalProps';
import { CreateName, DetailName, UpdateName } from '../../constant';
import { formatSorter, searchFieldName } from '../../config';
import { callFunctionIfFunction } from '../../utils';
import Curd from '../../Curd';


const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

async function updateFieldsValueByInterceptors(fieldsValue, interceptors, mode) {
  const { updateFieldsValue } = interceptors;
  let newFieldsValue = { ...fieldsValue };
  if (updateFieldsValue) {
    newFieldsValue = await updateFieldsValue(fieldsValue, mode);
  }
  return newFieldsValue;
}

function getModelName(props) {
  const { __curd__ } = props;
  if (__curd__) {
    return __curd__.props.modelName;
  }
  throw new Error('CurdTable can\'t get modelName from __curd__');
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
    ...filters,
  };
  if (sorter.field) {
    result[searchFieldName.sortor] = formatSorter(sorter);
  }
  return { ...result };
}


export interface CurdTableProps extends StandardTableProps {
  /** popup title of create */
  createTitle?: string;
  /** popup title of detail */
  detailTitle?: string;
  /** popup title of update */
  updateTitle?: string;
  fetchLoading?: boolean;
  createLoading?: boolean;
  detailLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;
  /** if value is '', hide the button */
  createButtonName?: string;
  popupType?: 'modal' | 'drawer' | null;
  popupProps?: CustomDetailFormDrawerProps | CustomDetailFormModalProps;
  setFormItemsConfig?: (
    detail: {},
    mode: 'create' | 'detail' | 'update',
    form?: FormProps['form']
  ) => ItemConfig[];
  afterPopupClose?: () => void;
  interceptors?: {
    /** update form values after click ok */
    updateFieldsValue?: (fieldsValue: any, mode?: 'create' | 'update') => any;
    /** callback on click create button, will break default behavior if return value is true */
    handleCreateClick?: () => boolean | undefined;
    /** callback on click detail button, will break default behavior if return value is true */
    handleDetailClick?: (record: any) => boolean | undefined;
    /** callback on click update button, will break default behavior if return value is true */
    handleUpdateClick?: (record: any) => boolean | undefined;
    handleDeleteClick?: (record: any) => void;
    handleFilterAndSort?: (
      filtersArg: Record<keyof any, string[]>,
      sorter: SorterResult<any>,
      extra?: TableCurrentDataSource<any>
    ) => any;
  };
  detail?: {};
  actionsConfig?: {
    showActionsCount?: number;
    extraActions?: ActionType[];
    confirmKeys?: (number | [number, (record?: any) => string])[];
    confirmProps?: PopconfirmProps,
    hideActions?: number[];
    detailActionTitle?: string;
    updateActionTitle?: string;
    deleteActionTitle?: string;
  } | false | null;
  operators?: React.ReactNode[] | boolean | null;
  dispatch?: any;
  /** call model's fetch effect when componentDidMount */
  autoFetch?: boolean;
  reSearchAfterUpdate?: boolean;
  __curd__?: Curd,
}

interface CurdState {
  popupVisible: string | null;
  record: any;
}

class CurdTable extends PureComponent<CurdTableProps, CurdState> {
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
    renderItem: () => { },
    data: {},
    actionsConfig: {},
    popupType: 'drawer',
    popupProps: {},
    setFormItemsConfig: () => [],
    interceptors: {},
    operators: [],
    autoFetch: true,
    reSearchAfterUpdate: false,
    __curd__: null,
  }

  state = {
    popupVisible: null,
    record: {} as any,
  }

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
  }

  fetchDetail = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${getModelName(this.props)}/detail`,
      id: record.id,
    });
  }

  fetchDetailOrNot = (record) => {
    if (this.willFetchDetail()) {
      this.fetchDetail(record);
    }
  };

  handleVisible = (action, visible, record?: any) => {
    const { interceptors = {} } = this.props;
    const { handleCreateClick } = interceptors;
    if (handleCreateClick && action === CreateName) {
      const isBreak = handleCreateClick();
      if (isBreak) return;
    }
    this.setState({
      popupVisible: action,
    })
    if (visible) {
      this.setState({
        record: record || {},
      })
    }
  };

  reSearch = () => {
    const { __curd__ } = this.props;
    if (__curd__) {
      __curd__.handleSearch();
    }
  }

  deleteModel = id => {
    const { dispatch } = this.props;
    dispatch({
      type: `${getModelName(this.props)}/delete`,
      id,
      onOk: () => this.reSearch(),
    });
  };

  enhanceColumns = () => {
    const { columns, actionsConfig, interceptors } = this.props;
    if (!columns) return [];
    if (!actionsConfig) return columns;
    return [
      ...columns,
      {
        title: '操作',
        render: (value, record) => {
          const actionsMethod = {
            fetchDetailOrNot: this.fetchDetailOrNot,
            handleVisible: this.handleVisible,
            deleteModel: this.deleteModel,
            interceptors,
          }
          const actions = setActions(record, actionsMethod, actionsConfig);
          return addDivider(actions);
        }
      },
    ];
  };

  setPopupModeAndRecord = () => {
    const { popupVisible, record } = this.state;
    if (popupVisible === DetailName) {
      return [DetailName, record];
    }
    if (popupVisible === UpdateName) {
      return [UpdateName, record];
    }
    return [CreateName, {}];
  };

  getPopupTitle = () => {
    const { createTitle, detailTitle, updateTitle } = this.props;
    const { popupVisible } = this.state;
    if (popupVisible === DetailName) {
      return detailTitle;
    }
    if (popupVisible === UpdateName) {
      return updateTitle;
    }
    return createTitle;
  };

  closePopup = () => this.setState({ popupVisible: null });

  handleCreateOk = async fieldsValue => {
    console.log('handleCreateOk', fieldsValue);
    const { interceptors, dispatch } = this.props;
    const newFieldsValue = await updateFieldsValueByInterceptors(
      fieldsValue,
      interceptors,
      CreateName
    );
    if (!newFieldsValue) return;
    dispatch({
      type: `${getModelName(this.props)}/create`,
      payload: newFieldsValue,
      onOk: () => {
        this.closePopup();
        this.reSearch();
      },
    });
  };

  handleUpdateOk = async fieldsValue => {
    console.log('handleUpdateOk', fieldsValue);
    const { dispatch, interceptors, reSearchAfterUpdate } = this.props;
    const { record } = this.state;
    const newFieldsValue = await updateFieldsValueByInterceptors(
      fieldsValue,
      interceptors,
      UpdateName
    );
    if (!newFieldsValue) return;
    dispatch({
      type: `${getModelName(this.props)}/update`,
      id: record.id,
      payload: newFieldsValue,
      onOk: () => {
        this.closePopup();
        if (reSearchAfterUpdate) {
          this.reSearch();
        }
      },
    });
  };

  handleOk = fieldsValue => {
    const { popupVisible } = this.state;
    if (popupVisible === DetailName) {
      this.closePopup();
      return;
    }
    if (popupVisible === UpdateName) {
      this.handleUpdateOk(fieldsValue);
    }
    this.handleCreateOk(fieldsValue);
  };

  // https://ant.design/components/table-cn/#components-table-demo-reset-filter
  // 只支持一个 sorter
  handleStandardTableChange = (
    pagination: PaginationConfig,
    filtersArg = {} as Record<keyof any, string[]>,
    sorter = {} as SorterResult<any>,
    extra?: TableCurrentDataSource<any>
  ) => {
    console.log('pagination', pagination);
    console.log('filtersArg', filtersArg);
    console.log('sorter', sorter);
    const { interceptors = {}, __curd__ } = this.props;
    const { handleFilterAndSort = () => { } } = interceptors;

    const hasCustomFilterAndSorter: boolean = handleFilterAndSort && handleFilterAndSort(filtersArg, sorter, extra);

    const params = {
      [searchFieldName.page]: pagination.current,
      [searchFieldName.limit]: pagination.pageSize,
      ...hasCustomFilterAndSorter ?
        handleFilterAndSort(filtersArg, sorter, extra) :
        defaultHandleFilterAndSort(filtersArg, sorter, extra),
    };

    console.log('changed parama', params);
    // sync curd's searchParams
    if (__curd__) {
      __curd__.setState({ searchParams: params }, () => {
        __curd__.handleSearch();
      });
    }
  };

  renderPopup = () => {
    let result;
    const {
      detail,
      createLoading,
      detailLoading,
      updateLoading,
      setFormItemsConfig,
      popupType,
      popupProps,
      afterPopupClose,
    } = this.props;
    const { popupVisible } = this.state;
    const { drawerConfig, modalConfig, ...restPopupProps } = popupProps as any;
    const loading = createLoading || detailLoading || updateLoading;
    const [mode, record] = this.setPopupModeAndRecord();
    const showDetail = [DetailName, UpdateName].includes(mode);

    const composePopupProps = {
      ...modalConfig,
      ...drawerConfig,
      title: this.getPopupTitle(),
      visible: !!popupVisible,
      onCancel: this.closePopup,
      onClose: this.closePopup,
    };

    if (popupType === 'drawer') {
      result = (
        <DetailFormDrawer
          drawerConfig={{
            ...composePopupProps,
            afterVisibleChange: (visible) => {
              if (!visible) {
                callFunctionIfFunction(afterPopupClose)();
              }
            },
          }}
          {...restPopupProps}
          loading={loading}
          onOk={this.handleOk}
          setItemsConfig={setFormItemsConfig}
          detail={this.willFetchDetail() && showDetail ? detail : record}
          mode={mode}
        />
      );
    } else if (popupType === 'modal') {
      result = (
        <DetailFormModal
          modalConfig={{
            ...composePopupProps,
            onOk: this.handleOk,
            afterClose: afterPopupClose,
          }}
          {...restPopupProps}
          loading={loading}
          setItemsConfig={setFormItemsConfig}
          detail={this.willFetchDetail() && showDetail ? detail : record}
          mode={mode}
        />
      );
    }
    return result;
  };

  render() {
    const {
      columns,
      actionsConfig,
      afterPopupClose,
      dispatch,
      createTitle,
      detailTitle,
      updateTitle,
      operators,
      createButtonName,
      fetchLoading,
      ...rest
    } = this.props;

    return (
      <Fragment>
        {operators ?
          <Operators
            curdTable={this}
            createButtonName={createButtonName}
          >
            {operators}
          </Operators> :
          null}
        <StandardTable
          {...rest}
          loading={fetchLoading}
          columns={this.enhanceColumns()}
          onChange={this.handleStandardTableChange}
        />
        {this.renderPopup()}
      </Fragment>

    )
  }
}

export default CurdTable;

import React, { PureComponent, Fragment } from 'react';
import { FormProps } from 'antd/lib/form';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import { ItemConfig } from 'antd-form-mate';
// import classNames from 'classnames';
import { setActions } from './actions';
import { ActionType } from './actions/ActionType';
import { addDivider } from '../../utils';
import Operators from './Operators';
import StandardTable, { StandardTableProps } from '../StandardTable/index';
import DetailFormDrawer from '../DetailFormDrawer';
import DetailFormModal from '../DetailFormModal';
import { CustomDetailFormDrawerProps } from './CustomDetailFormDrawerProps';
import { CustomDetailFormModalProps } from './CustomDetailFormModalProps';
import { CreateName, DetailName, UpdateName } from '../../constant';
import { callFunctionIfFunction } from '../../utils';


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
    updateFieldsValue?: (fieldsValue: any, mode?: 'create' | 'update') => any;
    updateSearchValue?: (fieldsValue: any) => any;
    handleCreateClick?: () => boolean | undefined;
    handleDetailClick?: (record: any) => boolean | undefined;
    handleUpdateClick?: (record: any) => boolean | undefined;
    handleDeleteClick?: (record: any) => void;
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
  autoFetch?: boolean,
  __curd__?: any,

  handleSearch?: () => void;
}

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

class CurdTable extends PureComponent<CurdTableProps> {
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
    __curd__: null,
  }

  state = {
    popupVisible: null,
    record: {} as any,
  }

  componentDidMount() {
    const { dispatch, autoFetch } = this.props;
    console.log('curdTable componentDidMount', dispatch, autoFetch)
    if (autoFetch) {
      dispatch({
        type: `${getModelName(this.props)}/fetch`,
      });
    }
  }

  willFetchDetail = () => {
    return DetailName in this.props && 'detailLoading' in this.props;
  }

  fetchDetail = () => {
    const { dispatch } = this.props;
    const { record } = this.state;
    dispatch({
      type: `${getModelName(this.props)}/detail`,
      id: record.id,
    });
  }

  fetchDetailOrNot = () => {
    if (this.willFetchDetail) {
      this.fetchDetail();
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

  deleteModel = id => {
    const { dispatch, handleSearch } = this.props;
    dispatch({
      type: `${getModelName(this.props)}/delete`,
      id,
      onOk: () => callFunctionIfFunction(handleSearch)(),
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

  closePopup = () => {
    const { afterPopupClose } = this.props;
    this.setState({ popupVisible: null });
    callFunctionIfFunction(afterPopupClose)();
  }

  handleCreateOk = async fieldsValue => {
    console.log('handleCreateOk', fieldsValue);
    const { interceptors, dispatch, handleSearch } = this.props;
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
        callFunctionIfFunction(handleSearch)();
      },
    });
  };

  handleUpdateOk = async fieldsValue => {
    console.log('handleUpdateOk', fieldsValue);
    const { dispatch, interceptors } = this.props;
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
      },
    });
  };

  handleOk = fieldsValue => {
    const { popupVisible } = this.state;
    if (popupVisible === DetailName) {
      this.closePopup();
      return null;
    }
    if (popupVisible === UpdateName) {
      return this.handleUpdateOk(fieldsValue);
    }
    return this.handleCreateOk(fieldsValue);
  };

  handleStandardTableChange = (pagination, filtersArg = {}, sorter = {} as any) => {
    const { dispatch, __curd__ } = this.props;
    let searchForm = {};
    if (__curd__ && __curd__.state) {
      const { searchForm: searchFormState } = __curd__.state;
      searchForm = { ...searchFormState };
    }
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...searchForm,
      ...filters,
    };

    if (sorter.field) {
      params['sorter'] = `${sorter.field}_${sorter.order}`;
    }
    dispatch({
      type: `${getModelName(this.props)}/fetch`,
      payload: params,
    });
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
          drawerConfig={composePopupProps}
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
      handleSearch,
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

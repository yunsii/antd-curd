import React, { PureComponent, Fragment } from 'react';
import { FormProps } from 'antd/lib/form';
import { ItemConfig } from 'antd-form-mate';
import classNames from 'classnames';
import { setActions } from './actions';
import { ActionType } from './actions/ActionType';
import { addDivider } from '../../utils';
import StandardTable, { StandardTableProps } from '../StandardTable/index';
import DetailFormDrawer from '../DetailFormDrawer';
import DetailFormModal from '../DetailFormModal';
import { CustomDetailFormDrawerProps } from './CustomDetailFormDrawerProps';
import { CustomDetailFormModalProps } from './CustomDetailFormModalProps';
import { CreateName, DetailName, UpdateName, DetailVisible, UpdateVisible } from '../../constant';
import { callFunctionIfFunction } from '../../utils';


async function updateFieldsValueByInterceptors(fieldsValue, interceptors, mode) {
  const { updateFieldsValue } = interceptors;
  let newFieldsValue = { ...fieldsValue };
  if (updateFieldsValue) {
    newFieldsValue = await updateFieldsValue(fieldsValue, mode);
  }
  return newFieldsValue;
}

export interface CurdTableProps extends StandardTableProps {
  modelName: string;
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
  afterPopupNotVisible?: () => void;
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
    hideActions?: number[];
    detailActionTitle?: string;
    updateActionTitle?: string;
    deleteActionTitle?: string;
  } | false | null;
  dispatch?: any;

  handleSearch?: () => void;
}

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
  }

  state = {
    popupVisible: null,
    record: {} as any,
  }

  willFetchDetail = () => {
    return DetailName in this.props && 'detailLoading' in this.props;
  }

  fetchDetail = () => {
    const { dispatch, modelName } = this.props;
    const { record } = this.state;
    dispatch({
      type: `${modelName}/detail`,
      id: record.id,
    });
  }

  fetchDetailOrNot = () => {
    if (this.willFetchDetail) {
      this.fetchDetail();
    }
  };

  handleVisible = (action, visible, record?: any) => {
    const { interceptors = {}, afterPopupNotVisible } = this.props;
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
    } else {
      callFunctionIfFunction(afterPopupNotVisible)();
    }
  };

  deleteModel = id => {
    const { dispatch, modelName, handleSearch } = this.props;
    dispatch({
      type: `${modelName}/delete`,
      id,
      callback: response => {
        if (!response) {
          callFunctionIfFunction(handleSearch)();
        }
      },
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
    const { interceptors, modelName, dispatch, handleSearch } = this.props;
    const newFieldsValue = await updateFieldsValueByInterceptors(
      fieldsValue,
      interceptors,
      CreateName
    );
    if (!newFieldsValue) return;
    dispatch({
      type: `${modelName}/create`,
      payload: newFieldsValue,
      callback: response => {
        if (!response) {
          this.closePopup();
          callFunctionIfFunction(handleSearch)();
        }
      },
    });
  };

  handleUpdateOk = async fieldsValue => {
    console.log('handleUpdateOk', fieldsValue);
    const { dispatch, modelName, interceptors } = this.props;
    const { record } = this.state;
    const newFieldsValue = await updateFieldsValueByInterceptors(
      fieldsValue,
      interceptors,
      UpdateName
    );
    if (!newFieldsValue) return;
    dispatch({
      type: `${modelName}/update`,
      id: record.id,
      payload: newFieldsValue,
      callback: response => {
        if (!response) {
          this.closePopup();
        }
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
      afterPopupNotVisible,
      interceptors = {},
      modelName,
      dispatch,
      handleSearch,
      createTitle,
      detailTitle,
      updateTitle,
      ...rest
    } = this.props;

    return (
      <Fragment>
        <StandardTable {...rest} columns={this.enhanceColumns()} />
        {this.renderPopup()}
      </Fragment>

    )
  }
}

export default CurdTable;

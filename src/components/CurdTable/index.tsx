import React, { Fragment, useState } from 'react';
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
    form: FormProps['form']
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

function CurdTable(props: CurdTableProps) {
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
  } = props;

  const [popupVisible, setPopupVisible] = useState(null);
  const [record, setRecord] = useState({} as any);


  const willFetchDetail = () => {
    return DetailName in props && 'detailLoading' in props;
  }

  const fetchDetail = () => {
    dispatch({
      type: `${modelName}/detail`,
      id: record.id,
    });
  }

  const fetchDetailOrNot = () => {
    if (willFetchDetail) {
      fetchDetail();
    }
  };

  const handleVisible = (action, visible, record?: any) => {
    const { handleCreateClick } = interceptors;
    if (handleCreateClick && action === CreateName) {
      const isBreak = handleCreateClick();
      if (isBreak) return;
    }
    setPopupVisible(action);
    if (visible) {
      setRecord(record || {});
    } else {
      callFunctionIfFunction(afterPopupNotVisible)();
    }
  };

  const deleteModel = id => {
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

  const enhanceColumns = () => {
    if (!columns) return [];
    if (!actionsConfig) return columns;
    return [
      ...columns,
      {
        title: '操作',
        render: (value, record) => {
          const actionsMethod = {
            fetchDetailOrNot,
            handleVisible,
            deleteModel,
            interceptors,
          }
          const actions = setActions(record, actionsMethod, actionsConfig);
          return addDivider(actions);
        }
      },
    ];
  };

  const setPopupModeAndRecord = () => {
    if (popupVisible === DetailName) {
      return [DetailName, record];
    }
    if (popupVisible === UpdateName) {
      return [UpdateName, record];
    }
    return [CreateName, {}];
  };

  const getPopupTitle = () => {
    if (popupVisible === DetailName) {
      return detailTitle;
    }
    if (popupVisible === UpdateName) {
      return updateTitle;
    }
    return createTitle;
  };

  const closePopup = () => setPopupVisible(null);

  const handleCreateOk = async fieldsValue => {
    console.log('handleCreateOk', fieldsValue);
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
          closePopup();
          callFunctionIfFunction(handleSearch)();
        }
      },
    });
  };

  const handleUpdateOk = async fieldsValue => {
    console.log('handleUpdateOk', fieldsValue);
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
          closePopup();
        }
      },
    });
  };

  const handleOk = fieldsValue => {
    if (popupVisible === DetailName) {
      closePopup();
      return null;
    }
    if (popupVisible === UpdateName) {
      return handleUpdateOk(fieldsValue);
    }
    return handleCreateOk(fieldsValue);
  };

  const renderPopup = () => {
    let result;
    const {
      detail,
      createLoading,
      detailLoading,
      updateLoading,
      setFormItemsConfig,
      popupType,
      popupProps,
    } = props;
    const { drawerConfig, modalConfig, ...restPopupProps } = popupProps as any;
    const loading = createLoading || detailLoading || updateLoading;
    const [mode, record] = setPopupModeAndRecord();
    const showDetail = [DetailName, UpdateName].includes(mode);

    const composePopupProps = {
      ...modalConfig,
      ...drawerConfig,
      title: getPopupTitle(),
      visible: popupVisible,
      onCancel: closePopup,
      onClose: closePopup,
    };

    if (popupType === 'drawer') {
      result = (
        <DetailFormDrawer
          drawerConfig={composePopupProps}
          {...restPopupProps}
          loading={loading}
          onOk={handleOk}
          setItemsConfig={setFormItemsConfig}
          detail={willFetchDetail() && showDetail ? detail : record}
          mode={mode}
        />
      );
    } else if (popupType === 'modal') {
      result = (
        <DetailFormModal
          modalConfig={{
            ...composePopupProps,
            onOk: handleOk,
          }}
          {...restPopupProps}
          loading={loading}
          setItemsConfig={setFormItemsConfig}
          detail={willFetchDetail() && showDetail ? detail : record}
          mode={mode}
        />
      );
    }
    return result;
  };

  return (
    <Fragment>
      <StandardTable {...rest} columns={enhanceColumns()} />
      {renderPopup()}
    </Fragment>

  )
}

CurdTable.defaultProps = {
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

export default CurdTable;

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import _isArray from 'lodash/isArray';
import _isFunction from 'lodash/isFunction';
import { Icon, Dropdown, Menu, Popconfirm, Modal } from 'antd';
import { DetailName, UpdateName } from '../../../constants';
import { CurdBoxProps, ActionsConfig } from '../index';
import styles from './index.less';

export type ConfirmKey<T> = (number | [number, (record: T) => string]);

function isConfirmKeyAndItem<T>(key: number, confirmKeys: ConfirmKey<T>[] = []): ConfirmKey<T> | null {
  for (let i = 0; i < confirmKeys.length; i += 1) {
    if (_isArray(confirmKeys[i]) && confirmKeys[i][0] === key) {
      return confirmKeys[i];
    }
    if (confirmKeys[i] === key) {
      return confirmKeys[i];
    }
  }
  return null;
}

function setConfirmTitle<T>(confirmKey: ConfirmKey<T>, action: ActionType<T>, record: T) {
  if (_isArray(confirmKey)) {
    const [, setTitle] = confirmKey;
    return setTitle(record);
  }
  return `确定${action.title}吗？`;
}

export interface ActionType<T> {
  key: number;
  title: string;
  handleClick: (record: T) => void;
};

export function sortAndFilterActionsAsc<T>(record: T, actions: ActionType<T>[], hideActions: number[] | ((record?: T) => void | number[])) {
  return [...actions]
    .filter((item) => {
      if (_isFunction(hideActions)) {
        const hideActionKeys = hideActions(record) || [];
        return !hideActionKeys.includes(item.key);
      } else {
        return !hideActions.includes(item.key);
      }
    })
    .sort((x, y) => {
      if (x.key > y.key) return 1;
      if (x.key < y.key) return -1;
      return 0;
    });
}

export function initialActions<T extends { id: number | string }>(record: T, actionsMethod: ActionsMethod<T>, actionsConfig: ActionsConfig<T>) {
  const { fetchDetailOrNot, handlePopupOpen, deleteModel, interceptors = {} } = actionsMethod;
  const {
    detailActionTitle = '详情',
    updateActionTitle = '编辑',
    deleteActionTitle = '删除',
    showActionsCount = 3,
    extraActions = [],
    hideActions = []
  } = actionsConfig;
  const { handleDetailClick, handleDeleteClick, handleUpdateClick } = interceptors;
  const actions = [
    {
      key: 4,
      title: detailActionTitle,
      handleClick: () => {
        if (handleDetailClick) {
          const isBreak = handleDetailClick(record);
          if (isBreak) return;
        }
        handlePopupOpen(DetailName, record);
        fetchDetailOrNot(record);
      }
    },
    {
      key: 8,
      title: updateActionTitle,
      handleClick: () => {
        if (handleUpdateClick) {
          const isBreak = handleUpdateClick(record);
          if (isBreak) return;
        }
        handlePopupOpen(UpdateName, record);
        fetchDetailOrNot(record);
      }
    },
    {
      key: 12,
      title: deleteActionTitle,
      handleClick: () => {
        if (handleDeleteClick) {
          handleDeleteClick(record);
          return;
        }
        deleteModel(record.id);
      }
    },
    ...extraActions
  ];
  const sortedActions = sortAndFilterActionsAsc(record, actions, hideActions);
  return [sortedActions.slice(0, showActionsCount), sortedActions.slice(showActionsCount)];
}

function renderShowActions<T>(record: T) {
  return (
    actions: ActionType<T>[],
    actionsConfig: ActionsConfig<T>,
    disabledActionKeys: number[] = []
  ) => {
    const { confirmKeys, confirmProps } = actionsConfig;
    return actions.map((item) => {
      if (disabledActionKeys.includes(item.key)) {
        return (
          <span key={item.key} className={styles.disabledAction}>
            {item.title}
          </span>
        );
      }
      const confirmKey = isConfirmKeyAndItem(item.key, confirmKeys);
      if (confirmKey) {
        return (
          <span
            key={item.key}
            onClick={(event) => {
              if (event) {
                event.stopPropagation();
              }
            }}
          >
            <Popconfirm
              {...confirmProps}
              title={setConfirmTitle(confirmKey, item, record)}
              onConfirm={() => {
                item.handleClick(record);
              }}
              onCancel={(event) => {
                if (event) {
                  event.stopPropagation();
                }
              }}
            >
              <a>{item.title}</a>
            </Popconfirm>
          </span>
        );
      }
      return (
        <a
          key={item.key}
          onClick={(event) => {
            event.stopPropagation();
            item.handleClick(record);
          }}
        >
          {item.title}
        </a>
      );
    });
  };
}

export function renderActions<T>(record: T) {
  return (
    actions: ActionType<T>[],
    moreActions: ActionType<T>[],
    actionsConfig: ActionsConfig<T>
  ) => {
    const { confirmKeys, disabledActions } = actionsConfig;

    let disabledActionKeys: number[] = [];
    if (disabledActions) {
      disabledActionKeys = disabledActions(record) || [];
    }

    if (!moreActions.length) {
      return renderShowActions(record)(actions, actionsConfig, disabledActionKeys);
    }

    return [
      ...renderShowActions(record)(actions, actionsConfig, disabledActionKeys),
      <span
        key="dropdown"
        onClick={(event) => {
          if (event) {
            event.stopPropagation();
          }
        }}
      >
        <Dropdown
          key="more"
          overlay={
            // 阻止 Menu 点击事件冒泡，否则会触发 actions 容器点击事件
            <Menu
              onClick={({ domEvent }) => {
                domEvent.stopPropagation();
              }}
            >
              {moreActions.map((item) => {
                const confirmKey = isConfirmKeyAndItem(item.key, confirmKeys);
                const isDisabled = disabledActionKeys.includes(item.key);
                return (
                  <Menu.Item
                    key={item.key}
                    disabled={isDisabled}
                    onClick={() => {
                      if (confirmKey) {
                        Modal.confirm({
                          title: setConfirmTitle(confirmKey, item, record),
                          onOk() {
                            item.handleClick(record);
                          },
                          okText: '确定',
                          cancelText: '取消'
                        });
                        return;
                      }
                      item.handleClick(record);
                    }}
                  >
                    {isDisabled ? item.title : <a>{item.title}</a>}
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          <a style={{ whiteSpace: 'nowrap' }}>
            更多 <Icon type="down" style={{ width: 24 }} />
          </a>
        </Dropdown>
      </span>
    ];
  };
}

export interface ActionsMethod<T extends { id: number | string }> {
  fetchDetailOrNot: (record: T) => void;
  handlePopupOpen: (action: string, record?: T) => void;
  deleteModel: (id: T['id']) => void;
  interceptors: CurdBoxProps<T>['interceptors'];
}

export function setActions<T extends { id: number | string }>(record: T, actionsMethod: ActionsMethod<T>, actionsConfig: ActionsConfig<T>) {
  const [actions, moreActions] = initialActions(record, actionsMethod, actionsConfig);
  return renderActions(record)(actions, moreActions, actionsConfig);
}

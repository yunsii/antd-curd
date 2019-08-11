/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import _isArray from 'lodash/isArray';
import { Icon, Dropdown, Menu, Popconfirm, Modal } from 'antd';
import { DetailName, UpdateName } from '../../../constant';

function isConfirmKeyAndItem(key, confirmKeys) {
  for (let i = 0; i < confirmKeys.length; i += 1) {
    if (_isArray(confirmKeys[i]) && confirmKeys[i][0] === key) {
      return [true, confirmKeys[i]];
    }
    if (confirmKeys[i] === key) {
      return [true, confirmKeys[i]];
    }
  }
  return [false, null];
}

function setConfirmTitle(confirmKey, item, record) {
  if (_isArray(confirmKey)) {
    const [, setTitle] = confirmKey;
    return setTitle(record);
  }
  return `确定${item.title}吗？`;
}

export type ActionType = {
  key: number;
  title: string;
  handleClick: (record: any) => void;
};

export function sortAndFilterActionsAsc(actions: ActionType[], hideActions = []) {
  return [...actions]
    .filter((item) => !hideActions.includes(item.key as never))
    .sort((x, y) => {
      if (x.key > y.key) return 1;
      if (x.key < y.key) return -1;
      return 0;
    });
}

export function initialActions(record, actionsMethod, actionsConfig) {
  const {
    fetchDetailOrNot,
    handleVisible,
    deleteModel,
    interceptors = {},
  } = actionsMethod;
  const {
    detailActionTitle = '详情',
    updateActionTitle = '编辑',
    deleteActionTitle = '删除',
    showActionsCount = 3,
    extraActions = [],
    hideActions = [],
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
        handleVisible(DetailName, true, record);
        fetchDetailOrNot(record);
      },
    },
    {
      key: 8,
      title: updateActionTitle,
      handleClick: () => {
        if (handleUpdateClick) {
          const isBreak = handleUpdateClick(record);
          if (isBreak) return;
        }
        handleVisible(UpdateName, true, record);
        fetchDetailOrNot(record)
      },
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
      },
    },
    ...extraActions,
  ];
  const sortedActions = sortAndFilterActionsAsc(actions, hideActions);
  return [sortedActions.slice(0, showActionsCount), sortedActions.slice(showActionsCount)];
}

const renderShowActions = record => (actions, confirmKeys = [], confirmProps = {}) => {
  return actions.map(item => {
    const [isConfirmKey, confirmKey] = isConfirmKeyAndItem(item.key, confirmKeys);
    if (isConfirmKey) {
      return (
        <Popconfirm
          {...confirmProps}
          key={item.key}
          title={setConfirmTitle(confirmKey, item, record)}
          onConfirm={(event) => {
            if (event) {
              event.stopPropagation();
            }
            item.handleClick(record)
          }}
          onCancel={(event) => {
            if (event) {
              event.stopPropagation();
            }
          }}
        >
          <a>{item.title}</a>
        </Popconfirm>
      );
    }
    return (
      <a
        key={item.key}
        onClick={event => {
          event.stopPropagation();
          item.handleClick(record);
        }}
      >
        {item.title}
      </a>
    );
  });
};

export const renderActions = record => (actions, moreActions, confirmKeys, confirmProps) => {
  if (!moreActions.length) {
    return renderShowActions(record)(actions, confirmKeys, confirmProps);
  }

  return [
    ...renderShowActions(record)(actions, confirmKeys, confirmProps),
    <Dropdown
      key="more"
      overlay={
        // 阻止 Menu 点击事件冒泡，否则会触发 actions 容器点击事件
        <Menu
          onClick={({ domEvent }) => {
            domEvent.stopPropagation();
          }}
        >
          {moreActions.map(item => {
            const [isConfirmKey, confirmKey] = isConfirmKeyAndItem(item.key, confirmKeys);
            return (
              <Menu.Item
                key={item.key}
                onClick={() => {
                  if (isConfirmKey) {
                    Modal.confirm({
                      title: setConfirmTitle(confirmKey, item, record),
                      onOk() {
                        item.handleClick(record);
                      },
                      okText: '确定',
                      cancelText: '取消',
                    });
                    return;
                  }
                  item.handleClick(record);
                }}
              >
                <a>{item.title}</a>
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      <a style={{ whiteSpace: 'nowrap' }}>
        更多 <Icon type="down" style={{ width: 24 }} />
      </a>
    </Dropdown>,
  ];
};

export function setActions(record, actionsMethod, actionsConfig) {
  const {
    confirmKeys = [12],
    confirmProps,
  } = actionsConfig;
  const [actions, moreActions] = initialActions(record, actionsMethod, actionsConfig);
  return renderActions(record)(actions, moreActions, confirmKeys, confirmProps);
}

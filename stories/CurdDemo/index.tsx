import * as React from 'react';
import { Button, Card, Radio, message } from 'antd';
import { ItemConfig } from 'antd-form-mate/dist/lib/props'
import { Curd } from '../../src';
import setFormItemsConfig from '../map';
import { data } from '../mock';

function handleDelete(record, list: any[]) {
  const { parent_id, id } = record;
  if (parent_id) {
    const targetIndex = list.findIndex(item => item.id === parent_id);
    delete list[targetIndex].children;
    return list;
  }
  return list.filter(item => item.id !== id);
}

const { Table } = Curd;

export default class CurdDemo extends React.Component<any, any> {
  state = {
    selectedRows: [],
    mockData: data,
  };

  __curd__: Curd<any>;

  queryArgsConfig: ItemConfig[] = [
    {
      type: 'string',
      field: 'username',
      formItemProps: {
        label: '姓名',
      },
    },
    {
      type: 'string',
      field: 'nickname',
      formItemProps: {
        label: '昵称',
      },
    },
    {
      type: 'string',
      field: 'habit',
      formItemProps: {
        label: '爱好',
      },
    },
  ];

  columns = () => {
    return [
      {
        title: '姓名',
        dataIndex: 'name',
        filters: [{ text: '孙珍妮', value: 'szn' }, { text: '陈美君', value: 'cmj' }],
        filterMultiple: false,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
      },
      {
        title: '生日',
        dataIndex: 'birthday',
        sorter: (a, b) => a.birthday - b.birthday,
        filters: [{ text: '05.05', value: '05.05' }, { text: '01.15', value: '01.15' }],
      },
      {
        title: '特长',
        dataIndex: 'speciality',
      },
      {
        title: '爱好',
        dataIndex: 'habit',
        sorter: (a, b) => a.habit.length - b.habit.length,
      },
    ]
  }

  render() {
    const { selectedRows, mockData } = this.state;
    return (
      <>
        <Curd
          ref={(curd: any) => { this.__curd__ = curd }}
          {...this.props}
          data={mockData}
          wrapper={null}
        >
          <Card bodyStyle={{ paddingBottom: 0 }}>
            <Curd.Query queryArgsConfig={this.queryArgsConfig} />
          </Card>
          <div style={{ width: '100%', height: 16, background: '#eee' }}></div>
          <Card>
            <Table
              columns={this.columns()}
              selectedRows={selectedRows}
              onSelectRow={(row) => {
                console.log(row);
                this.setState({ selectedRows: row });
              }}
              checkable={false}
              popupType='modal'
              popupProps={{
                getFormInstance: (form) => {
                  console.log(form);
                }
              }}
              setFormItemsConfig={setFormItemsConfig as any}
              extraOperators={[
                <Button key='reset' onClick={() => { this.setState({ mockData: data }) }}>数据重置</Button>,
                <Radio.Group key='demo' defaultValue="a" buttonStyle="solid">
                  <Radio.Button value="a">Hangzhou</Radio.Button>
                  <Radio.Button value="b">Shanghai</Radio.Button>
                  <Radio.Button value="c">Beijing</Radio.Button>
                  <Radio.Button value="d">Chengdu</Radio.Button>
                </Radio.Group>,
              ]}
              actionsConfig={{
                extraActions: [
                  {
                    key: 13,
                    title: '外务',
                    handleClick: record => message.info(`调用 ${record.name} 的外务事件`),
                  },
                  {
                    key: 14,
                    title: '兼职',
                    handleClick: record => message.info(`调用 ${record.name} 的兼职事件`),
                  },
                ],
                confirmProps: {
                  okText: '确定',
                  cancelText: '取消',
                } as any,
                disabledActions: (record) => {
                  if (record.id === 'cmj') {
                    return [4, 8, 14];
                  }
                },
                hideActions: (record) => {
                  if (record.id === 'cmj2') {
                    return [4, 8];
                  }
                }
              }}
              interceptors={{
                handleFilterAndSort: (filters, sorter) => {
                  this.setState({
                    filteredInfo: filters,
                    sortedInfo: sorter,
                  });
                },
                updateFieldsValue: (fieldsValue) => {
                  console.log(fieldsValue);
                  return fieldsValue;
                },
                handleDeleteClick: (record) => {
                  console.log(record);
                  const { list, pagination } = mockData;
                  this.setState({
                    mockData: {
                      list: handleDelete(record, list),
                      pagination: {
                        ...pagination,
                        total: list.length - 1,
                      },
                    }
                  })
                }
              }}
            />
          </Card>
        </Curd>
      </>
    )
  }
}

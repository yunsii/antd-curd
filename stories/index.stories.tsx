import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
import { Button, Card, Switch, Form, Radio, message } from 'antd';
// import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ItemConfig } from 'antd-form-mate/dist/lib/props'
import { Curd, FormConfigProvider } from '../src';
import StandardTable from '../src/components/StandardTable';
import StandardList from '../src/components/StandardList';
import renderCard from './CustomCard';
import CurdListDemo from './CurdListDemo';
import setFormItemsConfig from './map';
import { columns, data } from './mock';

function handleDelete(record, list: any[]) {
  const { parent_id, id } = record;
  if (parent_id) {
    const targetIndex = list.findIndex(item => item.id === parent_id);
    delete list[targetIndex].children;
    return list;
  }
  return list.filter(item => item.id !== id);
}

const { QueryPanel, CurdTable } = Curd;
const { Group: RadioGroup } = Radio;

const queryArgsConfig: ItemConfig[] = [
  {
    type: 'string',
    field: 'deviceNumber',
    formItemProps: {
      label: '设备编号',
    },
  },
  {
    type: 'string',
    field: 'place',
    formItemProps: {
      label: '位置',
    },
  },
  {
    type: 'string',
    field: 'productNumber',
    formItemProps: {
      label: '商品编号',
    },
  },
  {
    type: 'date',
    field: 'endDay',
    formItemProps: {
      label: '商品过期日期',
    },
    componentProps: {
      placeholder: '查询过期日期前的商品',
    },
  },
  {
    type: 'string',
    field: 'address',
    formItemProps: {
      label: '地址',
    },
  },
];

class QueryPanelDemo extends React.Component {
  queryPanel = {};

  render() {
    return (
      <React.Fragment>
        <Card>
          <Button
            onClick={() => {
              const { props: queryPanelProps } = this.queryPanel as any;
              if (queryPanelProps) {
                queryPanelProps.form.setFieldsValue({
                  deviceNumber: '123321',
                })
              }
            }}
          >
            外部写入
          </Button>
        </Card>
        <Card bordered={false}>
          <QueryPanel
            queryArgsConfig={queryArgsConfig}
            wrappedComponentRef={(self) => {
              console.log(self);
              this.queryPanel = self;
            }}
            onValuesChange={(changedValues, allValues) => {
              const { props: queryPanelProps } = this.queryPanel as any;
              console.log(queryPanelProps ? queryPanelProps.form.getFieldsValue() : {});
            }}
          />
        </Card>
      </React.Fragment>

    )
  }
}

class StandardTableDemo extends React.Component {
  state = {
    selectedRows: [],
    checkable: true,
    pagination: true,
    mockData: data,
  }

  render() {
    const { selectedRows, checkable, pagination, mockData } = this.state;
    console.log(pagination)
    return (
      <React.Fragment>
        <Card>
          <Form layout="inline">
            <Form.Item label="多选" >
              <Switch
                checked={checkable}
                onChange={() => {
                  this.setState({
                    checkable: !checkable,
                  })
                }}
              />
            </Form.Item>
            <Form.Item label="分页器" >
              <Switch
                checked={pagination}
                onChange={() => {
                  this.setState({
                    pagination: !pagination,
                  })
                }}
              />
            </Form.Item>
          </Form>
        </Card>
        <Card bordered={false}>
          <StandardTable
            columns={columns}
            data={mockData}
            selectedRows={selectedRows}
            onSelectRow={(row) => {
              console.log(row);
              this.setState({ selectedRows: row });
            }}
            checkable={checkable}
            pagination={pagination ? {} : false}
          />
        </Card>
      </React.Fragment>
    )
  }
}

class CurdTableDemo extends React.Component<any, any> {
  state = {
    selectedRows: [],
    checkable: true,
    showOperators: true,
    popupType: 'drawer',
    mockData: data,

    filteredInfo: null as any,
    sortedInfo: null as any,
  };

  __curd__: Curd<any>;

  columns = () => {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    return [
      {
        title: '姓名',
        dataIndex: 'name',
        filters: [{ text: '孙珍妮', value: 'szn' }, { text: '陈美君', value: 'cmj' }],
        filterMultiple: false,
        filteredValue: filteredInfo.name || null,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
      },
      {
        title: '生日',
        dataIndex: 'birthday',
        sorter: (a, b) => a.birthday - b.birthday,
        sortOrder: sortedInfo.columnKey === 'birthday' && sortedInfo.order,
        filters: [{ text: '05.05', value: '05.05' }, { text: '01.15', value: '01.15' }],
        filteredValue: filteredInfo.birthday || null,
      },
      {
        title: '特长',
        dataIndex: 'speciality',
      },
      {
        title: '爱好',
        dataIndex: 'habit',
        sorter: (a, b) => a.habit.length - b.habit.length,
        sortOrder: sortedInfo.columnKey === 'habit' && sortedInfo.order,
      },
    ]
  }

  setBirthdaySort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'birthday',
      },
    });
    if (this.__curd__) {
      const { searchParams } = this.__curd__.state;
      this.__curd__.setState({
        searchParams: {
          ...searchParams,
          sorter: "birthday_descend",
        }
      })
    }
  };

  clearFilters = () => {
    this.setState({ filteredInfo: null });
    if (this.__curd__) {
      const { searchParams } = this.__curd__.state;
      const { name, birthday, ...rest } = searchParams;
      this.__curd__.setState({
        searchParams: {
          ...rest,
        }
      })
    }
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
    if (this.__curd__) {
      const { searchParams } = this.__curd__.state;
      const { page, limit } = searchParams;
      this.__curd__.setState({
        searchParams: {
          page,
          limit,
        }
      })
    }
  };

  render() {
    const { selectedRows, checkable, showOperators, popupType, mockData } = this.state;
    return (
      <FormConfigProvider
        value={{
          commenExtra: {
            picture: '自定义图片默认提示',
          }
        }}
      >
        <Card>
          <Form layout="inline">
            <Form.Item label="多选" >
              <Switch
                checked={checkable}
                onChange={() => {
                  this.setState({
                    checkable: !checkable,
                  })
                }}
              />
            </Form.Item>
            <Form.Item label="操作栏" >
              <Switch
                checked={showOperators}
                onChange={() => {
                  this.setState({
                    showOperators: !showOperators,
                  })
                }}
              />
            </Form.Item>
            <Form.Item label="弹窗">
              <RadioGroup onChange={(event) => this.setState({ popupType: event.target.value })} value={popupType}>
                <Radio value="drawer">抽屉</Radio>
                <Radio value="modal">模态框</Radio>
              </RadioGroup>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.setBirthdaySort}>以生日排序</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.clearFilters}>清除过滤器</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={this.clearAll}>清除过滤器和排序器</Button>
            </Form.Item>
          </Form>
        </Card>
        <Curd ref={(curd: any) => { this.__curd__ = curd }} {...this.props} data={mockData}>
          <CurdTable
            columns={this.columns()}
            selectedRows={selectedRows}
            onSelectRow={(row) => {
              console.log(row);
              this.setState({ selectedRows: row });
            }}
            checkable={checkable}
            popupType={popupType as any}
            popupProps={{
              getFormInstance: (form) => {
                console.log(form);
              }
            }}
            setFormItemsConfig={setFormItemsConfig as any}
            showOperators={showOperators}
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
        </Curd>
      </FormConfigProvider>
    )
  }
}

class CurdDemo extends React.Component<any, any> {
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
            <Curd.QueryPanel queryArgsConfig={this.queryArgsConfig} />
          </Card>
          <div style={{ width: '100%', height: 16, background: '#eee' }}></div>
          <Card>
            <CurdTable
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

class StandardListDemo extends React.Component {
  state = {
    mockData: data,
  }

  render() {
    const { mockData } = this.state;
    return (
      <StandardList
        data={mockData}
        renderItem={renderCard}
      />
    )
  }
}

storiesOf('custom components', module)
  .add('QueryPanel', () => <QueryPanelDemo />)
  .add('StandardTable', () => <StandardTableDemo />)
  .add('StandardList', () => <StandardListDemo />)
  .add('CurdTable', () => <CurdTableDemo />)
  .add('CurdList', () => <CurdListDemo />)
  .add('CurdDemo', () => <CurdDemo />);

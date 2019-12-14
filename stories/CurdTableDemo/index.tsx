import * as React from 'react';
import { Button, Card, Switch, Form, Radio, message } from 'antd';
import { Curd, FormConfigProvider } from '../../src';
import { InternalCurd } from '../../src/Curd';
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

const { Group: RadioGroup } = Radio;

export default class CurdTableDemo extends React.Component<any, any> {
  state = {
    selectedRows: [],
    checkable: true,
    showOperators: true,
    popupType: 'drawer',
    mockData: data,

    filteredInfo: null as any,
    sortedInfo: null as any,
  };

  __curd__: InternalCurd<any>;

  columns = () => {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    return [
      {
        key: 'name',
        title: '姓名',
        dataIndex: 'name',
        filters: [{ text: '孙珍妮', value: 'szn' }, { text: '陈美君', value: 'cmj' }],
        filterMultiple: false,
        // onFilter: (value, record) => {
        //   return record.id.includes(value);
        // },
        filteredValue: filteredInfo.name || null,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
      },
      {
        key: 'birthday',
        title: '生日',
        dataIndex: 'birthday',
        sorter: (a, b) => a.birthday - b.birthday,
        sortOrder: sortedInfo.columnKey === 'birthday' && sortedInfo.order,
        filters: [{ text: '05.05', value: '05.05' }, { text: '01.15', value: '01.15' }],
        // onFilter: (value, record) => {
        //   return record.birthday.includes(value);
        // },
        filteredValue: filteredInfo.birthday || null,
      },
      {
        key: 'speciality',
        title: '特长',
        dataIndex: 'speciality',
      },
      {
        key: 'habit',
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
      console.log(this.__curd__.state);
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
        <Curd
          innerRef={(curd: any) => {
            console.log(curd);
            this.__curd__ = curd;
          }}
          {...this.props}
          data={mockData}
        >
          <Curd.Table
            columns={this.columns()}
            selectedRows={selectedRows}
            onSelectRow={(row) => {
              console.log(row);
              this.setState({ selectedRows: row });
            }}
            checkable={checkable}
            popup={popupType as any}
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

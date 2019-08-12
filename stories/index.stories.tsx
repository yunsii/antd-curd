import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// import * as moment from 'moment';
import { Button, Card, Switch, Form, Radio } from 'antd';
// import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Curd } from '../src';
import StandardTable from '../src/components/StandardTable';
import StandardList from '../src/components/StandardList';
import './antd-form-mate';
import renderCard from './CustomCard';
import CurdListDemo from './CurdListDemo';
import setFormItemsConfig from './map';
import { columns, data as mockData } from './mock';

const { QueryPanel, CurdTable } = Curd;
const { Group: RadioGroup } = Radio;

const queryArgsConfig = [
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
    type: 'picture',
    field: 'picture',
    formItemProps: {
      label: '图片',
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
  }

  render() {
    const { selectedRows, checkable, pagination } = this.state;
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

class CurdTableDemo extends React.Component {
  state = {
    selectedRows: [],
    checkable: true,
    operators: true,
    popupType: 'drawer',

    filteredInfo: null as any,
    sortedInfo: null as any,
  };

  curd: Curd;

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
    if (this.curd) {
      const { searchParams } = this.curd.state;
      this.curd.setState({
        searchParams: {
          ...searchParams,
          sorter: "birthday_descend",
        }
      })
    }
  };

  clearFilters = () => {
    this.setState({ filteredInfo: null });
    if (this.curd) {
      const { searchParams } = this.curd.state;
      const { name, birthday, ...rest } = searchParams;
      this.curd.setState({
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
    if (this.curd) {
      const { searchParams } = this.curd.state;
      const { page, limit } = searchParams;
      this.curd.setState({
        searchParams: {
          page,
          limit,
        }
      })
    }
  };

  render() {
    const { selectedRows, checkable, operators, popupType } = this.state;
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
            <Form.Item label="操作栏" >
              <Switch
                checked={operators}
                onChange={() => {
                  this.setState({
                    operators: !operators,
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
        <Curd onRef={(curd) => this.curd = curd}>
          <CurdTable
            columns={this.columns()}
            data={mockData}
            selectedRows={selectedRows}
            onSelectRow={(row) => {
              console.log(row);
              this.setState({ selectedRows: row });
            }}
            checkable={checkable}
            popupType={popupType as any}
            setFormItemsConfig={setFormItemsConfig as any}
            actionsConfig={{
              confirmProps: {
                okText: '确定',
                cancelText: '取消',
              }
            } as any}
            operators={operators}
            interceptors={{
              handleFilterAndSort: (filters, sorter) => {
                this.setState({
                  filteredInfo: filters,
                  sortedInfo: sorter,
                });
              }
            }}
          />
        </Curd>
      </React.Fragment>
    )
  }
}

class StandardListDemo extends React.Component {
  render() {
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
  .add('CurdList', () => <CurdListDemo />);

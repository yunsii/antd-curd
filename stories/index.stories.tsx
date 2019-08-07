import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// import * as moment from 'moment';
import { Button, Card, Switch, Form } from 'antd';
// import { WrappedFormUtils } from 'antd/lib/form/Form';
import Curd from '../src';
import StandardTable from '../src/components/StandardTable';
import FormMateContext from '../src/FormMateContext';
import { FormProvider, createFormItems } from './antd-form-mate';
import setFormItemsConfig from './map';

const { QueryPanel, CurdTable } = Curd;

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
    field: 'productNumber',
    formItemProps: {
      label: '商品编号',
    },
  },
  {
    type: 'date',
    field: 'endDay',
    formItemProps: {
      label: '过期日期',
    },
    componentProps: {
      placeholder: '查询过期日期前的所有商品',
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
  }

  columns = [
    {
      title: '公式照',
      dataIndex: 'avatar',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
    },
    {
      title: '特长',
      dataIndex: 'speciality',
    },
    {
      title: '爱好',
      dataIndex: 'habit',
    },
  ];

  data = {
    list: [
      {
        id: 'szn',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn1',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj2',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn3',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj4',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn5',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj6',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn7',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj8',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn9',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj11',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
    ]
  }

  render() {
    const { selectedRows, checkable } = this.state;
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
          </Form>
        </Card>
        <Card bordered={false}>
          <StandardTable
            columns={this.columns}
            data={this.data}
            selectedRows={selectedRows}
            onSelectRow={(row) => {
              console.log(row);
              this.setState({ selectedRows: row });
            }}
            checkable={checkable}
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
  }

  columns = [
    {
      title: '公式照',
      dataIndex: 'avatar',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
    },
    {
      title: '特长',
      dataIndex: 'speciality',
    },
    {
      title: '爱好',
      dataIndex: 'habit',
    },
  ];

  data = {
    list: [
      {
        id: 'szn',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn1',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj2',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn3',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj4',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn5',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj6',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn7',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj8',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
      {
        id: 'szn9',
        avatar: 'xxx',
        name: '孙珍妮',
        nickname: '珍妮',
        birthday: '05.05',
        speciality: '唱歌、吉他',
        habit: '吃东西、逛街',
      },
      {
        id: 'cmj11',
        avatar: 'xxx',
        name: '陈美君',
        nickname: 'MIMI',
        birthday: '01.15',
        speciality: '钢琴、吉他',
        habit: '旅游、宅',
      },
    ]
  }

  render() {
    const { selectedRows, checkable } = this.state;
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
          </Form>
        </Card>
        <FormMateContext.Provider
          value={{
            FormProvider,
            createFormItems,
          }}
        >
          <Curd>
            <CurdTable
              modelName='test'
              columns={this.columns}
              data={this.data}
              selectedRows={selectedRows}
              onSelectRow={(row) => {
                console.log(row);
                this.setState({ selectedRows: row });
              }}
              checkable={checkable}
              setFormItemsConfig={setFormItemsConfig as any}
            />
          </Curd>
        </FormMateContext.Provider>
      </React.Fragment>
    )
  }
}

storiesOf('custom components', module)
  .add('QueryPanel', () => <QueryPanelDemo />)
  .add('StandardTable', () => <StandardTableDemo />)
  .add('CurdTable', () => <CurdTableDemo />);

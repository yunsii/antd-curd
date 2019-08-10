import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// import * as moment from 'moment';
import { Button, Card, Switch, Form, Radio } from 'antd';
// import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Curd } from '../src';
import StandardTable from '../src/components/StandardTable';
import StandardList from '../src/components/StandardList';
import FormMateContext from '../src/FormMateContext';
import { FormProvider, createFormItems } from './antd-form-mate';
import renderCard from './CustomCard';
import CurdListDemo from './CurdList';
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
          <FormMateContext.Provider
            value={{
              FormProvider,
              createFormItems,
            }}
          >
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
          </FormMateContext.Provider>
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
  }

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
              columns={columns}
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
            />
          </Curd>
        </FormMateContext.Provider>
      </React.Fragment>
    )
  }
}

class StandardListDemo extends React.Component {
  render() {
    return (
      <StandardList
        data={mockData.list}
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

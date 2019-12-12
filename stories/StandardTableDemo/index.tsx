import * as React from 'react';
import { Card, Switch, Form } from 'antd';
import { StandardTable } from '../../src';
import { columns, data } from '../mock';

export default class StandardTableDemo extends React.Component {
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

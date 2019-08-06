import * as React from 'react';
import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// import * as moment from 'moment';
import { Button, Card } from 'antd';
// import { WrappedFormUtils } from 'antd/lib/form/Form';
import Curd from '../src';

const { QueryPanel } = Curd;

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
        <Curd>
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
        </Curd>
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
      </React.Fragment>

    )
  }
}

storiesOf('custom components', module)
  .add('QueryPanel', () => <QueryPanelDemo />);

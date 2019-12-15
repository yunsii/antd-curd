import * as React from 'react';
import { Button, Card } from 'antd';
import { createFormItems } from 'antd-form-mate';
import { ItemConfig } from 'antd-form-mate/dist/lib/props'
import { Curd, ConfigProvider } from '../../src';
import { CurdQueryPanel } from '../../src/curd-components/CurdQuery';

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
  {
    type: 'datetime-range',
    field: 'period',
    formItemProps: {
      label: '有效期',
    },
  },
];

export default class QueryPanelDemo extends React.Component {
  curdQuery: CurdQueryPanel;

  render() {
    return (
      <ConfigProvider
        acLocale={{
          queryPanel: {
            search: 'search',
          }
        }}
        createFormItemsFn={createFormItems}
      >
        <Card>
          <Button
            onClick={() => {
              if (this.curdQuery) {
                // this.curdQuery.form.setFieldsValue({
                //   deviceNumber: '123321',
                // })
                this.curdQuery.setFieldsValueAndSearch({ deviceNumber: '123321' });
              }
            }}
          >
            外部写入
          </Button>
        </Card>
        <Card bordered={false}>
          <Curd.Query
            queryArgsConfig={queryArgsConfig}
            ref={((self) => {
              this.curdQuery = self;
            }) as any}
            onValuesChange={(changedValues, allValues) => {
              console.log(changedValues);
            }}
          />
        </Card>
      </ConfigProvider>
    )
  }
}


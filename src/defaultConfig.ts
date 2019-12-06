import { SorterResult } from 'antd/lib/table';

export const formatSorter: (sorter: SorterResult<any>) => any
  = (sorter: SorterResult<any>) => `${sorter.field}_${sorter.order}`

export const searchFieldName = {
  page: 'page',
  limit: 'limit',
  sortor: 'sortor',
}

export const debounceWait = 600;

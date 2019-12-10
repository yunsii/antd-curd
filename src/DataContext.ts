import React from 'react';
import Curd from './Curd';

export interface SharedData<T> {
  modelName?: string;
  data?: { list: T[]; pagination?: any };
  __curd__?: Curd<T>;
}

const DataContext = React.createContext<SharedData<any>>({});

export default DataContext;

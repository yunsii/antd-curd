import React from 'react';

export interface SharedData<T> {
	modelName: string;
	data: { list: T[]; pagination?: any };
}

const DataContext = React.createContext<SharedData<any>>({
	modelName: '',
	data: {
		list: []
	}
});

export default DataContext;

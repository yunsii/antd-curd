import React from 'react';

export interface SharedData {
	modelName: string;
	data: { list: any[]; pagination?: any };
}

const DataContext = React.createContext<SharedData>({
	modelName: '',
	data: {
		list: []
	}
});

export default DataContext;

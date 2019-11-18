import React, { PureComponent } from 'react';
import { Card } from 'antd';
import CurdTable from './components/CurdTable/index';
import CurdList from './components/CurdList/index';
import QueryPanel from './components/QueryPanel/index';
import { injectChildren } from './utils';
import DataContext from './DataContext';
import { searchFieldName } from './config';

function DefaultWrapper(props: React.PropsWithChildren<any>) {
	const { children } = props;
	return (
		<Card bordered={false}>
			{children}
		</Card>
	)
}

export interface CurdProps<T> extends React.Props<T> {
	modelName: string;
	data: { list: T[]; pagination?: any };
	dispatch: Function;
	wrapper?: React.ComponentClass | null;
}

export interface CurdState {
	/** sharing query panel search form */
	searchForm: any;
	/** sharing table's pagination, filter and sorter params */
	searchParams: any;
}

class Curd<T> extends PureComponent<CurdProps<T>, CurdState> {
	static defaultProps = {
		modelName: '',
		wrapper: DefaultWrapper,
		dispatch: () => { },
	};

	static QueryPanel = QueryPanel;
	static CurdTable = CurdTable;
	static CurdList = CurdList;

	state = {
		searchForm: {} as any,
		searchParams: {} as any
	};

	componentDidUpdate() {
		if (process.env.NODE_ENV === 'development') {
			const { searchForm, searchParams } = this.state;
			console.log("latest curd's state:");
			console.log('searchForm', searchForm);
			console.log('searchParams', searchParams);
		}
	}

	doSearch = () => {
		const { modelName, dispatch } = this.props;
		const { searchForm, searchParams } = this.state;
		dispatch({
			type: `${modelName}/fetch`,
			payload: { ...searchForm, ...searchParams }
		});
	}

	public handleSearch = (type?: 'create' | 'update' | 'delete') => {
		const { data: { list } } = this.props;
		const { searchParams } = this.state;
		const currentPage = searchParams[searchFieldName.page];
		if (type === 'delete' && list.length === 1 && currentPage > 1) {
			this.setState(
				{
					searchParams: {
						...searchParams,
						[searchFieldName.page]: searchParams[searchFieldName.page] - 1,
					}
				},
				() => this.doSearch(),
			);
		} else {
			this.doSearch();
		}
	};

	renderChildren = () => {
		const { children } = this.props;
		return injectChildren(children, { __curd__: this });
	};

	render() {
		const { modelName, data, wrapper } = this.props;
		return (
			<DataContext.Provider value={{ modelName, data, __curd__: this }}>
				{wrapper ? React.createElement(wrapper, null, this.renderChildren()) : this.renderChildren()}
			</DataContext.Provider>
		);
	}
}

export default Curd;

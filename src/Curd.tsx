import React, { PureComponent } from 'react';
import { Card } from 'antd';
import _get from 'lodash/get';
import CurdTable, { CustomStandardTableProps } from './curd-components/CurdTable/index';
import CurdList, { CustomStandardListProps } from './curd-components/CurdList/index';
// import DetailDrawer from './components/DetailDrawer/index';
// import DetailModal from './components/DetailModal/index';
import CurdQuery from './curd-components/CurdQuery';
import { injectChildren } from './utils';
import ConfigContext from './ConfigContext';
import DataContext from './DataContext';
import { searchFieldName } from './defaultConfig';
import { withCurdBox } from './curd-components/CurdBox'

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
  /** antd-curd's wrapper, default is no bordered Card */
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

	static Query = CurdQuery;
	static Table = withCurdBox<CustomStandardTableProps<any>>(CurdTable);
	static List = withCurdBox<CustomStandardListProps<any>>(CurdList);

	state = {
		searchForm: {} as any,
		searchParams: {} as any
	};

	pageFieldName = searchFieldName.page;

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
		const currentPage = searchParams[this.pageFieldName];
		if (type === 'delete' && list.length === 1 && currentPage > 1) {
			this.setState(
				{
					searchParams: {
						...searchParams,
						[this.pageFieldName]: searchParams[this.pageFieldName] - 1,
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
			<ConfigContext.Consumer>
				{({ searchFieldName }) => {
					const fieldName = _get(searchFieldName, 'page');
					if (fieldName) {
						this.pageFieldName = fieldName;
					}

					return (
						<DataContext.Provider value={{ modelName, data, __curd__: this }}>
							{wrapper ? React.createElement(wrapper, null, this.renderChildren()) : this.renderChildren()}
						</DataContext.Provider>
					)
				}}
			</ConfigContext.Consumer>
		);
	}
}

export default Curd;

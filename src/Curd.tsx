import React, { PureComponent } from 'react';
import { Card } from 'antd';
import _get from 'lodash/get';
import CurdTable, { CustomStandardTableProps } from './curd-components/CurdTable/index';
import CurdList, { CustomStandardListProps } from './curd-components/CurdList/index';
import CurdQuery from './curd-components/CurdQuery';
import { injectChildren } from './utils';
import ConfigContext, { ConfigConsumerProps } from './config-provider/context';
import DataContext from './DataContext';
import { withCurdBox, SearchableMode } from './curd-components/CurdBox';

function DefaultWrapper(props: React.PropsWithChildren<any>) {
	const { children } = props;
	return (
		<Card bordered={false}>
			{children}
		</Card>
	)
}

export interface CurdProps<T> {
	modelName?: string;
	data: { list: T[]; pagination?: any };
	dispatch?: Function;
	/** antd-curd's wrapper, default is no bordered Card */
	wrapper?: React.ComponentClass | null;
	innerRef?: React.Ref<InternalCurd<T>>;
}

interface InternalCurdProps<T> extends CurdProps<T> {
	pageFieldName: string;
}

export interface InternalCurdState {
	/** sharing query panel search form */
	searchForm: any;
	/** sharing table's pagination, filter and sorter params */
	searchParams: any;
}

export class InternalCurd<T> extends PureComponent<InternalCurdProps<T>, InternalCurdState> {
	static defaultProps = {
		modelName: '',
		wrapper: DefaultWrapper,
		dispatch: () => { },
	};

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
		const { modelName, dispatch = () => { } } = this.props;
		const { searchForm, searchParams } = this.state;
		dispatch({
			type: `${modelName}/fetch`,
			payload: { ...searchForm, ...searchParams }
		});
	}

	public handleSearch = (type?: SearchableMode) => {
		const { data: { list }, pageFieldName } = this.props;
		const { searchParams } = this.state;
		const currentPage = searchParams[pageFieldName];
		if (type === 'delete' && list.length === 1 && currentPage > 1) {
			this.setState(
				{
					searchParams: {
						...searchParams,
						[pageFieldName]: searchParams[pageFieldName] - 1,
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

export default class Curd<T> extends React.Component<CurdProps<T>> {

	static Query = CurdQuery;

	static Table = withCurdBox<CustomStandardTableProps<any>>(CurdTable);

	static List = withCurdBox<CustomStandardListProps<any>>(CurdList);

	render() {
		const { innerRef, ...rest } = this.props;
		return (
			<ConfigContext.Consumer>
				{({ searchFieldName: { page } }: ConfigConsumerProps) => <InternalCurd {...rest} ref={innerRef} pageFieldName={page} />}
			</ConfigContext.Consumer>
		)
	}
}

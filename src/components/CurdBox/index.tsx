import React, { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import { FormProps } from 'antd/lib/form';
import { PaginationConfig, SorterResult, TableCurrentDataSource } from 'antd/lib/table';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import { ItemConfig } from 'antd-form-mate/dist/lib/form-mate';
import _cloneDeep from 'lodash/cloneDeep';
import { setActions, ActionType } from './actions/index';
import { injectChildren } from '../../utils';
import Operators from './Operators/index';
import StandardTable from '../StandardTable/index';
import StandardList from '../StandardList/index';
import DetailFormDrawer from '../DetailFormDrawer/index';
import DetailFormModal from '../DetailFormModal/index';
import { CreateName, DetailName, UpdateName } from '../../constants';
import { formatSorter, searchFieldName } from '../../config';
import { callFunctionIfFunction } from '../../utils';
import Curd from '../../Curd';
import { DetailFormModalProps } from '../DetailFormModal/index';
import { DetailFormDrawerProps } from '../DetailFormDrawer/index';
import { curdLocale } from '../../locale';

export interface CustomDetailFormDrawerProps extends DetailFormDrawerProps {
	drawerConfig: {
		title?: never;
		visible?: never;
		onClose?: never;
	};
	onOk?: never;
	itemsConfig: never;
	loading?: never;
}

export interface CustomDetailFormModalProps extends DetailFormModalProps {
	modalConfig: {
		title?: never;
		visible?: never;
		onClose?: never;
		onOk?: never;
	};
	itemsConfig: never;
	loading?: never;
}

const getValue = (obj) => Object.keys(obj).map((key) => obj[key]).join(',');

export type RecordSelection = {
	selectedRowKeys: number[];
	onSelectChange: (selectedRowKeys: any[]) => void;
	getCheckboxProps: (record: any) => any;
};

export type RenderItemConfig = {
	record: any;
	actions: React.ReactNode[] | null;
	recordSelection: RecordSelection;
	checkable?: boolean;
};

async function updateFieldsValueByInterceptors<T>(fieldsValue, interceptors: CurdBoxProps<T>['interceptors'] = {}, mode) {
	const { updateFieldsValue } = interceptors;
	let newFieldsValue = _cloneDeep(fieldsValue);
	if (updateFieldsValue) {
		newFieldsValue = await updateFieldsValue(fieldsValue, mode);
	}
	return newFieldsValue;
}

function getModelName<T>(props: CurdBoxProps<T>) {
	const { __curd__ } = props;
	if (__curd__) {
		return __curd__.props.modelName;
	}
	throw new Error("CurdBox can't get modelName from __curd__");
}

function defaultHandleFilterAndSort(
	filtersArg = {} as Record<keyof any, string[]>,
	sorter = {} as SorterResult<any>,
	extra?: TableCurrentDataSource<any>
) {
	console.log(filtersArg, sorter);
	let result: any = {};
	const filters = Object.keys(filtersArg).reduce((obj, key) => {
		const newObj = { ...obj };
		if (filtersArg[key]) {
			newObj[key] = getValue(filtersArg[key]);
		}
		return newObj;
	}, {});
	result = {
		...filters
	};
	if (sorter.field) {
		result[searchFieldName.sortor] = formatSorter(sorter);
	}
	return { ...result };
}

export interface ActionsConfig {
	showActionsCount?: number;
	extraActions?: ActionType[];
	/** number[] or [number, setTitle()][] */
	confirmKeys?: (number | [number, (record?: any) => string])[];
	confirmProps?: PopconfirmProps;
	hideActions?: number[] | ((record?: any) => void | number[]);
	disabledActions?: (record?: any) => void | number[];
	detailActionTitle?: string;
	updateActionTitle?: string;
	deleteActionTitle?: string;
}

export interface CurdBoxProps<T> {
	/** popup title of create */
	createTitle?: string;
	/** popup title of detail */
	detailTitle?: string;
	/** popup title of update */
	updateTitle?: string;
	fetchLoading?: boolean;
	createLoading?: boolean;
	detailLoading?: boolean;
	updateLoading?: boolean;
	deleteLoading?: boolean;
	/** if value is '' or false, hide the button */
	createButtonName?: string | false;
	popupType?: 'modal' | 'drawer' | null;
	popupProps?: CustomDetailFormDrawerProps | CustomDetailFormModalProps;
	setFormItemsConfig?: (detail: {}, mode: 'create' | 'detail' | 'update', form?: FormProps['form']) => ItemConfig[];
	afterPopupClose?: () => void;
	interceptors?: {
		/** update form values after click ok */
		updateFieldsValue?: (fieldsValue: any, mode?: 'create' | 'update') => any;
		/** callback on click create button, will break default behavior if return value is true */
		handleCreateClick?: () => boolean | undefined;
		/** callback on click detail button, will break default behavior if return value is true */
		handleDetailClick?: (record: any) => boolean | undefined;
		/** callback on click update button, will break default behavior if return value is true */
		handleUpdateClick?: (record: any) => boolean | undefined;
		handleDeleteClick?: (record: any) => void;
		/** custom how to generate params to query when change of filter or sorter */
		handleFilterAndSort?: (
			filtersArg: Record<keyof any, string[]>,
			sorter: SorterResult<any>,
			extra?: TableCurrentDataSource<any>
		) => any;
	};
	detail?: {};
	actionsConfig?: ActionsConfig | false | null;
	operators?: React.ReactNode[] | boolean | null;
	dispatch?: any;
	/** call model's fetch effect when componentDidMount */
	autoFetch?: boolean;
	reSearchAfterUpdate?: boolean;
	__curd__?: Curd<T>;
}

interface CurdState {
	popupVisible: string | null;
	record: any;
}

class CurdBox<T> extends PureComponent<CurdBoxProps<T>, CurdState> {
	static defaultProps = {
		createTitle: '新建对象',
		detailTitle: '对象详情',
		updateTitle: '编辑对象',
		fetchLoading: false,
		createLoading: false,
		updateLoading: false,
		deleteLoading: false,
		createButtonName: '新建',
		dispatch: () => { },
		queryArgsConfig: [],
		queryPanelProps: {},
		containerType: 'table',
		containerProps: {},
		actionsConfig: {},
		popupType: 'drawer',
		popupProps: {},
		setFormItemsConfig: () => [],
		interceptors: {},
		operators: [],
		autoFetch: true,
		reSearchAfterUpdate: false,
		__curd__: null
	};

	static StandardTable = StandardTable;
	static StandardList = StandardList;

	state = {
		popupVisible: null,
		record: {} as any
	};

	componentDidMount() {
		const { dispatch, autoFetch } = this.props;
		if (autoFetch) {
			dispatch({
				type: `${getModelName(this.props)}/fetch`
			});
		}
	}

	willFetchDetail = () => {
		return DetailName in this.props && 'detailLoading' in this.props;
	};

	fetchDetail = (record) => {
		const { dispatch } = this.props;
		dispatch({
			type: `${getModelName(this.props)}/detail`,
			id: record.id
		});
	};

	fetchDetailOrNot = (record) => {
		if (this.willFetchDetail()) {
			this.fetchDetail(record);
		}
	};

	handleVisible = (action, visible, record?: any) => {
		const { interceptors = {} } = this.props;
		const { handleCreateClick } = interceptors;
		if (handleCreateClick && action === CreateName) {
			const isBreak = handleCreateClick();
			if (isBreak) return;
		}
		this.setState({
			popupVisible: action
		});
		if (visible) {
			this.setState({
				record: record || {}
			});
		}
	};

	reSearch = (type?: 'create' | 'update' | 'delete') => {
		const { __curd__ } = this.props;
		if (__curd__) {
			__curd__.handleSearch(type);
		}
	};

	deleteModel = (id) => {
		const { dispatch } = this.props;
		dispatch({
			type: `${getModelName(this.props)}/delete`,
			id,
			onOk: () => {
				message.success(curdLocale.deleteOk);
				this.reSearch('delete');
			},
		});
	};

	setActionsMethod = () => {
		const { interceptors } = this.props;
		return {
			fetchDetailOrNot: this.fetchDetailOrNot,
			handleVisible: this.handleVisible,
			deleteModel: this.deleteModel,
			interceptors
		};
	};

	renderActions = (record: any) => {
		const { actionsConfig } = this.props;
		if (actionsConfig) {
			const { confirmKeys, ...rest } = actionsConfig;
			return setActions(record, this.setActionsMethod(), {
				...rest,
				confirmKeys: confirmKeys || [12]
			});
		}
		return null;
	};

	setPopupModeAndRecord = () => {
		const { popupVisible, record } = this.state;
		if (popupVisible === DetailName) {
			return [DetailName, record];
		}
		if (popupVisible === UpdateName) {
			return [UpdateName, record];
		}
		return [CreateName, {}];
	};

	getPopupTitle = () => {
		const { createTitle, detailTitle, updateTitle } = this.props;
		const { popupVisible } = this.state;
		if (popupVisible === DetailName) {
			return detailTitle;
		}
		if (popupVisible === UpdateName) {
			return updateTitle;
		}
		return createTitle;
	};

	closePopup = () => this.setState({ popupVisible: null });

	handleCreateOk = async (fieldsValue) => {
		console.log('handleCreateOk', fieldsValue);
		const { interceptors, dispatch } = this.props;
		const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, CreateName);
		if (!newFieldsValue) return;
		dispatch({
			type: `${getModelName(this.props)}/create`,
			payload: newFieldsValue,
			onOk: () => {
				message.success(curdLocale.createOk);
				this.closePopup();
				this.reSearch('create');
			}
		});
	};

	handleUpdateOk = async (fieldsValue) => {
		console.log('handleUpdateOk', fieldsValue);
		const { dispatch, interceptors, reSearchAfterUpdate } = this.props;
		const { record } = this.state;
		const newFieldsValue = await updateFieldsValueByInterceptors(fieldsValue, interceptors, UpdateName);
		if (!newFieldsValue) return;
		dispatch({
			type: `${getModelName(this.props)}/update`,
			id: record.id,
			payload: newFieldsValue,
			onOk: () => {
				message.success(curdLocale.updateOk);
				this.closePopup();
				if (reSearchAfterUpdate) {
					this.reSearch('update');
				}
			}
		});
	};

	handleOk = (fieldsValue) => {
		const { popupVisible } = this.state;
		if (popupVisible === DetailName) {
			this.closePopup();
			return;
		}
		if (popupVisible === UpdateName) {
			this.handleUpdateOk(fieldsValue);
			return;
		}
		this.handleCreateOk(fieldsValue);
	};

	// https://ant.design/components/table-cn/#components-table-demo-reset-filter
	// 只支持一个 sorter
	handleDataChange = (
		pagination: PaginationConfig,
		filtersArg = {} as Record<keyof any, string[]>,
		sorter = {} as SorterResult<any>,
		extra?: TableCurrentDataSource<any>
	) => {
		// console.log('pagination', pagination);
		// console.log('filtersArg', filtersArg);
		// console.log('sorter', sorter);
		const { interceptors = {}, __curd__ } = this.props;
		const { handleFilterAndSort = () => { } } = interceptors;

		const hasCustomFilterAndSorter: boolean = handleFilterAndSort && handleFilterAndSort(filtersArg, sorter, extra);

		const params = {
			[searchFieldName.page]: pagination.current,
			[searchFieldName.limit]: pagination.pageSize,
			...hasCustomFilterAndSorter
				? handleFilterAndSort(filtersArg, sorter, extra)
				: defaultHandleFilterAndSort(filtersArg, sorter, extra)
		};

		// console.log('changed params', params);
		// sync curd's searchParams
		if (__curd__) {
			__curd__.setState({ searchParams: params }, () => {
				__curd__.handleSearch();
			});
		}
	};

	renderContainer = () => {
		const {
			actionsConfig,
			afterPopupClose,
			dispatch,
			createTitle,
			detailTitle,
			updateTitle,
			operators,
			createButtonName,
			fetchLoading,
			...rest
		} = this.props;

		const { children } = rest;

		return injectChildren(children, { __curdBox__: this });
	};

	renderPopup = () => {
		let result;
		const {
			detail,
			createLoading,
			detailLoading,
			updateLoading,
			setFormItemsConfig,
			popupType,
			popupProps,
			afterPopupClose
		} = this.props;
		const { popupVisible } = this.state;
		const { drawerConfig, modalConfig, ...restPopupProps } = popupProps as any;
		const loading = createLoading || detailLoading || updateLoading;
		const [mode, record] = this.setPopupModeAndRecord();
		const showDetail = [DetailName, UpdateName].includes(mode);

		const composePopupProps = {
			...modalConfig,
			...drawerConfig,
			title: this.getPopupTitle(),
			visible: !!popupVisible,
			onCancel: this.closePopup,
			onClose: this.closePopup
		};

		if (popupType === 'drawer') {
			result = (
				<DetailFormDrawer
					drawerConfig={{
						...composePopupProps,
						afterVisibleChange: (visible) => {
							if (!visible) {
								callFunctionIfFunction(afterPopupClose)();
							}
						}
					}}
					{...restPopupProps}
					loading={loading}
					onOk={this.handleOk}
					setItemsConfig={setFormItemsConfig}
					detail={this.willFetchDetail() && showDetail ? detail : record}
					mode={mode}
				/>
			);
		} else if (popupType === 'modal') {
			result = (
				<DetailFormModal
					modalConfig={{
						...composePopupProps,
						onOk: this.handleOk,
						afterClose: afterPopupClose
					}}
					{...restPopupProps}
					loading={loading}
					setItemsConfig={setFormItemsConfig}
					detail={this.willFetchDetail() && showDetail ? detail : record}
					mode={mode}
				/>
			);
		}
		return result;
	};

	render() {
		const { operators, createButtonName } = this.props;

		return (
			<Fragment>
				{operators ? (
					<Operators __curdBox__={this} createButtonName={createButtonName}>
						{operators as any}
					</Operators>
				) : null}
				{this.renderContainer()}
				{this.renderPopup()}
			</Fragment>
		);
	}
}

export default CurdBox;

import React, { useContext, Fragment } from 'react';
import StandardTable, { StandardTableProps } from '../StandardTable/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import { addDivider } from '../../utils';
import { injectChildren } from '../../utils';
import DataContext from '../../DataContext';

type NoDataStandardTableProps = Omit<StandardTableProps, 'data'>;

export interface CustomStandardTableProps extends NoDataStandardTableProps {
	__curdBox__?: CurdBox;
	columns: any[];
	fetchLoading?: boolean;
	children?: React.ReactChildren;
}

function CustomStandardTable(props: CustomStandardTableProps) {
	const { __curdBox__, columns, fetchLoading, children, ...rest } = props;
	const { data } = useContext(DataContext);
	if (__curdBox__) {
		const { handleDataChange } = __curdBox__;
		const enhanceColumns = () => {
			const { actionsConfig } = __curdBox__.props;
			if (!columns) return [];
			if (!actionsConfig) return columns;
			return [
				...columns,
				{
					title: '操作',
					render: (value, record) => {
						return addDivider(__curdBox__.renderActions(record));
					}
				}
			];
		};
		return (
			<Fragment>
				<StandardTable
					{...rest}
					data={data}
					loading={fetchLoading}
					columns={enhanceColumns()}
					onChange={handleDataChange}
				/>
				{injectChildren(children, { __curdBox__ })}
			</Fragment>
		);
	}
	return null;
}

export interface CurdTableProps extends CustomStandardTableProps, CurdBoxProps {}

export default function CurdTable(props: CurdTableProps) {
	return (
		<CurdBox {...props}>
			<CustomStandardTable {...props} />
		</CurdBox>
	);
}

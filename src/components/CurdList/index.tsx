import React, { useContext, Fragment } from 'react';
import StandardList, { StandardListProps } from '../StandardList/index';
import CurdBox, { CurdBoxProps } from '../CurdBox';
import { injectChildren } from '../../utils';
import DataContext from '../../DataContext';

type NoDataStandardTableProps = Omit<StandardListProps, 'data'>;

export interface CustomStandardListProps extends NoDataStandardTableProps {
	__curdBox__?: CurdBox;
	renderItem: StandardListProps['renderItem'];
	fetchLoading?: boolean;
	children?: React.ReactChildren;
}

function CustomStandardList(props: CustomStandardListProps) {
	const { __curdBox__, fetchLoading, onSelectRow, rowKey, checkable, selectedRows, renderItem, children } = props;
  const { data } = useContext(DataContext);
	if (__curdBox__) {
		const { handleDataChange } = __curdBox__;
		return (
			<Fragment>
				<StandardList
					loading={fetchLoading}
					setActions={(record) => __curdBox__.renderActions(record)}
					onChange={handleDataChange}
					data={data}
					onSelectRow={onSelectRow}
					rowKey={rowKey}
					checkable={checkable}
					selectedRows={selectedRows}
					renderItem={renderItem}
				/>
				{injectChildren(children, { __curdBox__ })}
			</Fragment>
		);
	}
	return null;
}

export interface CurdListProps extends CustomStandardListProps, CurdBoxProps {}

export default function CurdList(props: CurdListProps) {
	const { renderItem, ...rest } = props;
	return (
		<CurdBox {...rest}>
			<CustomStandardList {...props} />
		</CurdBox>
	);
}

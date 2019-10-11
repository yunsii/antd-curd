import React from 'react';
import { Spin, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { Curd } from '../../src';
import { data as mockData } from '../mock';
import styles from './index.less';
import renderCard from '../CustomCard';

export default class CurdListBoxDemo extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: [],
			loading: false,
			hasMore: true
		};
	}

	componentDidMount() {
		this.setState({
			data: [ ...mockData.list ]
		});
	}

	handleInfiniteOnLoad = () => {
		console.log('call handleInfiniteOnLoad');
		let { data } = this.state;
		this.setState({
			loading: true
		});
		if (data.length > 20) {
			message.warning('Infinite List loaded all');
			this.setState({
				hasMore: false,
				loading: false
			});
			return;
		}
		setTimeout(() => {
			data = data.concat(mockData.list.slice(0, 3));
			this.setState({
				data,
				loading: false
			});
		}, 200);
	};

	render() {
		const { data } = this.state;
		console.log(data);
		return (
			<div className={styles['demo-infinite-container']}>
				<InfiniteScroll
					initialLoad={false}
					pageStart={0}
					loadMore={this.handleInfiniteOnLoad}
					hasMore={!this.state.loading && this.state.hasMore}
					useWindow={false}
				>
					<Curd {...this.props} data={{ list: data }}>
						<Curd.CurdList
							renderItem={renderCard}
							pagination={false}
							popupType="modal"
							setFormItemsConfig={() => [
								{ type: 'string', field: 'test', formItemProps: { label: 'test' } }
							]}
						/>
						{this.state.loading &&
						this.state.hasMore && (
							<div className={styles['demo-loading-container']}>
								<Spin />
							</div>
						)}
					</Curd>
				</InfiniteScroll>
			</div>
		);
	}
}

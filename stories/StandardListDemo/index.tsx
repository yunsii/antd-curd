import * as React from 'react';
import {StandardList} from '../../src';
import renderCard from './CustomCard';
import { data } from '../mock';

export default class StandardListDemo extends React.Component {
  state = {
    mockData: data,
  }

  render() {
    const { mockData } = this.state;
    return (
      <StandardList
        data={mockData}
        renderItem={renderCard}
      />
    )
  }
}

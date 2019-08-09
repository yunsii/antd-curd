import React from 'react';
import { Avatar } from 'antd';
import styles from './mock.less';

export const columns = [
  {
    title: '公式照',
    dataIndex: 'avatar',
    render: (value) => <Avatar className={styles.avatar} src={value} />
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
  },
  {
    title: '生日',
    dataIndex: 'birthday',
  },
  {
    title: '特长',
    dataIndex: 'speciality',
  },
  {
    title: '爱好',
    dataIndex: 'habit',
  },
]

export const data = {
  list: [
    {
      id: 'szn',
      avatar: 'http://www.snh48.com/images/member/mp_10146.jpg',
      name: '孙珍妮',
      nickname: '珍妮',
      birthday: '05.05',
      speciality: '唱歌、吉他',
      habit: '吃东西、逛街',
    },
    {
      id: 'cmj',
      avatar: 'http://www.bej48.com/images/member/zp_20001.jpg',
      name: '陈美君',
      nickname: 'MIMI',
      birthday: '01.15',
      speciality: '钢琴、吉他',
      habit: '旅游、宅',
    },
    {
      id: 'szn1',
      avatar: 'http://www.snh48.com/images/member/mp_10146.jpg',
      name: '孙珍妮',
      nickname: '珍妮',
      birthday: '05.05',
      speciality: '唱歌、吉他',
      habit: '吃东西、逛街',
    },
    {
      id: 'cmj2',
      avatar: 'http://www.bej48.com/images/member/zp_20001.jpg',
      name: '陈美君',
      nickname: 'MIMI',
      birthday: '01.15',
      speciality: '钢琴、吉他',
      habit: '旅游、宅',
    },
    {
      id: 'szn3',
      avatar: 'http://www.snh48.com/images/member/mp_10146.jpg',
      name: '孙珍妮',
      nickname: '珍妮',
      birthday: '05.05',
      speciality: '唱歌、吉他',
      habit: '吃东西、逛街',
    },
    {
      id: 'cmj4',
      avatar: 'http://www.bej48.com/images/member/zp_20001.jpg',
      name: '陈美君',
      nickname: 'MIMI',
      birthday: '01.15',
      speciality: '钢琴、吉他',
      habit: '旅游、宅',
    },
    {
      id: 'szn5',
      avatar: 'http://www.snh48.com/images/member/mp_10146.jpg',
      name: '孙珍妮',
      nickname: '珍妮',
      birthday: '05.05',
      speciality: '唱歌、吉他',
      habit: '吃东西、逛街',
    },
    {
      id: 'cmj6',
      avatar: 'http://www.bej48.com/images/member/zp_20001.jpg',
      name: '陈美君',
      nickname: 'MIMI',
      birthday: '01.15',
      speciality: '钢琴、吉他',
      habit: '旅游、宅',
    },
    {
      id: 'szn7',
      avatar: 'http://www.snh48.com/images/member/mp_10146.jpg',
      name: '孙珍妮',
      nickname: '珍妮',
      birthday: '05.05',
      speciality: '唱歌、吉他',
      habit: '吃东西、逛街',
    },
    {
      id: 'cmj8',
      avatar: 'http://www.bej48.com/images/member/zp_20001.jpg',
      name: '陈美君',
      nickname: 'MIMI',
      birthday: '01.15',
      speciality: '钢琴、吉他',
      habit: '旅游、宅',
    },
  ],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 200,
  }
}

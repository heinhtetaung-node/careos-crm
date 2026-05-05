import { screen } from '@testing-library/react';
import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import { IItemSMS } from '../messageModal.helper';

import MessageModalSms from '.';

const smsMockData: IItemSMS = {
  id: '1',
  createBy: '',
  createTime: '',
  message: '',
  name: '',
  phone: 1,
  phoneIndex: 1,
  status: '',
  updateTime: '',
  title: '',
};

describe('<MessageModalSms Component/>', () => {
  beforeEach(() => {
    render(<MessageModalSms sms={smsMockData} />);
  });
  it('component renders correctly', () => {
    screen.getByText('text.from');
  });
});

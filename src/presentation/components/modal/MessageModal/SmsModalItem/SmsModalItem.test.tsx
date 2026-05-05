import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';

import { IItemSMS } from '../messageModal.helper';

import SmsModalItem from './index';

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
const handleClick = jest.fn();
const activeId = '1';

describe('<SmsModalItem Component/>', () => {
  it('will be mounted correctly', () => {
    render(
      <SmsModalItem
        smsItem={smsMockData}
        isActive={activeId}
        onClick={handleClick}
      />
    );
  });

  it('should trigger handler on click', async () => {
    const { container } = render(
      <SmsModalItem
        smsItem={smsMockData}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    await user.click(container.querySelector('.mail-section__item') as Element);
    expect(handleClick).toHaveBeenCalled();
  });

  it('should have active class', () => {
    const { container } = render(
      <SmsModalItem
        smsItem={smsMockData}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    expect(container.firstChild).toHaveClass('active');
  });

  it('check Alt text', () => {
    screen.findByAltText('email');
  });
});

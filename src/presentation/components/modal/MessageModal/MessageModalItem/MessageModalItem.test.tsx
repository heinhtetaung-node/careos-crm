import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { IItemEmail } from '../messageModal.helper';

import MessageModalItem from './index';

const emailMockData: IItemEmail = {
  id: '1',
  name: '',
  subject: '',
  body: '',
  cc: [''],
  bodyText: '',
  createdBy: '',
  emailIndex: 1,
  createTime: '',
  updateTime: '',
  deleteTime: '',
  type: '',
  parentId: '',
  read: true,
};
const handleClick = jest.fn();
const activeId = '1';

describe('<MessageModalItem Component/>', () => {
  it('will be mounted correctly', () => {
    render(
      <MessageModalItem
        messageItem={emailMockData}
        isActive={activeId}
        onClick={handleClick}
      />
    );
  });

  it('check is active item', async () => {
    let component = render(
      <MessageModalItem
        messageItem={{
          ...emailMockData,
          name: 'test',
          read: false,
          type: 'SYSTEM',
        }}
        isActive={activeId}
        onClick={handleClick}
      />
    );

    component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData, read: true, type: 'SYSTEM' }}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    await user.click(
      component.container.querySelector('.mail-section__item') as Element
    );
    expect(handleClick).toHaveBeenCalled();
  });

  it('check is icon item', async () => {
    let component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData, read: false, type: 'INBOUND' }}
        isActive={activeId}
        onClick={handleClick}
      />
    );

    component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData, read: true, type: 'INBOUND' }}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    await user.click(
      component.container.querySelector('.emailIcon') as Element
    );
    expect(handleClick).toHaveBeenCalled();
  });

  it('should trigger support message', async () => {
    const component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData, type: 'SUPPORT' }}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    await user.click(
      component.container.querySelector('.emailIcon') as Element
    );
    expect(handleClick).toHaveBeenCalled();
  });

  it('should trigger default error message', async () => {
    const component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData }}
        isActive={activeId}
        onClick={handleClick}
      />
    );
    await user.click(
      component.container.querySelector('.emailIcon') as Element
    );
    expect(handleClick).toHaveBeenCalled();
  });

  it('check Alt text', () => {
    <MessageModalItem
      messageItem={{ ...emailMockData, type: 'SUPPORT' }}
      isActive={activeId}
      onClick={handleClick}
    />;
    screen.findByAltText('email');
  });

  it('check storybook class', () => {
    const component = render(
      <MessageModalItem
        messageItem={{ ...emailMockData, type: 'SUPPORT' }}
        isStoryBook
        isActive={activeId}
        onClick={handleClick}
      />
    );
    const container = component.getByTestId('unit-email-container');

    expect(container).toHaveClass('mail-info__content-storybook');
  });
});

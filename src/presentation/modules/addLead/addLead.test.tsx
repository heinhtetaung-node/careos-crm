import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, within } from '__tests__/rtl-test-utils';

import AddLead from '.';

const handleCloseModal = jest.fn();
const handleCallBackAddLead = jest.fn();

describe('Add lead Component', () => {
  it('will be mounted correctly', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/sources`,
        () =>
          HttpResponse.json({
            sources: [
              {
                name: 'sources/b2f2dae4-ac39-44ee-9993-1b0f710bb97c',
                createTime: '2022-08-15T02:23:41.019600Z',
                updateTime: '2022-08-15T02:23:41.019600Z',
                deleteTime: null,
                createBy: 'users/7f984c4d-88dd-40ed-9755-8a5e15acdb73',
                updateBy: '',
                product: 'products/car-insurance',
                online: false,
                hidden: false,
                source: 'car widget',
                medium: '',
                campaign: '',
                createByFirstName: 'Arina',
                createByLastName: 'Madau',
                createByFullName: 'Arina Madau',
                updateByFirstName: '',
                updateByLastName: '',
                updateByFullName: '',
                leadCount: 13,
                score: 1,
              },
            ],
            nextPageToken: '',
          })
      )
    );

    render(
      <AddLead
        close={handleCloseModal}
        callBackAddLead={handleCallBackAddLead}
        sourceOptions={[
          {
            id: 0,
            title: 'car widget',
            value: 'sources/car-widget',
            source: 'car widget',
            name: 'sources/car-widget',
          },
        ]}
        sourceOptionsLoading={false}
      />
    );

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 2000));
    expect(screen.getByTestId('add-lead-form')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'text.closeButton' }));
    expect(handleCloseModal).toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'text.addLeadButton' })
    ).toBeDisabled();

    await user.type(
      screen
        .getByTestId('input-firstName')
        .querySelector('input[name="firstName"]') as Element,
      'FakeFirstName'
    );
    await user.type(
      screen
        .getByTestId('input-lastName')
        .querySelector('input[name="lastName"]') as Element,
      'FakeLastName'
    );
    await user.type(
      screen
        .getByTestId('input-phone')
        .querySelector('input[name="phone"]') as Element,
      '09999999999'
    );
    await user.type(
      screen
        .getByTestId('input-email')
        .querySelector('input[name="email"]') as Element,
      'testing@tester.com'
    );
    await user.type(
      screen
        .getByTestId('input-reference')
        .querySelector('input[name="reference"]') as Element,
      'testing@tester.com'
    );
    await user.click(
      screen
        .getByTestId('common-my-complete')
        .querySelector('input[name="source"]') as Element
    );
  });

  it('excludes "Change - Online" from source dropdown options', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/sources`,
        () =>
          HttpResponse.json({
            sources: [
              {
                name: 'sources/car-widget',
                source: 'car widget',
              },
              {
                name: 'sources/change-online',
                source: 'Change - Online',
              },
              {
                name: 'sources/facebook',
                source: 'Facebook',
              },
            ],
            nextPageToken: '',
          })
      )
    );

    render(
      <AddLead
        close={handleCloseModal}
        callBackAddLead={handleCallBackAddLead}
        sourceOptions={[
          {
            id: 0,
            title: 'car widget',
            value: 'sources/car-widget',
            source: 'car widget',
            name: 'sources/car-widget',
          },
          {
            id: 1,
            title: 'Facebook',
            value: 'sources/facebook',
            source: 'Facebook',
            name: 'sources/facebook',
          },
        ]}
        sourceOptionsLoading={false}
      />
    );

    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 2000));

    await user.click(
      screen
        .getByTestId('common-my-complete')
        .querySelector('input[name="source"]') as Element
    );

    const poppers = screen.getByTestId('common-my-complete__poppers');
    expect(within(poppers).getByText('car widget')).toBeInTheDocument();
    expect(within(poppers).getByText('Facebook')).toBeInTheDocument();
    expect(within(poppers).queryByText('Change - Online')).not.toBeInTheDocument();
  });
});

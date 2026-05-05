import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, act } from '__tests__/rtl-test-utils';
import leadDetail from 'mock-data/LeadDetail.mock';

import {
  AccordionListWithTable,
  RenderOrderList,
  filterMaxYearData,
  getFormattedLead,
  mappingFieldValue,
} from './helper';

export const DemoCustomerData = {
  customer: {
    name: 'customers/a1469f6a-9a4f-4b24-b04d-b433b52c4239',
    createTime: '2022-07-07T11:21:33.596407Z',
    updateTime: '2022-07-07T11:21:33.596407Z',
    deleteTime: null,
    createBy: '',
    humanId: 'C524657',
    firstName: 'ພະຍັນຊະນະປະສົມ',
    lastName: 'ພະຍັນຊະນະປະສົມ',
    gender: 'M',
    dateOfBirth: '14/07/2022',
    companyNames: [],
  },
};

const FormatedResponse = {
  customer: {
    humanId: {
      editType: 'input',
      id: 'C524657',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'humanId',
      title: 'humanId',
      value: undefined,
    },
    title: {
      editType: 'input',
      id: 'ID1231',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'policyTitle',
      title: 'title',
      value: undefined,
    },
    DOB: {
      editType: 'date picker',
      id: 'ID1231',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'dateOfBirth',
      title: 'dob',
      value: '14/07/2022',
    },
    firstName: {
      editType: 'input',
      id: 'ID1231',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'firstName',
      title: 'firstName',
      value: 'ພະຍັນຊະນະປະສົມ',
    },
    gender: {
      editType: 'select',
      id: 'ID1231',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'gender',
      options: [
        { name: 'm', title: 'text.male' },
        { name: 'f', title: 'text.female' },
      ],
      title: 'gender',
      value: 'm',
    },
    lastName: {
      editType: 'input',
      id: 'ID1231',
      isEditable: false,
      isError: false,
      isRequired: false,
      name: 'lastName',
      title: 'lastName',
      value: 'ພະຍັນຊະນະປະສົມ',
    },
  },
};

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn().mockReturnValue('ID1231'),
}));

// TODO: Refactor
describe.skip('Testing CustomerSection helpers', () => {
  it('should mapped the data into given format', () => {
    expect(mappingFieldValue(DemoCustomerData)).toEqual(FormatedResponse);
  });
  const mockHandleExpand = jest.fn();
  const mockHandleGetSelectedData = jest.fn();

  it('should render expanded Accordion with provided details', () => {
    render(
      <AccordionListWithTable
        id="some-id"
        expanded="some-id"
        name="some name"
        data={{ id: 'some-id' }}
        classes={{}}
        FILTERED_DETAILS={['id']}
        handleExpand={mockHandleExpand}
        handleGetSelectedData={mockHandleGetSelectedData}
        isLoading={false}
      />
    );
    const accordion = screen.getByTestId('test-accordion');
    expect(accordion).toBeInTheDocument();

    act(() => {
      expect(accordion.firstElementChild).toBeInTheDocument();
      if (accordion.firstElementChild) {
        userEvent.click(accordion.firstElementChild);
      }
    });

    expect(mockHandleExpand).toHaveBeenCalledWith(false);
  });
  it('should get Formated Lead Data usnig getFormattedLead function', () => {
    expect(
      getFormattedLead(leadDetail as any, { model: 'modelA', brand: 'brandA' })
    ).toEqual({
      '00000000-0000-0000-0000-000000000000': {
        deleteTime: '',
        id: 'L9854558',
        name: 'Maleena Nateerin',
        status: 'leadStatus.new',
        type: 'leadTypeFilter.new',
        model: 'modelA',
        brand: 'brandA',
        updateTime: '21/04/2022',
        user: '',
      },
    });
  });
  const DemoCustomerLead = [
    {
      name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/leads/c29c449e-ccea-418f-ae71-00033ff41568',
      createTime: leadDetail.createTime,
      updateTime: leadDetail.updateTime,
      deleteTime: leadDetail.deleteTime,
      humanId: leadDetail.humanId,
      createBy: leadDetail.createBy,
    },
  ];
  it('should return the data which is not 2 years older', () => {
    expect(filterMaxYearData(DemoCustomerLead)).toEqual([
      { name: 'c29c449e-ccea-418f-ae71-00033ff41568' },
    ]);
  });
  const DemoCustomerData2 = [
    {
      name: 'customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/leads/c29c449e-ccea-418f-ae71-00033ff41568',
      createTime: '2017-04-21T02:37:24.541678Z',
      updateTime: leadDetail.updateTime,
      deleteTime: leadDetail.deleteTime,
      humanId: leadDetail.humanId,
      createBy: leadDetail.createBy,
    },
  ];
  it('should not return the data, which is 2 years older', () => {
    expect(filterMaxYearData(DemoCustomerData2)).toEqual([]);
  });
});

it('should render RenderOrderList', () => {
  const handleExpand = jest.fn();
  render(
    <RenderOrderList
      id="orderId"
      data={{
        carPlate: 'test',
        orderId: 'test',
        paymentStatus: 'Yes',
        totalInvoice: 12345,
      }}
      name="test"
      classes={{}}
      expanded="test"
      handleExpand={handleExpand}
    />
  );
  expect(screen.getByTestId('test-accordion')).toBeInTheDocument();
});

export default FormatedResponse;

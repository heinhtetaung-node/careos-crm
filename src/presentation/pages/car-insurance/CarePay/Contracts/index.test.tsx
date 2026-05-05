import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import ContractListingPage from '.';

var mockedShowSnackBar: jest.Mock;
var mockDownload: jest.Mock;
var mockUseGetUserSelector: jest.Mock;

jest.mock('presentation/redux/selectors/user', () => {
  mockUseGetUserSelector = jest.fn(() => ({ role: 'roles/admin' }));
  return {
    ...jest.requireActual('presentation/redux/selectors/user'),
    useGetUserSelector: mockUseGetUserSelector,
  };
});

jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

jest.mock('shared/helper/downloadDocumentHelper', () => {
  mockDownload = jest.fn(() => ({ type: '' }));
  return mockDownload;
});

const mockContractResponse = {
  imports: [
    {
      isNotSelectable: false,
      configId: 'contracts/7201384a-2fec-4072-9982-2595f63f710e',
      name: 'contracts/7201384a-2fec-4072-9982-2595f63f710e',
      customerName: 'Cypress Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'danielb@rabbit.co.th',
      leadId: 'L9884974',
      orderId: '',
      nationId: '2342344332434',
      contractStatus: 'SIGNED',
      documentIdCard: 'documents/244bcda2-8cc0-44c3-a380-315b95de0d87',
      documentSignature: 'documents/c8ef2577-ccf5-4f91-a603-cb2d1dd2fdd4',
      QCStatus: '',
      createTime: '07/03/2024 (03:06:11 PM)',
      installments: 8,
      installmentAmount: '22,444.73',
      firstInstallment: '3,370.15',
      firstInstallmentDate: '07/03/2024',
      insurer: 'กรุงเทพประกันภัย',
      policyStartDate: '08/10/2022',
      policyEndDate: '08/10/2023',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: '%{[@metadata][lead][data][carLicensePlate]}',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/0a4d1b81-1976-46e0-9fde-0f611c815dc6',
      name: 'contracts/0a4d1b81-1976-46e0-9fde-0f611c815dc6',
      customerName: 'Inndraphatth Borikunnititornn',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'citrap@rabbit.co.th',
      leadId: 'L9900241',
      orderId: '',
      nationId: '7063120141141',
      contractStatus: 'CREATED',
      documentIdCard: '',
      documentSignature: '',
      QCStatus: '',
      createTime: '07/03/2024 (03:06:01 PM)',
      installments: 8,
      installmentAmount: '26,721.14',
      firstInstallment: '3,904.71',
      firstInstallmentDate: '07/03/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '03/04/2023',
      policyEndDate: '03/04/2024',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: '123-123 กท',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/2db45f74-8153-44e3-8456-49ac20dbd8e2',
      name: 'contracts/2db45f74-8153-44e3-8456-49ac20dbd8e2',
      customerName: 'Pattaraporn Chompalung',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'mattanapornp@rabbit.co.th',
      leadId: 'L9890701',
      orderId: '',
      nationId: '1233457890345',
      contractStatus: 'CREATED',
      documentIdCard: '',
      documentSignature: '',
      QCStatus: '',
      createTime: '07/03/2024 (03:05:44 PM)',
      installments: 8,
      installmentAmount: '26,721.14',
      firstInstallment: '3,904.71',
      firstInstallmentDate: '07/03/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '07/03/2024',
      policyEndDate: '07/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: '',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/f0a3c45d-c164-4800-96b5-42b848d5fd47',
      name: 'contracts/f0a3c45d-c164-4800-96b5-42b848d5fd47',
      customerName: 'Cypress Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'danielb@rabbit.co.th',
      leadId: 'L9884974',
      orderId: '',
      nationId: '221312312312312331',
      contractStatus: 'CREATED',
      documentIdCard: '',
      documentSignature: '',
      QCStatus: '',
      createTime: '07/03/2024 (03:05:42 PM)',
      installments: 8,
      installmentAmount: '22,444.73',
      firstInstallment: '3,370.15',
      firstInstallmentDate: '07/03/2024',
      insurer: 'กรุงเทพประกันภัย',
      policyStartDate: '08/10/2022',
      policyEndDate: '08/10/2023',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: '%{[@metadata][lead][data][carLicensePlate]}',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/ff7189c9-fa19-44c6-b9ed-bc1dd88b8abb',
      name: 'contracts/ff7189c9-fa19-44c6-b9ed-bc1dd88b8abb',
      customerName: 'Test Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910583',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/1f63c8d6-9128-4642-9137-8a9b84977117',
      documentSignature: 'documents/6b17dd0c-6d61-4bd7-8162-2c999a09ed26',
      QCStatus: '',
      createTime: '06/03/2024 (01:34:08 PM)',
      installments: 3,
      installmentAmount: '24,567.69',
      firstInstallment: '8,222.57',
      firstInstallmentDate: '06/03/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '31/03/2024',
      policyEndDate: '31/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/8582e4bb-1ce3-4fcc-9445-3c9078c67e98',
      name: 'contracts/8582e4bb-1ce3-4fcc-9445-3c9078c67e98',
      customerName: 'Test lead',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'test@gmail.com',
      leadId: 'L9910542',
      orderId: '',
      nationId: '1234567000000',
      contractStatus: 'CREATED',
      documentIdCard: '',
      documentSignature: '',
      QCStatus: '',
      createTime: '01/03/2024 (02:40:13 PM)',
      installments: 8,
      installmentAmount: '18,426.82',
      firstInstallment: '2,911.67',
      firstInstallmentDate: '01/03/2024',
      insurer: 'คุ้มภัยโตเกียวมารีนประกันภัย',
      policyStartDate: '26/03/2024',
      policyEndDate: '26/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/f3149976-c530-4639-bf97-dfa81d672fd9',
      name: 'contracts/f3149976-c530-4639-bf97-dfa81d672fd9',
      customerName: 'Test lead',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'test@gmail.com',
      leadId: 'L9910542',
      orderId: '',
      nationId: '1234567000000',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/39601eae-fbeb-4b15-baf1-dcdee3f28cf5',
      documentSignature: 'documents/36b43867-4d75-4fe9-916b-9da99cfe7438',
      QCStatus: '',
      createTime: '01/03/2024 (02:38:07 PM)',
      installments: 8,
      installmentAmount: '18,426.82',
      firstInstallment: '2,911.67',
      firstInstallmentDate: '01/03/2024',
      insurer: 'คุ้มภัยโตเกียวมารีนประกันภัย',
      policyStartDate: '26/03/2024',
      policyEndDate: '26/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/073e45f9-db53-4563-ab0d-035f165a03a0',
      name: 'contracts/073e45f9-db53-4563-ab0d-035f165a03a0',
      customerName: 'Viriyah Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66830283544,+66999999999',
      email: 'citrap@rabbit.co.th',
      leadId: 'L9910535',
      orderId: '',
      nationId: '2251861275646',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/6933061c-7029-48ef-b571-37fb3572eb8b',
      documentSignature: 'documents/5400217d-2cf8-45bb-841f-d0984ee565b0',
      QCStatus: '',
      createTime: '01/03/2024 (01:22:25 PM)',
      installments: 8,
      installmentAmount: '17,731.61',
      firstInstallment: '2,216.46',
      firstInstallmentDate: '01/03/2024',
      insurer: 'คุ้มภัยโตเกียวมารีนประกันภัย',
      policyStartDate: '05/03/2024',
      policyEndDate: '05/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: '667-7087 กท',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/3e3fdc74-7bec-4945-876d-a821857cdc84',
      name: 'contracts/3e3fdc74-7bec-4945-876d-a821857cdc84',
      customerName: 'MiwTest RCL',
      policyHolderFullName: 'Cypress Test',
      phone: '+66830283544',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910432',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/fbe9ff43-dbac-41da-af70-edc322fcc77b',
      documentSignature: 'documents/a5c2d3f5-5902-4996-a98e-4a97a25f4d96',
      QCStatus: '',
      createTime: '28/02/2024 (06:56:10 PM)',
      installments: 10,
      installmentAmount: '21,965.46',
      firstInstallment: '5,491.50',
      firstInstallmentDate: '28/02/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '29/02/2024',
      policyEndDate: '01/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/95b2d550-c068-4c1c-8c26-783929d65f9e',
      name: 'contracts/95b2d550-c068-4c1c-8c26-783929d65f9e',
      customerName: 'Test ja',
      policyHolderFullName: 'Cypress Test',
      phone: '+66863734617',
      email: 'test@gmail.com',
      leadId: 'L9910468',
      orderId: '',
      nationId: '1234567000000',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/1a8ccc04-a63b-4e55-9073-5fb600eb8f9b',
      documentSignature: 'documents/086d6a8c-f4ef-4f14-95c1-e3f22b044b28',
      QCStatus: '',
      createTime: '28/02/2024 (03:23:51 PM)',
      installments: 8,
      installmentAmount: '26,771.14',
      firstInstallment: '3,954.71',
      firstInstallmentDate: '28/02/2024',
      insurer: 'กรุงเทพประกันภัย',
      policyStartDate: '26/03/2024',
      policyEndDate: '26/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/af94ef69-bc54-40a8-ad3c-887b00d221a2',
      name: 'contracts/af94ef69-bc54-40a8-ad3c-887b00d221a2',
      customerName: 'Both Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999,+66830283544',
      email: 'test@gmail.com',
      leadId: 'L9910466',
      orderId: '',
      nationId: '1234567000000',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/70fe4e39-e4ba-4758-8dd6-f08c0d98af84',
      documentSignature: 'documents/85cdb096-93fb-4464-8d49-a0c5a9ebd3c0',
      QCStatus: '',
      createTime: '28/02/2024 (03:01:41 PM)',
      installments: 8,
      installmentAmount: '26,771.14',
      firstInstallment: '3,954.71',
      firstInstallmentDate: '28/02/2024',
      insurer: 'กรุงเทพประกันภัย',
      policyStartDate: '26/03/2024',
      policyEndDate: '25/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/a4c78ca6-7b6a-479b-9d4b-04bb44e868e3',
      name: 'contracts/a4c78ca6-7b6a-479b-9d4b-04bb44e868e3',
      customerName: 'MiwTest RCL',
      policyHolderFullName: 'Cypress Test',
      phone: '+66830283544',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910432',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'APPROVED',
      documentIdCard: 'documents/54e67fd8-b071-4cf4-8087-830a76a1982e',
      documentSignature: 'documents/1e1b816b-1ab0-45b5-8050-d24795236562',
      QCStatus: '',
      createTime: '28/02/2024 (11:30:27 AM)',
      installments: 10,
      installmentAmount: '21,965.46',
      firstInstallment: '5,491.50',
      firstInstallmentDate: '28/02/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '29/02/2024',
      policyEndDate: '01/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: false,
      configId: 'contracts/23e8b651-c012-4cb7-a367-0d272e32cf4a',
      name: 'contracts/23e8b651-c012-4cb7-a367-0d272e32cf4a',
      customerName: 'Miw TestContract',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910407',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'PENDING',
      documentIdCard: 'documents/12dd92b3-207b-47d4-a7b0-8b4a29fbde57',
      documentSignature: 'documents/71f80278-530a-421b-af27-953cc2161de3',
      QCStatus: '',
      createTime: '27/02/2024 (09:30:34 PM)',
      installments: 3,
      installmentAmount: '20,104.51',
      firstInstallment: '6,701.51',
      firstInstallmentDate: '27/02/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '29/02/2024',
      policyEndDate: '01/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/e7f62140-afa6-431c-9f5e-97d7dff12a3a',
      name: 'contracts/e7f62140-afa6-431c-9f5e-97d7dff12a3a',
      customerName: 'Miw TestContract',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910407',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'CREATED',
      documentIdCard: '',
      documentSignature: '',
      QCStatus: '',
      createTime: '27/02/2024 (08:55:57 PM)',
      installments: 3,
      installmentAmount: '20,104.51',
      firstInstallment: '6,701.51',
      firstInstallmentDate: '27/02/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '29/02/2024',
      policyEndDate: '01/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
    {
      isNotSelectable: true,
      configId: 'contracts/834d42f2-f08e-40ff-b7d8-9c6f9225868b',
      name: 'contracts/834d42f2-f08e-40ff-b7d8-9c6f9225868b',
      customerName: 'Miw Test',
      policyHolderFullName: 'Cypress Test',
      phone: '+66999999999',
      email: 'natthapatp@rabbit.co.th',
      leadId: 'L9910409',
      orderId: '',
      nationId: '1234567890123',
      contractStatus: 'REJECTED',
      documentIdCard: 'documents/7953ce9c-6092-40bb-a1a9-33953acc8631',
      documentSignature: 'documents/7a37cec5-cecc-4e7e-be56-a3a332301106',
      QCStatus: '',
      createTime: '27/02/2024 (08:36:46 PM)',
      installments: 3,
      installmentAmount: '20,104.51',
      firstInstallment: '6,701.51',
      firstInstallmentDate: '27/02/2024',
      insurer: 'วิริยะประกันภัย',
      policyStartDate: '29/02/2024',
      policyEndDate: '01/03/2025',
      cancelStatus: '',
      salesTeam: '',
      assignedQC: 'No Assignee',
      assignedQcId: 'users/00000000-0000-0000-0000-000000000000',
      licensePlate: 'redplate',
      insuranceType: 'TYPE_1',
    },
  ],
  total: '52',
};

jest.mock('data/slices/leadSearchSlice', () => ({
  useLazyGenericSearchQuery: () => [
    jest.fn(),
    {
      data: mockContractResponse,
    },
  ],
}));

describe('Testing ContractListingPage Page', () => {
  beforeEach(() => {
    mockedShowSnackBar.mockClear();
    mockDownload.mockClear();
  });

  it('should render listing view and open detail popup', async () => {
    render(<ContractListingPage />);
    expect(screen.getByTestId('contract-listing-page')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('1234567890123')[0]).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getAllByTestId('contractInformation-iconBtn')[0]
    );

    await waitFor(() =>
      expect(screen.getByTestId('contract-information')).toBeVisible()
    );
  });

  it.skip('should render and search the component correctly', async () => {
    render(<ContractListingPage />);
    expect(screen.getByTestId('contract-listing-page')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('1593574854115')[0]).toBeInTheDocument();
    });

    expect(screen.getByTestId('muiSelect-selectValue')).toBeInTheDocument();

    const search = screen.getByPlaceholderText('text.search');
    await userEvent.type(search, 'L9908139');

    const searchButton = screen.getByTestId('submit-btn');

    expect(searchButton).toBeEnabled();
    await userEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getAllByText('L9908139')[0]).toBeInTheDocument();
    });

    await userEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getAllByText('L9908139')[0]).toBeInTheDocument();
    });
  });

  // FIXME
  it.skip('should be able to click preview / download / approve / reject - success', async () => {
    server.use(
      http.put(`${process.env.VITE_API_ENDPOINT}/v1alpha1/contracts/:id`, (_) =>
        HttpResponse.json({ success: true })
      )
    );
    render(<ContractListingPage />);

    await userEvent.click(screen.getAllByTestId('openDetails-iconBtn')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('contract-approval')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('approve-btn'));
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'carepay.contract.contractUpdateSuccess',
        status: 'success',
      });
    });
  });

  it.skip('should be able to un assign QA', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/contracts`,
        (_) => HttpResponse.json(mockContractResponse)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/assign/v1alpha1/contracts/:contractId/assignments`,
        (_) =>
          HttpResponse.json({
            assignments: [
              {
                user: 'users/12345',
                name: 'contracts/12345/assignments/12345',
              },
            ],
          })
      ),
      http.delete(
        `${process.env.VITE_API_ENDPOINT}/api/assign/v1alpha1/contracts/:contractId/assignments/:assignmentId`,
        (_) => HttpResponse.json({}, { status: 200 })
      )
    );
    render(<ContractListingPage />);
    const unassignBtn = screen.getByTestId('unassign-button');

    await waitFor(async () => {
      const checkbox = screen.getAllByTestId('checkbox-')[0];
      expect(checkbox).toBeEnabled();
      await userEvent.click(checkbox);
      expect(unassignBtn).toBeEnabled();
      await userEvent.click(unassignBtn);
    });

    const assignModal = screen.getByTestId('assign-modal');
    expect(assignModal).toBeVisible();

    // able to close to
    await userEvent.click(screen.getByTestId('assign-close-button'));
    await waitFor(() => {
      expect(assignModal).not.toBeVisible();
    });
    await userEvent.click(unassignBtn);

    const confirm = screen.getByTestId('assign-confirm-button');
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'leadAssignment.bulkUpdateSuccess',
        status: 'success',
      });
    });
  });

  it.skip('should be able to un assign QA - error case', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/contracts`,
        (_) => HttpResponse.json(mockContractResponse)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/assign/v1alpha1/contracts/:contractId/assignments`,
        (_) =>
          HttpResponse.json({
            assignments: [],
          })
      )
    );
    render(<ContractListingPage />);
    const unassignBtn = screen.getByTestId('unassign-button');

    await waitFor(async () => {
      const checkbox = screen.getAllByTestId('checkbox-')[0];
      expect(checkbox).toBeEnabled();
      await userEvent.click(checkbox);
      await userEvent.click(unassignBtn);
    });

    const assignModal = screen.getByTestId('assign-modal');
    expect(assignModal).toBeVisible();

    const confirm = screen.getByTestId('assign-confirm-button');
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'leadAssignment.failToUnassign',
        status: 'error',
      });
    });
  });

  it.skip('should be able to assign QA', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/assign/v1alpha1/contracts/:contractId/assignments`,
        (_) => HttpResponse.json({}, { status: 200 })
      )
    );
    render(<ContractListingPage />);
    await waitFor(async () => {
      const checkbox = screen.getAllByTestId('checkbox-')[2];
      expect(checkbox).toBeEnabled();
      await userEvent.click(checkbox);
    });

    await waitFor(async () => {
      const assignBtn = screen.getByText('text.assign');
      expect(assignBtn).toBeEnabled();
      await userEvent.click(assignBtn);
    });

    await waitFor(async () => {
      const assignModal = screen.getByTestId('assign-modal');
      expect(assignModal).toBeVisible();
      const confirm = within(assignModal).getByText('text.confirmButton');
      await userEvent.click(confirm);
    });

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'leadAssignment.bulkUpdateSuccess',
        status: 'success',
      });
    });
  });
  it.skip('should not visible Assign dropdown if user is QA', async () => {
    render(<ContractListingPage />, {
      initialState: {
        authReducer: { data: { user: { role: 'roles/quality-control' } } },
      },
    });
    expect(screen.queryByTestId('assign-dropdown')).toBeNull();
  });
  it.skip('should not visible Assign dropdown if user is not QA', async () => {
    render(<ContractListingPage />, {
      initialState: {
        authReducer: { data: { user: { role: 'roles/admin' } } },
      },
    });

    expect(screen.getByTestId('assign-dropdown')).toBeInTheDocument();
  });
});

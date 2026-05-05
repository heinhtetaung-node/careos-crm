import MockPolicyListingTable from '@alphafounders/mock-data/json/policyListingTable.json';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import ShippingFilterActionPanel from 'presentation/pages/car-insurance/orders/PrintingAndShipping/ShippingFilterActionPanel';

import PolicyTable from '../PolicyTable';

describe('Test <PolicyTable/>', () => {
  it('Test <PolicyTable/> render successfully', () => {
    render(<PolicyTable policies={MockPolicyListingTable.policies as any} />);

    expect(screen.getAllByText('Bangkok Insurance')[0]).toBeInTheDocument();
  });

  it('Should render policytable with checkbox', async () => {
    render(
      <PolicyTable
        policies={MockPolicyListingTable.policies as any}
        policyTableType="shipment"
      />
    );
    const checkbox = await screen.findAllByTestId('shipment-policy-L2387453-1');
    expect(checkbox).not.toBeNull();
    expect(checkbox[0]).toBeInTheDocument();
  });

  it('Should render policytable checked checkboxes', async () => {
    render(
      <PolicyTable
        policies={MockPolicyListingTable.policies as any}
        policyTableType="shipment"
        orderPolicies={[
          {
            orderId: 'orders/47827241-9143-4b36-b38f-15f0e46ee65e',
            items: [],
            insurers: [],
            approvalStatuses: [''],
            noOfPolicies: 1,
          },
        ]}
      />
    );
    const checkbox = await screen.getAllByRole('checkbox')[0];
    userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('Should policytable same order multiple policies checked', async () => {
    render(
      <PolicyTable
        policies={MockPolicyListingTable.policies as any}
        policyTableType="shipment"
        orderPolicies={[
          {
            orderId: 'orders/47827241-9143-4b36-b38f-15f0e46ee65e',
            items: [
              'orders/47827241-9143-4b36-b38f-15f0e46ee65e/items/a9fc0b06-de23-46e7-b724-4e11e9309de5',
            ],
            insurers: ['Bangkok Insurance'],
            approvalStatuses: [''],
            noOfPolicies: 2,
          },
        ]}
      />
    );
    const checkbox = screen.getAllByRole('checkbox')[1];
    userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('Should policytable different order policy checked', async () => {
    render(
      <PolicyTable
        policies={MockPolicyListingTable.policies as any}
        policyTableType="shipment"
        orderPolicies={[
          {
            orderId: 'orders/47827241-9143-4b36-b38f-15f0e46ee325',
            items: [
              'orders/47827241-9143-4b36-b38f-15f0e46ee325/items/a9fc0b06-de23-46e7-b724-4e11e9309996',
            ],
            insurers: ['Bangkok Insurance'],
            approvalStatuses: [''],
            noOfPolicies: 5,
          },
        ]}
      />
    );
    const checkbox = screen.getAllByRole('checkbox')[2];
    userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
});

describe('Test generate tracking button', () => {
  const orderPoliciesMock = [
    {
      orderId: 'orders/47827241-9143-4b36-b38f-15f0e46ee65e',
      items: [
        'orders/47827241-9143-4b36-b38f-15f0e46ee65e/items/a9fc0b06-de23-46e7-b724-4e11e9309de5',
      ],
    },
  ];

  it('Should render generate tracking button enable', async () => {
    render(
      <>
        <ShippingFilterActionPanel />
        <PolicyTable
          policies={MockPolicyListingTable.policies as any}
          policyTableType="shipment"
          orderPolicies={orderPoliciesMock as any}
        />
      </>
    );

    const checkbox = await screen.findAllByTestId('shipment-policy-L2387453-1');
    userEvent.click(checkbox[0]);

    const trackingBtn = screen.getByTestId('generate-tracking-button');
    expect(trackingBtn).not.toHaveAttribute('disabled=""');
  });
});

describe('Test <PolicyTable/> render assignedTo column correctly', () => {
  it('<PolicyTable/> render "-" for empty assignee and render correct assignee name when there is one.', () => {
    render(
      <PolicyTable
        policyTableType="submission"
        policies={MockPolicyListingTable.policies as any}
      />
    );
    const assignees = screen.getAllByTestId('assigned-to');
    expect(assignees[0].textContent).toBe('-');
    expect(assignees[1].textContent).toBe('Thet Naing');
  });
});

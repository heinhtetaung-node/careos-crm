import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { getMockOrder } from 'shared/helper/OrderMockData';

import VehicleHelper from './helper';

import Vehicle from '.';

const initialState = {
  order: {
    payload: getMockOrder(),
  },
};

describe('Vehicle info panel component', () => {
  it('Render Vehicle editable content', () => {
    render(<Vehicle isEditable />, { initialState });
    const textboxes = screen.getAllByRole('textbox');
    expect(screen.getByText('text.vehicle')).toBeTruthy();
    expect(textboxes).toBeTruthy();
  });

  it('Render Vehicle readonly content', () => {
    render(<Vehicle />, { initialState });
    expect(() => screen.getByRole('textbox')).toThrow();
  });

  it('Vehicle handle update', async () => {
    render(<Vehicle isEditable />, { initialState });
    const input = screen.getByTestId('vehicle-car-license-plate-first-input');
    userEvent.clear(input);
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});

describe('Vehicle info panel helper', () => {
  it('formatUpdatePayload helper function should format payload', () => {
    const values = {
      province: 'test',
      redPlate: true,
      carLicensePlate: '1-292',
      drivingPurpose: 'Commercial',
    };

    const order = {
      name: 'test-order',
      data: {
        oicCode: 'asv',
      },
    };

    const payload = VehicleHelper.formatUpdatePayload(values, order);
    expect(payload).toEqual(
      expect.objectContaining({
        name: 'test-order',
        data: {
          oicCode: 'asv',
          numberOfSeats: 0,
          firstDriverDOB: undefined,
          secondDriverDOB: undefined,
          carModified: false,
          carDashCam: false,
          carUsageType: 'commercial',
          carLicensePlate: '1-292',
        },
      })
    );
  });

  it('formatUpdatePayload helper function should format payload', () => {
    const values = {
      province: 'test',
      redPlate: true,
      carLicensePlate: '1-292',
      drivingPurpose: 'Personal',
      firstDriverDOB: '02/12/1990', // MM/dd/yyyy
      secondDriverDOB: '01/10/1991', // MM/dd/yyyy
    };

    const order = {
      name: 'test-order',
      data: {
        firstDriverName: 'test',
      },
    };

    const payload = VehicleHelper.formatUpdatePayload(values, order);
    expect(payload).toEqual(
      expect.objectContaining({
        name: 'test-order',
        data: {
          oicCode: '',
          numberOfSeats: 0,
          firstDriverName: 'test',
          firstDriverDOB: '1990-02-12',
          secondDriverDOB: '1991-01-10',
          carModified: false,
          carDashCam: false,
          carUsageType: 'personal',
          carLicensePlate: '1-292',
        },
      })
    );
  });
});

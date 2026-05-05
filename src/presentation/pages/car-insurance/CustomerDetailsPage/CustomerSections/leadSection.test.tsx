import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import LeadDetail from 'mock-data/LeadDetail.mock';

import LeadSection from './leadSection';

const DemoCarDetail = {
  name: 'brands/54/models/613/submodels/12384/years/48261',
  year: 2021,
  sumInsuredMin: 0,
  sumInsuredMax: 0,
  fuelType: '',
  month: 0,
  redbookId: '',
  migratedAsCurated: true,
  price: '0',
  displayName: '1800 CC (4 Doors) Hybrid Mid ',
  engineSize: 0,
  isEnabled: true,
};

describe('Testing leadSection Component', () => {
  it('should render no leads text', () => {
    render(<LeadSection leads={[]} classes={{}} />);
    expect(screen.getByTestId('no-leads')).toBeInTheDocument();
  });
  it('should render leads', async () => {
    const LeadDetails = {
      ...LeadDetail,
      name: 'leads/b184936e-2890-4cad-bc44-f67d3f06f4c8',
      data: {
        ...LeadDetail,
        carSubModelYear: 48261,
        registeredProvince: 10000,
      },
    };

    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/b184936e-2890-4cad-bc44-f67d3f06f4c8`,
        () =>
          HttpResponse.json({
            ...LeadDetails,
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/54/models/613/submodels/12384`,
        () =>
          HttpResponse.json({
            name: 'brands/54/models/613/submodels/12384',
            displayName: 'Hybrid Mid',
            engineSize: 1800,
            engineDescription: 0,
            transmissionType: '',
            cabType: '',
            doors: 4,
            description: '',
            carBadge: '',
            secondaryBadgeDescription: '',
            type: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/54/models/613`,
        () =>
          HttpResponse.json({
            name: 'brands/54/models/613',
            displayName: 'Corolla Altis',
            order: 1,
            isCurated: true,
            isVan: false,
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/54`,
        () =>
          HttpResponse.json({
            name: 'brands/54',
            displayName: 'Toyota',
            order: 1,
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/48261`,
        () => HttpResponse.json(DemoCarDetail)
      )
    );

    render(
      <LeadSection
        leads={[
          { ...LeadDetails, name: 'b184936e-2890-4cad-bc44-f67d3f06f4c8' },
        ]}
        classes={{}}
      />
    );
    const accordion = screen.getByTestId('test-accordion');
    expect(accordion).toBeInTheDocument();

    expect(accordion.firstElementChild).toBeInTheDocument();
    if (accordion.firstElementChild) {
      await userEvent.click(accordion.firstElementChild);
    }

    const loader = screen.getByRole('progressbar');

    await waitFor(() => {
      expect(loader).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('id')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InfoLeadCar from '../common/InfoLeadCar';

const mockedInforLeadCarData = {
  title: 'packageListing.showingPackageDetailsFor',
  orderId: 'L9856518',
  carDetails: {
    name: 'brands/54/models/613/submodels/12375/years/47100',
    year: 2020,
    submodelName: 'G',
    engineSize: 1600,
    engineDescription: 0,
    transmissionType: '',
    cabType: '',
    doors: 4,
    sumInsuredMin: 0,
    sumInsuredMax: 0,
    fuelType: '',
    month: 1,
    migratedAsCurated: true,
    price: '0',
    displayName: '1600 CC (4 Doors) G ',
    isEnabled: true,
    isCurated: true,
    isVan: false,
    carBadge: '',
    secondaryBadgeDescription: '',
    type: 'Test',
    brand: 'Toyota',
    model: 'Corolla Altis',
    description: '',
  },
  carDisplayName: 'test',
  infoLeadCarEnabled: true,
};

describe('Test InfoLeadCar', () => {
  test('should render if we passed curated car', () => {
    render(<InfoLeadCar {...mockedInforLeadCarData} />);
    expect(screen.getByText(mockedInforLeadCarData.title)).toBeInTheDocument();
    expect(
      screen.getByText(mockedInforLeadCarData.orderId)
    ).toBeInTheDocument();
    expect(screen.getByText('2020 Toyota Corolla Altis')).toBeInTheDocument();
  });

  test('should render if we passed non curated car', () => {
    const mockCuratedLeadCar = {
      ...mockedInforLeadCarData,
      carDetails: {
        ...mockedInforLeadCarData.carDetails,
        isCurated: false,
      },
    };
    render(<InfoLeadCar {...mockCuratedLeadCar} />);
    expect(screen.getByText(mockedInforLeadCarData.title)).toBeInTheDocument();
    expect(
      screen.getByText(mockedInforLeadCarData.orderId)
    ).toBeInTheDocument();
    expect(screen.getByText('1600 CC (4 Doors) Test')).toBeInTheDocument();
  });
});

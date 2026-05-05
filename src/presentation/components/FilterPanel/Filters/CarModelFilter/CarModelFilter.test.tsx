import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import CarModelFilter from '.';

const brandHandler = jest.fn();
const modelHandler = jest.fn();

describe('<CarModelFilter />', () => {
  beforeEach(() => {
    brandHandler.mockClear();
    modelHandler.mockClear();
    server.use(
      http.get(getApiEndpoint('/api/car/v1alpha1/brands'), () =>
        HttpResponse.json(brandHandler())
      ),
      http.get(getApiEndpoint('/api/car/v1alpha1/brands/:brandId/models'), () =>
        HttpResponse.json(modelHandler())
      )
    );
  });

  it('should call brand api on focus', async () => {
    const onChange = jest.fn();
    render(
      <CarModelFilter
        onChange={onChange}
        dependentValues={{ 'car.brand': undefined, 'car.model': undefined }}
      />
    );
    await userEvent.click(
      within(screen.getByTestId('carBrand-input')).getByRole('textbox')
    );
    await waitFor(() => expect(brandHandler).toHaveBeenCalled());
  });

  it('should call model api on focus', async () => {
    brandHandler.mockReturnValue({
      brands: [
        {
          displayName: 'BYD',
          name: 'brands/64',
          order: 0,
        },
      ],
      nextPageToken: '',
    });
    const onChange = jest.fn();
    render(
      <CarModelFilter
        onChange={onChange}
        dependentValues={{ 'car.brand': undefined, 'car.model': undefined }}
      />
    );
    const brandComponent = within(screen.getByTestId('carBrand-input'));
    const input = brandComponent.getByRole('textbox');
    await userEvent.click(input);
    await waitFor(() => {
      within(screen.getByTestId('common-my-complete__poppers')).getByText(
        'BYD'
      );
    });
    await userEvent.click(
      within(screen.getByTestId('common-my-complete__poppers')).getByText('BYD')
    );
    const modelComponent = within(screen.getByTestId('carModel-input'));
    await userEvent.click(modelComponent.getByRole('textbox'));
    await waitFor(() => expect(modelHandler).toHaveBeenCalled());
  });

  it('should set car info to the form', async () => {
    brandHandler.mockReturnValue({
      brands: [
        {
          displayName: 'BYD',
          name: 'brands/64',
          order: 0,
        },
      ],
      nextPageToken: '',
    });
    modelHandler.mockReturnValue({
      models: {
        displayName: 'Atto 3',
        isCurated: true,
        isVan: false,
        name: 'brands/64/models/1401',
        order: 0,
      },
    });
    const onChange = jest.fn();
    render(
      <CarModelFilter
        onChange={onChange}
        dependentValues={{ 'car.brand': undefined, 'car.model': undefined }}
      />
    );
    const brandComponent = within(screen.getByTestId('carBrand-input'));
    await userEvent.click(brandComponent.getByRole('textbox'));
    await waitFor(() => {
      within(screen.getByTestId('common-my-complete__poppers')).getByText(
        'BYD'
      );
    });
    await userEvent.click(
      within(screen.getByTestId('common-my-complete__poppers')).getByText('BYD')
    );
    expect(onChange).toHaveBeenCalledWith('car.brand', 'BYD');
    expect(onChange).toHaveBeenCalledWith('car.model', undefined);
    const modelComponent = within(screen.getByTestId('carModel-input'));
    await userEvent.click(modelComponent.getByRole('textbox'));
    await waitFor(() => {
      within(screen.getByTestId('common-my-complete__poppers')).getByText(
        'Atto 3'
      );
    });
    await userEvent.click(
      within(screen.getByTestId('common-my-complete__poppers')).getByText(
        'Atto 3'
      )
    );
    expect(onChange).toHaveBeenCalledWith('car.brand', 'BYD');
    expect(onChange).toHaveBeenCalledWith('car.model', 'Atto 3');
  });
});

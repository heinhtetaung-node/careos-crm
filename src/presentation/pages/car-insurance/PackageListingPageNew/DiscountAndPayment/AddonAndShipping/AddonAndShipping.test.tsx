import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, within, waitFor } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';
import { UserRoles } from 'config/constant';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';
import AddonAndShipping from '.';

const mockHandleDeliveryOptionChange = jest.fn();
const mockHandleAddonSelect = jest.fn();

// Mock hooks
jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: jest.fn(),
}));

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: jest.fn(),
}));

const mockUseGetUserSelector = useGetUserSelector as jest.MockedFunction<
  typeof useGetUserSelector
>;
const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;

const mockShippingOptions = [
  {
    name: 'deliveryOptions/digital-delivery',
    displayName: 'Digital Delivery',
    shipmentFee: '0',
  },
  {
    name: 'deliveryOptions/kerry-standard',
    displayName: 'Kerry Standard',
    shipmentFee: '5000',
  },
];

describe('AddonAndShipping', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleDeliveryOptionChange.mockClear();
    mockHandleAddonSelect.mockClear();

    // Default mocks
    mockUseGetUserSelector.mockReturnValue({
      role: UserRoles.ADMIN_ROLE,
    } as any);

    mockUseAppSelector.mockReturnValue('products/car-insurance');

    // Mock window.location.pathname
    delete (window as any).location;
    window.location = { ...originalLocation, pathname: '/' } as Location;

    // Default: feature flag disabled
    mockUseFlags([]);
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should display shipping options with default value selected', async () => {
    server.use(
      http.get(
        getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
        () =>
          HttpResponse.json({
            deliveryOptions: mockShippingOptions,
          })
      )
    );
    render(
      <AddonAndShipping
        deliveryOption="deliveryOptions/kerry-standard"
        handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
        selectedAddon={[]}
        handleAddonSelect={mockHandleAddonSelect}
      />
    );
    const defaultOption = await screen.findByText('Kerry Standard');
    expect(within(defaultOption).getByRole('radio')).toBeChecked();
  });

  it('should be able to change shipping option', async () => {
    server.use(
      http.get(
        getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
        () =>
          HttpResponse.json({
            deliveryOptions: mockShippingOptions,
          })
      )
    );
    render(
      <AddonAndShipping
        deliveryOption="deliveryOptions/kerry-standard"
        handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
        selectedAddon={[]}
        handleAddonSelect={mockHandleAddonSelect}
      />
    );
    const toBeSelected = await screen.findByText('Digital Delivery');
    await userEvent.click(toBeSelected);
    expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
      'deliveryOptions/digital-delivery'
    );
  });

  describe('preselectedShippingOption logic (lines 60-106)', () => {
    beforeEach(() => {
      server.use(
        http.get(
          getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
          () =>
            HttpResponse.json({
              deliveryOptions: mockShippingOptions,
            })
        )
      );
      // Enable feature flag for preselection tests
      mockUseFlags([
        FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP,
      ]);
    });

    describe('Condition 0: policyType undefined → Digital', () => {
      it('should preselect digital delivery when policyType is not provided', async () => {
        render(
          <AddonAndShipping
            insuranceKind="mandatory"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery when policyType is undefined + voluntary insurance', async () => {
        render(
          <AddonAndShipping
            insuranceKind="voluntary"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery when policyType is undefined + both insurance kinds', async () => {
        render(
          <AddonAndShipping
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });
    });

    describe('Condition 1 & 2: Person + (Voluntary + Mandatory OR Voluntary) → Digital', () => {
      it('should preselect digital delivery for Person (customer) + both insurance kinds', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (customer) + voluntary insurance', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="voluntary"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (straw_buyer) + both insurance kinds', async () => {
        render(
          <AddonAndShipping
            policyType="straw_buyer"
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (straw_buyer) + voluntary insurance', async () => {
        render(
          <AddonAndShipping
            policyType="straw_buyer"
            insuranceKind="voluntary"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });
    });

    describe('Condition 3 & 7: Person + Mandatory + NOT (Navakij OR Tokio) → Standard', () => {
      it('should preselect kerry standard for Person (customer) + mandatory + no insurer', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/kerry-standard'
          );
        });
      });

      it('should preselect kerry standard for Person (customer) + mandatory + other insurer', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            insurerName="Bangkok Insurance"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/kerry-standard'
          );
        });
      });

      it('should preselect kerry standard for Person (straw_buyer) + mandatory + no insurer', async () => {
        render(
          <AddonAndShipping
            policyType="straw_buyer"
            insuranceKind="mandatory"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/kerry-standard'
          );
        });
      });
    });

    describe('Condition 4 & 8: Person + Mandatory + (Navakij OR Tokio) → Digital', () => {
      it('should preselect digital delivery for Person (customer) + mandatory + Navakij', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            insurerName="Navakij Insurance"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (customer) + mandatory + Tokio', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            insurerName="Tokio Marine"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (customer) + mandatory + navakij (case insensitive)', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            insurerName="NAVAKIJ INSURANCE"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (customer) + mandatory + tokio (case insensitive)', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="mandatory"
            insurerName="TOKIO MARINE"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });

      it('should preselect digital delivery for Person (straw_buyer) + mandatory + Navakij', async () => {
        render(
          <AddonAndShipping
            policyType="straw_buyer"
            insuranceKind="mandatory"
            insurerName="Navakij Insurance"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });
    });

    describe('Condition 5 & 6: Company + (Voluntary + Mandatory OR Voluntary) → Standard', () => {
      it('should preselect kerry standard for Company + both insurance kinds', async () => {
        render(
          <AddonAndShipping
            policyType="company"
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/kerry-standard'
          );
        });
      });

      it('should preselect kerry standard for Company + voluntary insurance', async () => {
        render(
          <AddonAndShipping
            policyType="company"
            insuranceKind="voluntary"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/kerry-standard'
          );
        });
      });
    });

    describe('Edge cases', () => {
      it('should not preselect when shipping options are empty', async () => {
        server.use(
          http.get(
            getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
            () =>
              HttpResponse.json({
                deliveryOptions: [],
              })
          )
        );

        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
        });
      });

      it('should not preselect when shipping options is null', async () => {
        server.use(
          http.get(
            getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
            () =>
              HttpResponse.json({
                deliveryOptions: null,
              })
          )
        );

        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="both"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
        });
      });

      it('should not preselect when Company + mandatory (no matching condition)', async () => {
        render(
          <AddonAndShipping
            policyType="company"
            insuranceKind="mandatory"
            deliveryOption=""
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
        });
      });

      it('should still call handleDeliveryOptionChange even when deliveryOption is already set (idempotent)', async () => {
        render(
          <AddonAndShipping
            policyType="customer"
            insuranceKind="both"
            deliveryOption="deliveryOptions/kerry-standard"
            handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
            selectedAddon={[]}
            handleAddonSelect={mockHandleAddonSelect}
          />
        );

        // The useEffect will still run and call handleDeliveryOptionChange with the preselected value
        // even if deliveryOption is already set, because the useEffect doesn't check the current value
        await waitFor(() => {
          expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
            'deliveryOptions/digital-delivery'
          );
        });
      });
    });
  });

  describe('Feature flag: BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP', () => {
    beforeEach(() => {
      server.use(
        http.get(
          getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
          () =>
            HttpResponse.json({
              deliveryOptions: mockShippingOptions,
            })
        )
      );
    });

    it('should not preselect when feature flag is disabled', async () => {
      mockUseFlags([]); // Flag disabled

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="both"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      await waitFor(() => {
        expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
      });
    });

    it('should preselect when feature flag is enabled', async () => {
      mockUseFlags([
        FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP,
      ]);

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="both"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      await waitFor(() => {
        expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
          'deliveryOptions/digital-delivery'
        );
      });
    });
  });

  describe('canEditShippingOptionInLead logic', () => {
    beforeEach(() => {
      server.use(
        http.get(
          getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'),
          () =>
            HttpResponse.json({
              deliveryOptions: mockShippingOptions,
            })
        )
      );
      // Enable feature flag for these tests since the className logic requires it
      mockUseFlags([
        FeatureFlags.BROK_4393_POLICY_OPTION_PRESELECT_20260113_TEMP,
      ]);
    });

    it('should allow sale agent to edit shipping option in leads when preselected is kerry-standard', async () => {
      mockUseGetUserSelector.mockReturnValue({
        role: UserRoles.SALE_ROLE,
      } as any);
      window.location = {
        ...originalLocation,
        pathname: '/leads/123',
      } as Location;

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="mandatory"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      // Wait for shipping options to load and preselected option to be calculated
      await screen.findByText('Kerry Standard');

      const shippingContainer = await screen.findByTestId('addon-shipping');
      expect(shippingContainer).not.toHaveClass('pointer-events-none');
      expect(shippingContainer).not.toHaveClass('cursor-not-allowed');

      const digitalDelivery = await screen.findByText('Digital Delivery');
      await userEvent.click(digitalDelivery);
      expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
        'deliveryOptions/digital-delivery'
      );
    });

    it('should allow supervisor to edit shipping option in leads when preselected is kerry-standard', async () => {
      mockUseGetUserSelector.mockReturnValue({
        role: UserRoles.SUPERVISOR_ROLE,
      } as any);
      window.location = {
        ...originalLocation,
        pathname: '/leads/456',
      } as Location;

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="mandatory"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      // Wait for shipping options to load and preselected option to be calculated
      await screen.findByText('Kerry Standard');

      const shippingContainer = await screen.findByTestId('addon-shipping');
      expect(shippingContainer).not.toHaveClass('pointer-events-none');
      expect(shippingContainer).not.toHaveClass('cursor-not-allowed');

      const digitalDelivery = await screen.findByText('Digital Delivery');
      await userEvent.click(digitalDelivery);
      expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
        'deliveryOptions/digital-delivery'
      );
    });

    it('should not allow sale agent to edit shipping option when not in leads path', async () => {
      mockUseGetUserSelector.mockReturnValue({
        role: UserRoles.SALE_ROLE,
      } as any);
      window.location = {
        ...originalLocation,
        pathname: '/orders/123',
      } as Location;

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="mandatory"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      // Wait for shipping options to load and any preselection to complete
      await screen.findByText('Kerry Standard');
      await waitFor(() => {
        // Wait for any preselection calls to complete
      });

      const shippingContainer = await screen.findByTestId('addon-shipping');
      expect(shippingContainer).toHaveClass('pointer-events-none');
      expect(shippingContainer).toHaveClass('cursor-not-allowed');

      // Clear any calls from preselection
      mockHandleDeliveryOptionChange.mockClear();

      const digitalDelivery = await screen.findByText('Digital Delivery');
      await userEvent.click(digitalDelivery);
      expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
    });

    it('should not allow sale agent to edit shipping option when preselected is not kerry-standard', async () => {
      mockUseGetUserSelector.mockReturnValue({
        role: UserRoles.SALE_ROLE,
      } as any);
      window.location = {
        ...originalLocation,
        pathname: '/leads/123',
      } as Location;

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="both"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      // Wait for shipping options to load (preselected will be digital-delivery for Person + both)
      await screen.findByText('Digital Delivery');
      await waitFor(() => {
        // Wait for any preselection calls to complete
      });

      const shippingContainer = await screen.findByTestId('addon-shipping');
      expect(shippingContainer).toHaveClass('pointer-events-none');
      expect(shippingContainer).toHaveClass('cursor-not-allowed');

      // Clear any calls from preselection
      mockHandleDeliveryOptionChange.mockClear();

      const kerryStandard = await screen.findByText('Kerry Standard');
      await userEvent.click(kerryStandard);
      expect(mockHandleDeliveryOptionChange).not.toHaveBeenCalled();
    });

    it('should allow admin to edit shipping option (not sale agent or supervisor)', async () => {
      mockUseGetUserSelector.mockReturnValue({
        role: UserRoles.ADMIN_ROLE,
      } as any);
      window.location = {
        ...originalLocation,
        pathname: '/leads/123',
      } as Location;

      render(
        <AddonAndShipping
          policyType="customer"
          insuranceKind="mandatory"
          deliveryOption=""
          handleDeliveryOptionChange={mockHandleDeliveryOptionChange}
          selectedAddon={[]}
          handleAddonSelect={mockHandleAddonSelect}
        />
      );

      // Wait for shipping options to load
      await screen.findByText('Kerry Standard');

      const shippingContainer = await screen.findByTestId('addon-shipping');
      expect(shippingContainer).not.toHaveClass('pointer-events-none');
      expect(shippingContainer).not.toHaveClass('cursor-not-allowed');

      // Admin can edit
      const digitalDelivery = await screen.findByText('Digital Delivery');
      await userEvent.click(digitalDelivery);
      expect(mockHandleDeliveryOptionChange).toHaveBeenCalledWith(
        'deliveryOptions/digital-delivery'
      );
    });
  });
});

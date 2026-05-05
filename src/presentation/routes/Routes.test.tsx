import React from 'react';

import { render } from '@testing-library/react';

jest.mock('presentation/pages/admin/auth/Page404', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-404" />,
}));

jest.mock('presentation/layouts/Auth', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="mock-auth-layout">{children}</div>,
}));

// Capture the un-flattened protected routes array built by AppRoutes.
let capturedBaseProtectedRoutes: any[] | null = null;

jest.mock('./index', () => {
  const flattenRoutes = jest.fn((routes: any[], _collection: any[], hasPathLanguage?: boolean) => {
    // `hasPathLanguage=true` is used for public/auth routes.
    if (!hasPathLanguage) {
      capturedBaseProtectedRoutes = routes;
    }
    return [];
  });

  // Minimal route groups used by `Routes.tsx` to build `baseProtectedRoutes`.
  const account = [{ path: '/account/settings', component: () => null, layout: () => null }];
  const dashboard = [{ path: '/dashboard', component: () => null, layout: () => null }];
  const auth = [{ path: '/auth/sign-in', component: () => null, layout: () => null }];
  const lead = [{ path: '/leads', component: () => null, layout: () => null }];
  const customer = [{ path: '/customers', component: () => null, layout: () => null }];
  const permissionDenied = [{ path: '/permission/denied', component: () => null, layout: () => null }];
  const packages = [{ path: '/packages', component: () => null, layout: () => null }];
  const order = [{ path: '/orders', component: () => null, layout: () => null }];
  const cancellation = [{ path: '/cancellations', component: () => null, layout: () => null }];
  const customerProfile = [{ path: '/customer-profile', component: () => null, layout: () => null }];
  const curatedCar = [{ path: '/curated-car', component: () => null, layout: () => null }];
  const discount = [{ path: '/discounts', component: () => null, layout: () => null }];
  const carePay = [{ path: '/care-pay', component: () => null, layout: () => null }];
  const accounting = [{ path: '/accounting', component: () => null, layout: () => null }];
  const performanceStatistic = [{ path: '/performance', component: () => null, layout: () => null }];

  return {
    __esModule: true,
    account,
    dashboard,
    auth,
    lead,
    customer,
    permissionDenied,
    flattenRoutes,
    packages,
    order,
    cancellation,
    customerProfile,
    curatedCar,
    discount,
    carePay,
    accounting,
    performanceStatistic,
  };
});

jest.mock('./healthRoutes', () => ({
  __esModule: true,
  healthRoutes: { path: '/health/leads', component: () => null, layout: () => null },
  healthOrdersRoutes: { path: '/health/orders', component: () => null, layout: () => null },
  healthPackageRoutes: { path: '/health/packages', component: () => null, layout: () => null },
  healthDiscountRoutes: { path: '/health/discounts', component: () => null, layout: () => null },
  healthCarePayRoutes: { path: '/health/care-pay', component: () => null, layout: () => null },
  healthQCRoutes: { path: '/health/qc', component: () => null, layout: () => null },
  healthPerformanceStatisticRoutes: { path: '/health/performance', component: () => null, layout: () => null },
}));

jest.mock('./travelRoutes', () => ({
  __esModule: true,
  travelOrdersRoutes: { path: '/travel/orders', component: () => null, layout: () => null },
}));

const mockUseGetAuthenticateQuery = jest.fn();
jest.mock('data/slices/authSlice', () => ({
  __esModule: true,
  useGetAuthenticateQuery: () => mockUseGetAuthenticateQuery(),
}));

const mockUseAppSelector = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  __esModule: true,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

import AppRoutes from './Routes';

describe('AppRoutes product route selection (Routes.tsx lines 59-80)', () => {
  beforeEach(() => {
    capturedBaseProtectedRoutes = null;
    mockUseAppSelector.mockReset();
    mockUseGetAuthenticateQuery.mockReset();
  });

  it('includes ALL product routes for Admin (isAdmin=true)', () => {
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/admin', product: 'products/health-insurance' },
    });
    // Product selector can be empty; Admin should still get both car + health groups.
    mockUseAppSelector.mockReturnValue('');

    render(<AppRoutes />);

    expect(capturedBaseProtectedRoutes).toBeTruthy();
    const paths = (capturedBaseProtectedRoutes ?? []).map((r: any) => r?.path);

    // Car lead routes and health lead routes both present.
    expect(paths).toContain('/leads');
    expect(paths).toContain('/health/leads');

    // Travel orders route group is also included for Admin in the orders section.
    expect(paths).toContain('/travel/orders');
  });

  it('includes only HEALTH routes when globalProduct is health for non-admin', () => {
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/manager', product: 'products/health-insurance' },
    });
    mockUseAppSelector.mockReturnValue('products/health-insurance');

    render(<AppRoutes />);

    const paths = (capturedBaseProtectedRoutes ?? []).map((r: any) => r?.path);
    expect(paths).toContain('/health/leads');
    expect(paths).not.toContain('/leads');
  });

  it('includes only CAR routes when globalProduct is car for non-admin', () => {
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/manager', product: 'products/car-insurance' },
    });
    mockUseAppSelector.mockReturnValue('products/car-insurance');

    render(<AppRoutes />);

    const paths = (capturedBaseProtectedRoutes ?? []).map((r: any) => r?.path);
    expect(paths).toContain('/leads');
    expect(paths).not.toContain('/health/leads');
  });

  it('includes only TRAVEL routes when globalProduct is travel for non-admin (line 77)', () => {
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/manager', product: 'products/travel-insurance' },
    });
    mockUseAppSelector.mockReturnValue('products/travel-insurance');

    render(<AppRoutes />);

    const paths = (capturedBaseProtectedRoutes ?? []).map((r: any) => r?.path);
    // Travel orders route should be included (line 77 returns travelRoutesList)
    expect(paths).toContain('/travel/orders');
    // Car and health routes should NOT be included for travel product
    expect(paths).not.toContain('/leads');
    expect(paths).not.toContain('/health/leads');
  });
});

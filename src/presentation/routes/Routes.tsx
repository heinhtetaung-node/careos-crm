import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from 'presentation/layouts/Auth';
import Page404 from 'presentation/pages/admin/auth/Page404';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';

import { IRoutes } from './route.interface';

import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

import {
  account as accountRoutes,
  dashboard as dashboardRoutes,
  auth as authRoutes,
  lead as leadRoutes,
  customer as customerRoutes,
  permissionDenied,
  flattenRoutes,
  packages as packageRoutes,
  order as orderRoutes,
  cancellation as cancellationRoutes,
  customerProfile as customerProfileRoutes,
  curatedCar as curatedCarRoutes,
  discount as discountRoutes,
  carePay as carePayRoutes,
  accounting as accountingRoutes,
  performanceStatistic as performanceStatisticRoutes,
} from './index';
import {
  healthCarePayRoutes,
  healthDiscountRoutes,
  healthRoutes,
  healthOrdersRoutes,
  healthPackageRoutes,
  healthQCRoutes,
  healthPerformanceStatisticRoutes,
} from './healthRoutes';
import { travelOrdersRoutes } from './travelRoutes';
import {
  RolesWithoutProduct,
  UserRoleID,
} from 'presentation/components/ProtectedRouteHelper';

function AppRoutes() {
  const { data: user } = useGetAuthenticateQuery();

  const product = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const globalProduct = RolesWithoutProduct.includes(user?.role as UserRoleID)
    ? product
    : user?.product || product;

  const isUsersWithoutProducts = RolesWithoutProduct.includes(
    user?.role as UserRoleID
  );

  const renderBaseOnProduct = (
    carRoutesList: IRoutes[],
    healthRoutesList: IRoutes[],
    travelRoutesList: IRoutes[]
  ): IRoutes[] => {
    if (isUsersWithoutProducts) {
      return [...carRoutesList, ...healthRoutesList, ...travelRoutesList];
    }

    const routesByProduct = {
      [PRODUCTS.CAR_PRODUCT_INSURANCE]: carRoutesList,
      [PRODUCTS.TRAVEL_PRODUCT_INSURANCE]: travelRoutesList,
      [PRODUCTS.HEALTH_PRODUCT_INSURANCE]: healthRoutesList,
    };

    return routesByProduct[globalProduct] ?? [];
  };

  const baseProtectedRoutes = [
    ...accountRoutes,
    ...dashboardRoutes,
    ...renderBaseOnProduct(leadRoutes, [healthRoutes], []),
    ...customerRoutes,
    ...renderBaseOnProduct(
      orderRoutes,
      [healthOrdersRoutes],
      [travelOrdersRoutes]
    ),
    ...permissionDenied,
    ...renderBaseOnProduct(packageRoutes, [healthPackageRoutes], []),
    ...customerProfileRoutes,
    ...cancellationRoutes,
    ...curatedCarRoutes,
    ...renderBaseOnProduct(discountRoutes, [healthDiscountRoutes], []),
    ...renderBaseOnProduct(carePayRoutes, [healthCarePayRoutes], []),
    ...renderBaseOnProduct([], [healthQCRoutes], []),
    ...renderBaseOnProduct(
      performanceStatisticRoutes,
      [healthPerformanceStatisticRoutes],
      []
    ),
    ...accountingRoutes,
  ];

  const protectedRoutes = flattenRoutes(baseProtectedRoutes, []);
  const publicRoutes = flattenRoutes(authRoutes, [], true);
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route: IRoutes) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PublicRoute component={route.component} layout={route.layout} />
            }
          />
        ))}
        {protectedRoutes.map((route: IRoutes) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                component={route.component}
                layout={route.layout}
                permission={route.permission}
                path={route.path}
              />
            }
          />
        ))}

        <Route
          path="*"
          element={
            <AuthLayout>
              <Page404 />
            </AuthLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

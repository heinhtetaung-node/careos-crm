import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { apiSlice } from '../apiSlice';

import { useLazyGetCarBySubModalQuery, useLazyGetCarDataQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

test('Test Car service API', async () => {
  server.use(
    http.get(`${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands`, () =>
      HttpResponse.json({
        data: {},
      })
    )
  );
  const { result } = renderHook(() => useLazyGetCarDataQuery({}), {
    wrapper,
  });
  const [getCarData] = result.current;

  await act(async () => {
    await getCarData({ pathParam: 'brands', queryParams: { pageSize: 10 } });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual(expect.objectContaining({}));
  });
});

test('Test Car service API with calls on loop', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands`,
      () =>
        HttpResponse.json({
          brands: [
            {
              name: 'brands/61',
              displayName: 'Land',
              order: 0,
            },
            {
              name: 'brands/60',
              displayName: 'MG',
              order: 0,
            },
            {
              name: 'brands/59',
              displayName: 'McLaren',
              order: 0,
            },
            {
              name: 'brands/58',
              displayName: 'Maxus',
              order: 0,
            },
            {
              name: 'brands/57',
              displayName: 'Volvo',
              order: 0,
            },
            {
              name: 'brands/56',
              displayName: 'Volkswagen',
              order: 0,
            },
            {
              name: 'brands/55',
              displayName: 'TR',
              order: 0,
            },
            {
              name: 'brands/54',
              displayName: 'Toyota',
              order: 1,
            },
            {
              name: 'brands/53',
              displayName: 'Tata',
              order: 0,
            },
            {
              name: 'brands/52',
              displayName: 'Subaru',
              order: 0,
            },
          ],
          nextPageToken: 'fake-next-page-token',
        }),
      { once: true }
    ),
    http.get(`${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands`, () =>
      HttpResponse.json({
        brands: [
          {
            name: 'brands/51',
            displayName: 'Ssangyong',
            order: 0,
          },
          {
            name: 'brands/50',
            displayName: 'Spyker',
            order: 0,
          },
          {
            name: 'brands/49',
            displayName: 'Smart',
            order: 0,
          },
          {
            name: 'brands/48',
            displayName: 'Skoda',
            order: 0,
          },
          {
            name: 'brands/47',
            displayName: 'Seat',
            order: 0,
          },
          {
            name: 'brands/46',
            displayName: 'Saab',
            order: 0,
          },
          {
            name: 'brands/45',
            displayName: 'Rover',
            order: 0,
          },
          {
            name: 'brands/44',
            displayName: 'Rolls-Royce',
            order: 0,
          },
          {
            name: 'brands/43',
            displayName: 'Renault',
            order: 0,
          },
        ],
        nextPageToken: '',
      })
    )
  );
  const { result } = renderHook(() => useLazyGetCarDataQuery({}), {
    wrapper,
  });
  const [getCarData] = result.current;

  await act(async () => {
    await getCarData({ pathParam: 'brands', queryParams: { pageSize: 10 } });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  await waitFor(() => {
    expect(data).toEqual([
      {
        brands: [
          { displayName: 'Land', name: 'brands/61', order: 0 },
          { displayName: 'MG', name: 'brands/60', order: 0 },
          { displayName: 'McLaren', name: 'brands/59', order: 0 },
          { displayName: 'Maxus', name: 'brands/58', order: 0 },
          { displayName: 'Volvo', name: 'brands/57', order: 0 },
          { displayName: 'Volkswagen', name: 'brands/56', order: 0 },
          { displayName: 'TR', name: 'brands/55', order: 0 },
          { displayName: 'Toyota', name: 'brands/54', order: 1 },
          { displayName: 'Tata', name: 'brands/53', order: 0 },
          { displayName: 'Subaru', name: 'brands/52', order: 0 },
        ],
        nextPageToken: 'fake-next-page-token',
      },
      {
        brands: [
          { displayName: 'Ssangyong', name: 'brands/51', order: 0 },
          { displayName: 'Spyker', name: 'brands/50', order: 0 },
          { displayName: 'Smart', name: 'brands/49', order: 0 },
          { displayName: 'Skoda', name: 'brands/48', order: 0 },
          { displayName: 'Seat', name: 'brands/47', order: 0 },
          { displayName: 'Saab', name: 'brands/46', order: 0 },
          { displayName: 'Rover', name: 'brands/45', order: 0 },
          { displayName: 'Rolls-Royce', name: 'brands/44', order: 0 },
          { displayName: 'Renault', name: 'brands/43', order: 0 },
        ],
        nextPageToken: '',
      },
    ]);
  });
});

const DemoCarDetail = {
  name: 'brands/54/models/613/submodels/12384/years/46444',
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
test('Car detail service API by sub modal year', async () => {
  server.use(
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
      `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/46444`,
      () => HttpResponse.json(DemoCarDetail)
    )
  );
  const { result } = renderHook(() => useLazyGetCarBySubModalQuery(), {
    wrapper,
  });
  const [getCarDetail] = result.current;

  await act(async () => {
    await getCarDetail({ subModelYear: 46444, registeredProvince: 10000 });
  });

  const { isLoading, data } = result.current[1];

  await hookWaitFor(() => expect(isLoading).toBeFalsy());
  if (data?.carProvinceOIC) {
    await waitFor(() => {
      expect(data).toEqual({
        brand: 'Toyota',
        cabType: '',
        carProvince: undefined,
        carProvinceOIC: {
          responseTimes: data.carProvinceOIC.responseTimes,
          value: 'success',
        },
        engineSize: 1800,
        fuelType: '',
        isCurated: true,
        isVan: false,
        model: 'Corolla Altis',
        noOfDoor: 4,
        subModel: 'Hybrid Mid',
        sumInsuredMax: 0,
        transmissionType: '',
        year: 2021,
      });
    });
  }
});

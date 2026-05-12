import { skipToken } from '@reduxjs/toolkit/query';
import i18next from 'i18next';
import has from 'lodash/has';
import { useMemo, useState, useEffect } from 'react';

import carColumns from './config';
import { useGetAddressDataQuery } from 'data/slices/addressSlice';
import {
  getCarApiSubmodelsYearsPath,
  CAR_MANUFACTURED_YEAR_QUERY_PARAM,
  getCarApiSubmodelsListResponseField,
} from 'shared/constants';
import {
  useLazyGetCarDataQuery,
  useGetCarDataQuery,
} from 'data/slices/carSlice';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { UpdatePayload } from 'presentation/components/common/FormikFields/LeadAutocomplete';
import { ICarInfo } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

import { getMappedCarData, API_CALLING_FIELDS } from './helper';
import { CAR_ROWS } from './interface';

export function getValue(value: string) {
  switch (value) {
    case 'true':
    case 'yes':
      return true;
    case 'false':
    case 'no':
      return false;
    default:
      return value;
  }
}

export function toggleRelatedField(
  relatedFields: CAR_ROWS[],
  fieldName: string,
  value: string | boolean
) {
  return relatedFields.map((field: CAR_ROWS) => ({
    name: field,
    field: fieldName,
    response: value,
  }));
}

export function formatCarData(
  carDataResponse: ICarInfo,
  formattedLicensePlate: undefined | string
) {
  const isRedPlate = carDataResponse?.carLicensePlate === 'redplate';
  const formattedCarData: any = {};
  Object.entries(carDataResponse).forEach(([key, value]: any) => {
    if (key === 'carColor' && value && value.length) {
      formattedCarData.carColor = value;
    } else if (
      key === 'carLicensePlate' &&
      has(carDataResponse, 'carLicensePlate')
    ) {
      if (isRedPlate) {
        // Also disable the license plate field.
        formattedCarData.redPlate = true;
        formattedCarData.carLicensePlate = '';
      } else if (
        carDataResponse.carLicensePlate === '' ||
        (!!carDataResponse.carLicensePlate && !isRedPlate)
      ) {
        formattedCarData.redPlate = false;
        formattedCarData.carLicensePlate = formattedLicensePlate;
      }
    } else if (
      key === 'carLicensePlate' &&
      !has(carDataResponse, 'carLicensePlate')
    ) {
      formattedCarData.redPlate = undefined;
      formattedCarData.carLicensePlate = undefined;
    } else if (key !== 'carColor' || key !== 'carLicensePlate') {
      formattedCarData[key] = value;
    }
  });

  return formattedCarData;
}

function useUpdateCarData(
  carData: ICarInfo,
  onSave: (
    path: string,
    payload: any,
    op?: 'add' | 'replace' | 'remove'
  ) => void
) {
  const { errors, setFieldTouch } = useLeadDetailError();

  const [dataSchema, setDataSchema] = useState(carColumns);
  const [carState, setCarState] = useState<any>({});
  const [hasFetch, setHasFetch] = useState<any>({
    brand: false,
    model: false,
    subModel: false,
  });

  const [getCarData] = useLazyGetCarDataQuery();

  const { data: yearResponse, isLoading: isYearLoading } = useGetCarDataQuery({
    pathParam: 'manufacturedYears',
    queryParam: {},
    field: 'manufacturedYears',
  });

  const formattedYearResponse = useMemo(() => {
    if (yearResponse) {
      return yearResponse.map((year: any, index: number) => {
        // New endpoint returns objects like `{ name: 'manufacturedYears/2025', year: 2025 }`.
        // Old endpoint returned plain numbers.
        let yearValue: number | undefined;
        if (typeof year === 'number') {
          yearValue = year;
        } else if (typeof year?.year === 'number') {
          yearValue = year.year;
        } else if (typeof year?.name === 'string') {
          const tail = year.name.split('/').pop();
          yearValue = tail ? Number(tail) : undefined;
        }
        return {
          id: index,
          value: yearValue,
          title: yearValue != null ? yearValue.toString() : '',
        };
      });
    }
    return [];
  }, [yearResponse]);

  const { data: provinceResponse, isLoading: isProvinceLoading } =
    useGetAddressDataQuery(
      carData ? { pathParam: 'provinces', fieldName: 'provinces' } : skipToken
    );

  const formattedProvinceResponse = useMemo(() => {
    if (provinceResponse) {
      return provinceResponse.map((province: any, index: number) => ({
        id: index,
        value: parseInt(province.name.replaceAll('provinces/', ''), 10),
        title: i18next.language === 'en' ? province.nameEn : province.nameTh,
      }));
    }
    return [];
  }, [provinceResponse]);

  const formattedLicensePlate = useMemo(() => {
    if (has(carData, 'carLicensePlate')) {
      if (carData.carLicensePlate !== 'redplate') {
        return carData.carLicensePlate;
      }
      return '';
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carData.carLicensePlate]);

  useEffect(() => {
    if (carData) {
      setCarState(formatCarData(carData, formattedLicensePlate));
    }
  }, [carData, formattedLicensePlate]);

  // set options for brand and provinces.
  useEffect(() => {
    if (carData) {
      setDataSchema(
        getMappedCarData(carData, [
          { name: 'year', field: 'options', response: formattedYearResponse },
          {
            name: 'registeredProvince',
            field: 'options',
            response: formattedProvinceResponse,
          },
          {
            name: 'redPlate',
            field: 'value',
            response: carData?.carLicensePlate !== 'redplate',
          },
        ])
      );
    }
  }, [carData, formattedYearResponse, formattedProvinceResponse]);

  // errors
  useEffect(() => {
    setDataSchema(
      getMappedCarData(carData, [
        {
          name: CAR_ROWS.VEHICLE_COLOR,
          field: 'error',
          response: errors[CAR_ROWS.VEHICLE_COLOR],
        },
        {
          name: CAR_ROWS.VEHICLE_ID_NUMBER,
          field: 'error',
          response: errors[CAR_ROWS.VEHICLE_ID_NUMBER],
        },
        {
          name: CAR_ROWS.VEHICLE_ID_NUMBER,
          field: 'textFieldError',
          response: false,
        },
        {
          name: CAR_ROWS.CHASSIS_NUMBER,
          field: 'error',
          response: errors[CAR_ROWS.CHASSIS_NUMBER],
        },
        {
          name: CAR_ROWS.CHASSIS_NUMBER,
          field: 'textFieldError',
          response: false,
        },
        {
          name: CAR_ROWS.LICENSE_PLATE,
          field: 'error',
          response: errors[CAR_ROWS.LICENSE_PLATE],
        },
        {
          name: CAR_ROWS.PROVINCE,
          field: 'error',
          response: errors[CAR_ROWS.PROVINCE],
        },
        {
          name: CAR_ROWS.DRIVING_PURPOSE,
          field: 'error',
          response: errors[CAR_ROWS.DRIVING_PURPOSE],
        },
        {
          name: CAR_ROWS.DASHCAM,
          field: 'error',
          response: errors[CAR_ROWS.DASHCAM],
        },
        {
          name: CAR_ROWS.MODIFICATION,
          field: 'error',
          response: errors[CAR_ROWS.MODIFICATION],
        },
        {
          name: CAR_ROWS.SUB_MODEL,
          field: 'error',
          response: errors[CAR_ROWS.SUB_MODEL],
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  useEffect(() => {
    async function fetchOptions({
      pathParam,
      queryParam,
      field,
      stateField,
    }: any) {
      const response = await getCarData({
        pathParam,
        queryParam: {
          ...queryParam,
        },
        field,
      });

      if (!response.isError) {
        let resCopy: any = [...response.data];
        let patchResponse: any = [];

        if (stateField === 'brand' || stateField === 'model') {
          resCopy = resCopy.map((fields: any) => {
            // New endpoints return `{ name: '…/brands/<id>' | '…/models/<id>', displayName }`.
            // Old endpoint returned `{ id, name }`. Support both.
            const trailingId = fields?.name?.includes('/')
              ? Number(fields.name.split('/').pop())
              : fields?.id;
            return {
              id: trailingId,
              value: trailingId,
              title: fields?.displayName ?? fields?.name,
            };
          });

          patchResponse = [
            {
              name: stateField,
              field: 'options',
              response: resCopy,
            },
          ];
        }
        if (stateField === 'noOfDoors') {
          resCopy = resCopy.map((fields: any) => ({
            engineSize: fields.engineSize,
            doors: fields.doors,
          }));

          patchResponse = [
            {
              name: stateField,
              field: 'options',
              response: resCopy,
            },
          ];
        }
        // Transform car api response to show car submodel name to user.
        if (stateField === 'carSubModelYear') {
          resCopy = resCopy.map((fields: any, index: number) => {
            // New endpoint returns `{ name: '…/submodels/<id>', displayName, engineSize, doors }`
            // (no `years/<id>` segment). Old endpoint returned `…/submodels/<sid>/years/<yid>`.
            // Support both: prefer year segment when present, else fall back to submodel id.
            const nameStr: string = fields?.name ?? '';
            const yearMatch = nameStr.includes('years/')
              ? nameStr
                  .substring(nameStr.indexOf('years/'))
                  .replace('years/', '')
              : nameStr.split('/').pop();
            return {
              id: index,
              value: yearMatch ? parseInt(yearMatch, 10) : '',
              title: fields?.displayName?.trim(),
              engineSize: fields?.engineSize,
              doors: fields?.doors,
              redbookId: fields?.redbookId,
            };
          });

          patchResponse = [
            {
              name: stateField,
              field: 'options',
              response: resCopy,
            },
            ...(carState.subModel
              ? [
                  {
                    name: stateField,
                    field: 'fallbackSelectedValueResolver',
                    response: () => ({
                      id: -1,
                      value: -1,
                      title: carState.subModel,
                    }),
                  },
                ]
              : []),
          ];
        }

        setDataSchema(() => getMappedCarData(carState, patchResponse));
      } else {
        newrelic?.noticeError?.(response as any);
      }
    }

    if (carState) {
      // fetch brand
      if (carState.year && !hasFetch.brand) {
        fetchOptions({
          pathParam: `manufacturedYears/${carState.year}/brands`,
          queryParam: {},
          field: 'brands',
          stateField: 'brand',
        });
      }

      // fetch model
      if (carState.year && carState.brand && !hasFetch.model) {
        fetchOptions({
          pathParam: `manufacturedYears/${carState.year}/brands/${carState.brand}/models`,
          queryParam: {},
          field: 'models',
          stateField: 'model',
        });
      }

      // Submodel / doors lists: `:getUniqueCars` returns variants under `car`, not `submodels`.
      if (carState.year && carState.brand && carState.model && !hasFetch.year) {
        const pathParam = getCarApiSubmodelsYearsPath(
          carState.brand,
          carState.model
        );
        const listField = getCarApiSubmodelsListResponseField(pathParam);
        const queryParam = {
          [CAR_MANUFACTURED_YEAR_QUERY_PARAM]: carState.year,
        };
        fetchOptions({
          pathParam,
          queryParam,
          field: listField,
          stateField: 'carSubModelYear',
        });
        fetchOptions({
          pathParam,
          queryParam,
          field: listField,
          stateField: 'noOfDoors',
        });
      }
    }
  }, [carState]);

  useEffect(() => {
    let patchResponse: any = [];
    const relatedFields = [
      CAR_ROWS.FUEL_TYPE,
      CAR_ROWS.TRANSMISSION_GEAR,
      CAR_ROWS.ENGINE_SIZE,
      CAR_ROWS.NUMBER_DOORS,
      CAR_ROWS.CAB_TYPE,
      CAR_ROWS.MODIFICATION,
      CAR_ROWS.DASHCAM,
      CAR_ROWS.DRIVING_PURPOSE,
      CAR_ROWS.NUMBER_REGISTERED_SEATS,
      CAR_ROWS.PROVINCE,
      CAR_ROWS.RED_PLATE,
      CAR_ROWS.LICENSE_PLATE,
      CAR_ROWS.CHASSIS_NUMBER,
      CAR_ROWS.VEHICLE_ID_NUMBER,
      CAR_ROWS.VEHICLE_COLOR,
    ];

    if (
      carState &&
      carState.brand &&
      carState.model &&
      carState.year &&
      carState.subModel &&
      carState.carSubModelYear
    ) {
      patchResponse = toggleRelatedField(relatedFields, 'isDisabled', false);
    } else {
      patchResponse = toggleRelatedField(relatedFields, 'isDisabled', true);
    }

    if (carState) {
      const isForPersonalUse = carState?.carUsageType === 'personal';
      if (isForPersonalUse && carState.isVan) {
        patchResponse.push({
          name: CAR_ROWS.NUMBER_REGISTERED_SEATS,
          field: 'options',
          response: [
            {
              id: 0,
              val: 7,
              title: getString(
                'leadDetailFields.registeredSeatsOptions.lessThan7'
              ),
            },
            {
              id: 1,
              val: 8,
              title: getString(
                'leadDetailFields.registeredSeatsOptions.moreThan7'
              ),
            },
          ],
        });
      } else {
        patchResponse.push({
          name: CAR_ROWS.NUMBER_REGISTERED_SEATS,
          field: 'options',
          response: [],
        });
        patchResponse.push({
          name: CAR_ROWS.NUMBER_REGISTERED_SEATS,
          field: 'isDisabled',
          response: true,
        });
      }

      if (carState.redPlate) {
        patchResponse.push({
          name: CAR_ROWS.LICENSE_PLATE,
          field: 'isDisabled',
          response: true,
        });
      }

      if (!carState.cabType) {
        patchResponse.push({
          name: CAR_ROWS.CAB_TYPE,
          field: 'isDisabled',
          response: true,
        });
      }

      if (!carState.fuelType) {
        patchResponse.push({
          name: CAR_ROWS.FUEL_TYPE,
          field: 'isDisabled',
          response: true,
        });
      }

      if (!carState.engineSize) {
        patchResponse.push({
          name: CAR_ROWS.ENGINE_SIZE,
          field: 'isDisabled',
          response: true,
        });
        patchResponse.push({
          name: CAR_ROWS.ENGINE_SIZE,
          field: 'showAsterisk',
          response: false,
        });
      }

      if (!carState.transmission) {
        patchResponse.push({
          name: CAR_ROWS.TRANSMISSION_GEAR,
          field: 'isDisabled',
          response: true,
        });
      }
    }

    setDataSchema(() => getMappedCarData(carState, patchResponse));
  }, [carState]);

  const removeCarRegisteredSeats = (field: string, value: string) =>
    field === CAR_ROWS.DRIVING_PURPOSE &&
    (value === 'commercial' || !carState.isVan) &&
    carData?.carRegisteredSeats;

  const handleRadioChange = (event: any, fieldName: string) => {
    setFieldTouch(fieldName as any);
    if (event?.target?.value) {
      const value = getValue(event.target.value);

      if (
        API_CALLING_FIELDS.includes(fieldName) &&
        fieldName !== 'carRegisteredSeats'
      ) {
        onSave(`/${fieldName}`, value);
        if (removeCarRegisteredSeats(fieldName, value as string)) {
          onSave('/carRegisteredSeats', '', 'remove');
        }
      } else if (fieldName === 'redPlate') {
        onSave('/carLicensePlate', value ? 'redplate' : '');
      } else if (fieldName === 'carRegisteredSeats' && value) {
        onSave(
          `/carRegisteredSeats`,
          typeof value === 'string' ? parseInt(value, 10) : value
        );
      }

      setCarState((prevState: any) => ({
        ...prevState,
        [fieldName]: value,
      }));
    }
  };

  const handleFieldChange = (state: any, payload: any, name: any) => {
    setFieldTouch(name as any);
    if (name === 'year') {
      setHasFetch({
        brand: false,
        model: false,
        subModel: false,
      });

      setDataSchema(() =>
        getMappedCarData(carState, [
          {
            name: CAR_ROWS.CAR_BRAND,
            field: 'options',
            response: [],
          },
          {
            name: CAR_ROWS.CAR_MODEL,
            field: 'options',
            response: [],
          },
          {
            name: CAR_ROWS.SUB_MODEL,
            field: 'options',
            response: [],
          },
        ])
      );

      return {
        ...state,
        [name]: payload?.selections?.value || null,
        brand: null,
        model: null,
        subModel: null,
        carSubModelYear: null,
        fuelType: null,
        transmission: null,
        engineSize: null,
        noOfDoors: null,
        cabType: null,
      };
    }

    if (name === 'brand') {
      setHasFetch({
        brand: true,
        model: false,
        subModel: false,
      });

      setDataSchema(() =>
        getMappedCarData(carState, [
          {
            name: CAR_ROWS.CAR_MODEL,
            field: 'options',
            response: [],
          },
          {
            name: CAR_ROWS.SUB_MODEL,
            field: 'options',
            response: [],
          },
        ])
      );

      return {
        ...state,
        [name]: payload?.selections?.value || null,
        model: null,
        subModel: null,
        carSubModelYear: null,
        fuelType: null,
        transmission: null,
        engineSize: null,
        noOfDoors: null,
        cabType: null,
      };
    }

    if (name === 'model') {
      setHasFetch({
        brand: true,
        model: true,
        subModel: false,
      });

      setDataSchema(() =>
        getMappedCarData(carState, [
          {
            name: CAR_ROWS.SUB_MODEL,
            field: 'options',
            response: [],
          },
        ])
      );

      return {
        ...state,
        [name]: payload?.selections?.value || null,
        subModel: null,
        carSubModelYear: null,
        fuelType: null,
        transmission: null,
        engineSize: null,
        noOfDoors: null,
        cabType: null,
      };
    }

    return state;
  };

  const isObjectPayload = (payload: UpdatePayload) =>
    payload &&
    typeof payload === 'object' &&
    payload.selections &&
    typeof payload.selections === 'object';

  const handleAutocompleteChange = (payload: any, name: string) => {
    setFieldTouch(name as any);
    if (API_CALLING_FIELDS.includes(name)) {
      if (isObjectPayload(payload) && !Array.isArray(payload.selections)) {
        if (name === 'carColor') {
          onSave(`/${name}`, [payload.selections.value]);
        } else if (name === 'registeredProvince') {
          if (carData.carLicensePlate) {
            onSave('/carLicensePlate', null, 'remove');
          }
          onSave(`/${name}`, payload.selections.value);
        } else {
          onSave(`/${name}`, payload.selections.value);
        }
      } else if (
        isObjectPayload(payload) &&
        Array.isArray(payload.selections)
      ) {
        const selectedOptions = payload.selections.map(
          (opt: { value: string }) => opt.value
        );
        if (name === 'carColor') {
          onSave(`/${name}`, selectedOptions);
        }
      }
    }

    setCarState((prevState: any) =>
      handleFieldChange(prevState, payload, name)
    );
  };

  const handleTextChange = (payload: any, name: string) => {
    setFieldTouch(name as any);
    if (API_CALLING_FIELDS.includes(name)) {
      if (payload && typeof payload === 'object') {
        onSave(`/${name}`, payload[name]);
      }
    }
  };

  return {
    isLoading: isYearLoading || isProvinceLoading,
    dataSchema,
    carState,
    handleRadioChange,
    handleFieldChange,
    handleTextChange,
    handleAutocompleteChange,
  };
}

export default useUpdateCarData;

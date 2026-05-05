import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getLeadIdFromPath } from 'shared/helper/utilities';
import { Lead } from 'shared/types/lead';
import { getString } from 'presentation/theme/localization';
import { ArrowLeftIcon } from '@alphafounders/icons';
import { CarFilterOptions } from 'presentation/components/common/CarFilterOptions';

import { FilterInterface } from './PackageFilter/interface';
import {
  getDefaultValues,
  getFilterConfig,
} from './PackageFilter/packageFilter.helper';
import useGetInitialPackageValues from './hooks/useGetInitialPackageValues';
import { LeadFilterOptions } from 'presentation/components/common/LeadFilterOptions';
import FilterSideBarSkeleton from './FilterSideBarSkeleton';
import { getAgeByBirthday } from '@careos/utils';

export default function FilterSideBar({
  filter,
  currentData,
  setCurrentData,
  rawPackages,
  setInitialCar,
  setForceRefreshingTable,
}: Readonly<{
  filter: {
    values: FilterInterface;
    setValues: (values: FilterInterface) => void;
  };
  currentData: any;
  setCurrentData: (data: any) => void;
  rawPackages: any;
  setInitialCar: (data: any) => void;
  setForceRefreshingTable?: (data: any) => void;
}>) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();
  const hasInitializedLeadCarDataRef = useRef(false);

  useEffect(() => {
    hasInitializedLeadCarDataRef.current = false;
  }, [leadId]);

  const {
    sumInsuredMinMax,
    provinces,
    years,
    models,
    subModels,
    brands,
    carInfo,
    noOfDoors,
    engineSizes,
    isLoading: isInitialLoading,
    updateCarGeneral,
    lead: leadData,
  } = useGetInitialPackageValues({ leadId, skip: true, onlyRedbookId: true });

  const { config } = getFilterConfig(
    rawPackages,
    {
      sumInsuredMinMax,
      provinces,
      years,
      models,
      subModels,
      brands,
      noOfDoors,
      engineSizes,
    },
    true
  );

  const { defaultValues } = useMemo(
    () =>
      getDefaultValues(config, leadData as Lead, {
        sumInsuredMinMax,
        carInfo,
      }),
    [config, leadData, sumInsuredMinMax, carInfo]
  );

  const getInsuranceType = () =>
    leadData?.data?.voluntaryInsuranceType
      ?.map((item: any) =>
        getString(`qc.${item?.replace('_', '').replace('+', 'Plus')}`)
      )
      .join(', ');

  useEffect(() => {
    const leadDataObj = (leadData as any)?.data;

    const {
      brand,
      year,
      model,
      carSubModelYear,
      noOfDoors: _noOfDoors,
      engineSize: _engineSizes,
      province,
    } = defaultValues;
    setInitialCar({
      brand,
      year,
      model,
      carSubModelYear,
      noOfDoors: _noOfDoors,
      engineSize: _engineSizes,
    });
    if (!defaultValues || !leadDataObj || !brand || !model) return;

    const shouldHydrateLeadCarData =
      !hasInitializedLeadCarDataRef.current &&
      [currentData?.brand, currentData?.model, currentData?.year].some(
        (value) => value == null || value === ''
      );

    hasInitializedLeadCarDataRef.current = true;

    if (shouldHydrateLeadCarData) {
      filter.setValues(defaultValues);
      setCurrentData((prev: any) => ({
        ...prev,
        brand,
        year,
        model,
        carSubModelYear,
        province,
        noOfDoors: _noOfDoors,
        engineSize: _engineSizes,
        leadId: leadData?.humanId,
        insuranceType: getInsuranceType(),
        repairType: '-', // get from package result after search api
        drivingPurpose:
          leadDataObj.carUsageType === 'personal' ? 'PERSONAL' : 'COMMERCIAL',
        dashCam: leadDataObj.carDashCam,
        modification: leadDataObj.carModified,
        redPlate: leadDataObj.carLicensePlate === 'redplate',
        carLicensePlate:
          leadDataObj.carLicensePlate !== 'redplate'
            ? leadDataObj.carLicensePlate
            : null,
        chassisNumber: leadDataObj.chassisNumber,
        vehicleIdNumber: leadDataObj.vehicleIdNumber,
        carColor: leadDataObj.carColor,
        currentInsurer: leadDataObj.currentInsurer,
        insuranceKind: leadDataObj.insuranceKind ?? prev.insuranceKind,
        policyStartDate: leadDataObj.policyStartDate,
        compulsoryPolicyStartDate: leadDataObj.compulsoryPolicyStartDate,
        customerFirstName: leadDataObj.customerFirstName,
        customerLastName: leadDataObj.customerLastName,
        customerEmail: leadDataObj.customerEmail,
        customerPhoneNumber: leadDataObj.customerPhoneNumber,
        customerGender: leadDataObj.customerGender,
        customerDOB: leadDataObj.customerDOB,
        customerLanguage: leadDataObj.locale,
        customerAge: getAgeByBirthday(leadDataObj.customerDOB),
        policyHolderDOB: leadDataObj.policyHolderDOB,
        policyHolderFirstName: leadDataObj.policyHolderFirstName,
        policyHolderGender: leadDataObj.policyHolderGender,
        policyHolderLastName: leadDataObj.policyHolderLastName,
        policyHolderNationalId: leadDataObj.policyHolderNationalId,
        policyTitle: leadDataObj.policyTitle,
        policyHolderAge: getAgeByBirthday(leadDataObj.policyHolderDOB),
        numberOfFixedDriver: leadDataObj.numberOfFixedDriver,
        policyHolderType: leadDataObj.policyHolderType,
        policyHolderCompanyName:
          leadDataObj?.customerPolicyAddress?.[0]?.companyName,
        policyHolderTaxId: leadDataObj?.customerPolicyAddress?.[0]?.taxId,
      }));
      setTimeout(() => {
        setForceRefreshingTable?.(false);
      }, 300);
    }
  }, [defaultValues, leadData]);
  useEffect(() => {
    if (currentData?.brand && brands.length && models.length) {
      setCurrentData((prev: any) => ({
        ...prev,
        yearValue: currentData.year,
        brandText:
          brands.find(
            (brand: { value: string; label: string; title?: string }) =>
              brand.value === carInfo?.brand
          )?.title ?? '',
        modelText:
          models.find(
            (model: { value: string; label: string; title?: string }) =>
              model.value === carInfo?.model
          )?.title ?? '',
        subModelText: currentData.carSubModelYear ? carInfo?.subModel : '',
        redbookId: currentData.carSubModelYear ? carInfo?.redbookId : '',
      }));
    }
  }, [
    currentData?.brand,
    currentData?.model,
    brands,
    models,
    carInfo?.subModel,
    carInfo?.redbookId,
  ]);
  useEffect(() => {
    if (currentData?.year && !currentData?.brand) {
      setCurrentData((prev: any) => ({
        ...prev,
        yearValue: currentData.year,
        brandText: '',
        modelText: '',
        subModelText: '',
      }));
    }
  }, [currentData?.year, currentData?.brand]);
  if (isInitialLoading) {
    return <FilterSideBarSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen scrollbar-hide overflow-y-auto overflow-x-hidden">
      <div className="bg-white p-2">
        <button
          className="py-5 px-2 flex items-center bg-white border-none"
          type="button"
          onClick={() => navigate(`/leads/${params.id}`)}
        >
          <ArrowLeftIcon />
          <span className="ml-2">{getString('text.back')}</span>
        </button>
        <CarFilterOptions
          config={config}
          currentData={currentData}
          setCurrentData={(key: string, value: any) => {
            if (['year', 'brand', 'model'].includes(key)) {
              updateCarGeneral({ value, name: key });
            }
            const filters = currentData;
            if (key === 'year') {
              delete filters.brand;
              delete filters.model;
              delete filters.carSubModelYear;
              setCurrentData({ ...filters, [key]: value });
            }
            if (['model', 'brand'].includes(key)) {
              delete filters.carSubModelYear;
              delete filters.engineSize;
              delete filters.noOfDoors;
              setCurrentData({ ...filters, [key]: value });
            } else {
              setCurrentData({ ...filters, [key]: value });
            }
          }}
          setCurrentMultipleData={(obj: { [key: string]: any }) => {
            setCurrentData({ ...currentData, ...obj });
          }}
          leadData={leadData}
        />
        <LeadFilterOptions
          config={config}
          currentData={currentData}
          setCurrentData={(key: string, value: any) => {
            setCurrentData({ ...currentData, [key]: value });
          }}
          setCurrentMultipleData={(obj: { [key: string]: any }) => {
            setCurrentData({ ...currentData, ...obj });
          }}
          leadData={leadData}
        />
      </div>
    </div>
  );
}

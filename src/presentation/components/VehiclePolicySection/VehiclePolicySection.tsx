import {
  Paper as MuiPaper,
  withTheme,
  Box,
  Select,
  MenuItem,
} from '@material-ui/core';
import { PenOutlineIcon } from '@alphafounders/icons';
import i18next from 'i18next';
import _omit from 'lodash/omit';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './index.scss';
import styled from 'styled-components';

import { skipToken } from '@reduxjs/toolkit/query';
import { useGetAddressDataQuery } from 'data/slices/addressSlice';
import { useLazyGetCarsDataQuery } from 'data/slices/carSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import RadioGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import Dialog from 'presentation/components/common/Dialog';
import RenderInputAutoComplete from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderInputAutoComplete';
import RenderInputLicensePlate from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderInputLicensePlate';
import RenderInputTextItem from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderInputTextItem';
import { FormField } from 'presentation/pages/car-insurance/OrderDetailPage/InfoPanel/RenderItem';
import { updateOrder, getDetail } from 'presentation/redux/actions/order';
import { getProvince } from 'presentation/redux/actions/provinceDetail';
import { getString } from 'presentation/theme/localization';
import { thaiDateFormat } from 'shared/helper/thaiDateFormat';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';

import { getDriverFieldsToRemoveForCount } from './helper';
import FixedDriverModal from '../modal/FixedDriverModal';
import VehicleModelForm from '../modal/Qc/UpdateDataMyself/VehicleModelForm';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import { useGetOrderPolicyItemsQuery } from 'data/slices/orderSlice';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { UserRoles } from 'config/constant';
import canEditOrderVehicleInfoPolicy from 'shared/helper/canEditOrderVehicleInfoPolicy';
import { syncVehicleOrderFieldToLead } from 'shared/helper/vehicleOrderLeadSync';
import { PolicyItem } from 'presentation/pages/car-insurance/orders/PrintingAndShipping/helper';
import { OICCollection } from 'shared/constants/packageStaticData';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

/** Raw OIC option value (e.g. 110, E11) → order.data.oicCode (TYPE_110, TYPE_E11). */
export function formatOicCodeForOrder(raw: string): string {
  if (!raw) return '';
  return raw === 'E11' ? 'TYPE_E11' : `TYPE_${raw}`;
}

/** order.data.oicCode → value for OIC Select (110, E11, …). */
export function parseOicCodeForSelect(oicCode?: string | null): string {
  if (oicCode == null || oicCode === '') return '';
  return String(oicCode).replace(/^TYPE_/, '');
}

const Paper = withTheme(styled(MuiPaper)`
  &&& {
    height: 100%;
    border: 1px solid ${({ theme }) => theme.palette.grey[200]};
    border-radius: 6px;
  }
`);

const SubTitleInfo = styled.h3`
  margin: 0;
`;

const VehicleModelButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  color: inherit;
`;

const EditIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`;

const VehicleInfoTitle = styled.h3`
  margin: 0;
  padding: 10px 15px;
  color: ${({ theme }) => theme.palette.primary.main};
  background: ${({ theme }) => theme.palette.grey[200]};
  border-radius: 6px 6px 0 0;
`;

const FieldItem = withTheme(styled.span`
  &&& {
    width: 50%;
    display: flex;
    align-items: center;

    fieldset {
      border: none;
    }

    .MuiAutocomplete-inputRoot {
      .MuiInputBase-input {
        border: 0;
      }
    }

    .shared-select,
    .shared-input {
      border-radius: 4px;
    }
  }
`);

const Colon = styled.span`
  padding-bottom: 6px;
`;

const emptyLicense = {
  carLicensePlate: '',
};

interface IVehiclePolicySectionProps {
  order?: any;
  province?: any;
  getProvince: (modelYear: number) => void;
  updateOrder: (payload: any) => void;
  getDetail: (payload: {
    orderName: string;
    isFetchCarDetails?: boolean;
  }) => void;
  readOnly?: boolean;
}

function VehiclePolicySection({
  order,
  province,
  getProvince: handleGetProvince,
  updateOrder: handleUpdateOrder,
  getDetail: handleGetDetail,
  readOnly: readOnlyProp,
}: Readonly<IVehiclePolicySectionProps>) {
  const { updateLead } = useLeadUpdater();
  const [getCarData, { data: carData }] = useLazyGetCarsDataQuery();
  const { data: provinceResponse } = useGetAddressDataQuery(
    order ? { pathParam: 'provinces', fieldName: 'provinces' } : skipToken
  );
  const lang = capitalizeFirstLetter(
    (i18next.language || 'en').split(/[-_]/)[0]
  );

  const provinceOptions = useMemo(() => {
    if (!provinceResponse) return [];
    const nameField = `name${lang}`;
    return provinceResponse.map(
      (p: { name: string; nameEn?: string; nameTh?: string }) => ({
        value: Number.parseInt(p.name.replace(/^provinces\//, ''), 10),
        label: p[nameField as keyof typeof p] || '',
      })
    );
  }, [provinceResponse, i18next.language]);

  const [vehicle, setVehicle] = useState<any>({});
  const [showFixedDriverModal, setShowFixedDriverModal] = useState(false);
  const [showVehicleModelModal, setShowVehicleModelModal] = useState(false);
  const [isVehicleModelLoading, setIsVehicleModelLoading] = useState(false);
  const [isVehicleModelSubmitDisabled, setIsVehicleModelSubmitDisabled] =
    useState(true);
  const initialNumberOfFixedDriver = order?.data?.firstDriverName ? 1 : 0;
  const initialNumberOfFixedDriverIncludeSecondDriver = order?.data
    ?.secondDriverName
    ? 2
    : initialNumberOfFixedDriver;
  const [numberOfFixedDriver, setNumberOfFixedDriver] = useState(
    initialNumberOfFixedDriverIncludeSecondDriver
  );
  const featureFlags = useFlags([
    FeatureFlags.BROK_3694_ALLOW_EDIT_CARINFO_ORDER_DETAIL_20251103,
    FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP,
    FeatureFlags.BROK_4710_VEHICLE_UPDATE_WITHIN_ORDER_20260330_TEMP,
  ]);
  const isEnabledVehicleUpdateWithinOrder =
    featureFlags[
      FeatureFlags.BROK_4710_VEHICLE_UPDATE_WITHIN_ORDER_20260330_TEMP
    ]?.enabled ?? false;

  const isAllowEditCarInfo =
    featureFlags[
      FeatureFlags.BROK_3694_ALLOW_EDIT_CARINFO_ORDER_DETAIL_20251103
    ]?.enabled ?? false;
  const includeE11OicCode =
    featureFlags[
      FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP
    ]?.enabled ?? false;
  const oicCodeOptions = useMemo(
    () => OICCollection(includeE11OicCode),
    [includeE11OicCode]
  );
  const orderName = order?.name;
  const orderData = order?.data;

  const { data: policyItems } = useGetOrderPolicyItemsQuery(
    order?.name?.replaceAll('orders/', ''),
    {
      skip: !order?.humanId,
    }
  );
  const userRole = useGetUserSelector().role as UserRoles;
  const readOnly = !canEditOrderVehicleInfoPolicy({
    policyItems: policyItems as unknown as PolicyItem[],
    userRole,
    order,
    isEnabledVehicleUpdateWithinOrder,
    readOnly: readOnlyProp,
  });
  /** When BROK-4710 is off, driving purpose is display-only. Dash cam & custom vehicle are always display-only. */
  const readOnlyDrivingPurpose = readOnly || !isEnabledVehicleUpdateWithinOrder;
  const canEditVehicleModel =
    !readOnly && isAllowEditCarInfo && isEnabledVehicleUpdateWithinOrder;
  const vehicleModelDisplayText = useMemo(
    () =>
      vehicle?.carName ||
      [
        order?.car?.brand?.displayName,
        order?.car?.model?.displayName,
        order?.car?.subModel?.displayName,
      ]
        .filter(Boolean)
        .join(' '),
    [
      order?.car?.brand?.displayName,
      order?.car?.model?.displayName,
      order?.car?.subModel?.displayName,
      vehicle?.carName,
    ]
  );
  const vehicleModelData = useMemo(
    () =>
      order
        ? ({
            order,
            car: order.car,
          } as OrderDataResponse)
        : undefined,
    [order]
  );

  useEffect(() => {
    setVehicle((state: any) => ({
      ...state,
      ...order?.data,
    }));
    const { carSubModelYear, registeredProvince } = order?.data || {};
    if (carSubModelYear) {
      // eslint-disable-next-line no-unused-expressions
      getCarData({ resourceType: 'years', years: carSubModelYear });
    }
    if (registeredProvince) {
      handleGetProvince(registeredProvince);
    }
  }, [order, handleGetProvince]);

  useEffect(() => {
    setVehicle((state: any) => ({
      ...state,
      carName: (carData as { displayName?: string })?.displayName,
    }));
  }, [carData]);

  const onUpdateOrder = useCallback(
    async (payload: any) => {
      if (order?.name) {
        await syncVehicleOrderFieldToLead(
          updateLead,
          payload.name,
          payload.value
        );

        // REFACTOR ME: Once BE cleans up old order data, we can remove this extra check
        const data = _omit(order.data, 'policyHolder.nationalID');

        const transformers: Record<string, (value: any) => any> = {
          isRedPlate: (value) => value === 'true',
        };

        const transformedValue =
          transformers[payload.name]?.(payload.value) ?? payload.value;

        const formatedOrder = {
          name: order.name,
          data: {
            ...data,
            [payload.name]: transformedValue,
            ...(payload.name === 'isRedPlate' &&
              !data.carLicensePlate &&
              emptyLicense),
          },
        };

        handleUpdateOrder(formatedOrder);
      }
    },
    [handleUpdateOrder, order, updateLead]
  );

  const handleProvinceChange = useCallback(
    async (newProvinceId: number) => {
      await updateLead('/registeredProvince', newProvinceId);
      const data = _omit(order.data, 'policyHolder.nationalID');
      const updates: Record<string, unknown> = {
        registeredProvince: newProvinceId,
      };
      if (vehicle?.carLicensePlate && !vehicle?.isRedPlate) {
        const parts = vehicle.carLicensePlate.split(' ');
        const numberPart = parts[0] || '';
        const newAbbr =
          provinceAbbreviationCollection().find((p) => p.oic === newProvinceId)
            ?.abbreviation || '';
        if (numberPart && newAbbr) {
          updates.carLicensePlate = `${numberPart} ${newAbbr}`;
        }
      }
      if (typeof updates.carLicensePlate === 'string') {
        await updateLead('/carLicensePlate', updates.carLicensePlate);
      }
      handleUpdateOrder({
        name: order.name,
        data: { ...data, ...updates },
      });
    },
    [
      order,
      handleUpdateOrder,
      updateLead,
      vehicle?.carLicensePlate,
      vehicle?.isRedPlate,
    ]
  );

  const refreshOrderData = useCallback(() => {
    if (order?.name) {
      handleGetDetail({
        orderName: order.name,
        isFetchCarDetails: false,
      });
    }
  }, [handleGetDetail, order?.name]);

  const normalizedCarUsageType = useMemo(() => {
    const raw = vehicle?.carUsageType;
    if (typeof raw !== 'string') return '';
    return raw.toLowerCase();
  }, [vehicle?.carUsageType]);

  const normalizedOicSelectValue = useMemo(
    () => parseOicCodeForSelect(vehicle?.oicCode),
    [vehicle?.oicCode]
  );

  const applyFixedDriverCount = useCallback(
    (value: 0 | 1 | 2) => {
      if (!orderName || !orderData) return;

      const fieldsToRemove = getDriverFieldsToRemoveForCount(value);
      if (fieldsToRemove.length === 0) return;

      handleUpdateOrder({
        name: orderName,
        data: _omit(orderData, fieldsToRemove),
      });
    },
    [orderName, orderData, handleUpdateOrder]
  );

  const handleNoOfFixedDriverChange = useCallback(
    (value: 0 | 1 | 2) => {
      setNumberOfFixedDriver(value);
      setShowFixedDriverModal(true);
      applyFixedDriverCount(value);
    },
    [applyFixedDriverCount]
  );

  const handleVehicleModelModalToggle = useCallback(() => {
    setShowVehicleModelModal((currentState) => !currentState);
  }, []);

  const renderRedplate = () => {
    if (readOnly) {
      return vehicle?.isRedPlate ? getString('text.yes') : getString('text.no');
    }
    return (
      <RadioGroup
        row
        options={[
          {
            label: 'Yes',
            value: true,
          },
          {
            label: 'No',
            value: false,
          },
        ]}
        isDisabled={readOnly}
        value={vehicle?.isRedPlate ?? false}
        onChange={(_e: any, value: any) =>
          onUpdateOrder({ name: 'isRedPlate', value })
        }
      />
    );
  };

  const renderDashCam = () =>
    vehicle?.carDashCam ? getString('text.yes') : getString('text.no');

  const renderCustomVehicle = () =>
    vehicle?.carModified ? getString('text.yes') : getString('text.no');

  const langName = lang ? `name${lang}` : '';

  return (
    <Paper elevation={3} className="shared-insurer-info">
      <VehicleInfoTitle>{getString('text.vehicle')}</VehicleInfoTitle>
      <FormField>
        <FieldItem>{getString('text.typeOfVehicle')}</FieldItem>
        <FieldItem>{`: ${getString('lead.car')}`}</FieldItem>
      </FormField>
      {(vehicleModelDisplayText || canEditVehicleModel) && (
        <FormField>
          <VehicleModelButton
            type="button"
            disabled={!canEditVehicleModel}
            onClick={
              canEditVehicleModel ? handleVehicleModelModalToggle : undefined
            }
            data-testid="vehicle-model-trigger"
          >
            <SubTitleInfo>{vehicleModelDisplayText || '-'}</SubTitleInfo>
            {canEditVehicleModel && (
              <EditIconWrapper>
                <PenOutlineIcon fontSize="small" />
              </EditIconWrapper>
            )}
          </VehicleModelButton>
        </FormField>
      )}
      <FormField>
        <FieldItem>{getString('package.provinceSearchLabel')}</FieldItem>
        {readOnly || !isEnabledVehicleUpdateWithinOrder ? (
          <FieldItem>{`: ${province[langName] || ''}`}</FieldItem>
        ) : (
          <FieldItem>
            <Colon>: &nbsp;</Colon>
            <Select
              value={vehicle.registeredProvince ?? ''}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isNaN(value)) {
                  handleProvinceChange(value);
                }
              }}
              displayEmpty
              disabled={readOnly}
              data-testid="vehicle-province-select"
              style={{ minWidth: 120 }}
            >
              <MenuItem value="" disabled>
                {getString('text.select')}
              </MenuItem>
              {provinceOptions.map((opt: { value: number; label: string }) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FieldItem>
        )}
      </FormField>
      <FormField>
        <FieldItem>{getString('leadDetailFields.redPlate')}</FieldItem>
        <Colon>:</Colon>
        <FieldItem>{renderRedplate()}</FieldItem>
      </FormField>
      <FormField>
        {({ setShowHighlight }) => (
          <>
            <FieldItem>{getString('text.licensePlate')}</FieldItem>
            <RenderInputLicensePlate
              licenseNo={vehicle?.isRedPlate ? '-' : vehicle?.carLicensePlate}
              name="carLicensePlate"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              setShowHighlight={setShowHighlight}
              registeredProvince={vehicle.registeredProvince}
              isEditable={!readOnly && !vehicle?.isRedPlate}
              disabled={readOnly || vehicle?.isRedPlate}
            />
          </>
        )}
      </FormField>
      <FormField>
        {({ setShowHighlight }) => (
          <>
            <FieldItem>{getString('text.chassisNumber')}</FieldItem>
            &nbsp; &nbsp;
            <RenderInputTextItem
              valueText={vehicle.chassisNumber}
              name="chassisNumber"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              setShowHighlight={setShowHighlight}
              isEditable={!readOnly}
            />
          </>
        )}
      </FormField>
      <FormField>
        {({ setShowHighlight }) => (
          <>
            <FieldItem>{getString('leadDetailFields.engineNumber')}</FieldItem>
            &nbsp; &nbsp;
            <RenderInputTextItem
              valueText={vehicle.engineNumber}
              name="engineNumber"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              setShowHighlight={setShowHighlight}
              isEditable={!readOnly}
            />
          </>
        )}
      </FormField>
      <FormField>
        {({ setShowHighlight }) => (
          <Box width="100%" display="flex" alignItems="center">
            <FieldItem>{getString('order.color')}</FieldItem>
            <RenderInputAutoComplete
              name="vehicleColor"
              allowMaxTags={3}
              value={vehicle?.vehicleColor}
              handleOnUpdate={onUpdateOrder}
              isEditable={!readOnly}
              setShowHighlight={setShowHighlight}
            />
          </Box>
        )}
      </FormField>
      <FormField>
        <Box display="flex" flexWrap="wrap" width="100%" style={{ gap: 16 }}>
          <Box
            display="flex"
            flex="1"
            alignItems="center"
            flexWrap="wrap"
            sx={{ minWidth: 260 }}
          >
            <FieldItem>
              {getString('leadDetailFields.drivingPurpose')}
            </FieldItem>
            {readOnlyDrivingPurpose ? (
              <FieldItem>
                {`: ${
                  normalizedCarUsageType
                    ? getString(`text.${normalizedCarUsageType}`)
                    : ''
                }`}
              </FieldItem>
            ) : (
              <FieldItem>
                <Colon>: &nbsp;</Colon>
                <Select
                  value={
                    normalizedCarUsageType === 'personal' ||
                    normalizedCarUsageType === 'commercial'
                      ? normalizedCarUsageType
                      : ''
                  }
                  onChange={(e) => {
                    const value = String(e.target.value);
                    if (value === 'personal' || value === 'commercial') {
                      onUpdateOrder({ name: 'carUsageType', value });
                    }
                  }}
                  displayEmpty
                  disabled={readOnlyDrivingPurpose}
                  data-testid="vehicle-driving-purpose-select"
                  style={{ minWidth: 140 }}
                >
                  <MenuItem value="" disabled>
                    {getString('text.select')}
                  </MenuItem>
                  <MenuItem value="personal">
                    {getString('text.personal')}
                  </MenuItem>
                  <MenuItem value="commercial">
                    {getString('text.commercial')}
                  </MenuItem>
                </Select>
              </FieldItem>
            )}
          </Box>
          {isEnabledVehicleUpdateWithinOrder && (
            <Box
              display="flex"
              flex="1"
              alignItems="center"
              flexWrap="wrap"
              sx={{ minWidth: 260 }}
            >
              <FieldItem>{getString('newPackageListing.oicCode')}</FieldItem>
              {readOnly ? (
                <FieldItem>{`: ${normalizedOicSelectValue || ''}`}</FieldItem>
              ) : (
                <FieldItem>
                  <Colon>: &nbsp;</Colon>
                  <Select
                    value={
                      oicCodeOptions.some(
                        (opt) => opt.value === normalizedOicSelectValue
                      )
                        ? normalizedOicSelectValue
                        : ''
                    }
                    onChange={(e) => {
                      const raw = String(e.target.value);
                      if (raw) {
                        onUpdateOrder({
                          name: 'oicCode',
                          value: formatOicCodeForOrder(raw),
                        });
                      }
                    }}
                    displayEmpty
                    disabled={readOnly}
                    data-testid="vehicle-oic-code-select"
                    style={{ minWidth: 100 }}
                  >
                    <MenuItem value="" disabled>
                      {getString('text.select')}
                    </MenuItem>
                    {oicCodeOptions.map((opt) => (
                      <MenuItem key={opt.id} value={opt.value}>
                        {opt.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FieldItem>
              )}
            </Box>
          )}
        </Box>
      </FormField>
      <FormField>
        <FieldItem>{getString('leadDetailFields.dashCam')}</FieldItem>
        <FieldItem>
          <Colon>: &nbsp;</Colon>
          {renderDashCam()}
        </FieldItem>
      </FormField>
      <FormField>
        <FieldItem>{getString('text.customVehicle')}</FieldItem>
        <FieldItem>
          <Colon>: &nbsp;</Colon>
          {renderCustomVehicle()}
        </FieldItem>
      </FormField>
      <FormField>
        <FieldItem>{getString('leadFilter.noFixedDriver')}</FieldItem>
        <FieldItem>
          <Colon>: &nbsp;</Colon>
          <Select
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value === 0 || value === 1 || value === 2) {
                handleNoOfFixedDriverChange(value);
              }
            }}
            value={numberOfFixedDriver}
            disabled={readOnly || !isAllowEditCarInfo}
          >
            {[0, 1, 2].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FieldItem>
      </FormField>
      {numberOfFixedDriver > 0 && (
        <>
          <FormField>
            <FieldItem>
              {getString('leadDetailFields.firstDriverName')}
            </FieldItem>
            <RenderInputTextItem
              valueText={`${order?.data?.firstDriverName ?? ''}`.trim()}
              name="firstDriverName"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              isEditable={false}
              showEditArrow={!readOnly && isAllowEditCarInfo}
              handleClickEditArrow={() => setShowFixedDriverModal(true)}
            />
          </FormField>
          <FormField>
            <FieldItem>
              {getString('leadDetailFields.firstDriverDOB')}
            </FieldItem>
            <RenderInputTextItem
              valueText={thaiDateFormat(order?.data?.firstDriverDOB ?? '')}
              name="firstDriverDOB"
              isEditable={false}
            />
          </FormField>
          <FormField>
            <FieldItem>{getString('qc.firstDriverIdNumber')}</FieldItem>
            <RenderInputTextItem
              name="firstDriverIdNumber"
              valueText={order?.data?.firstDriverIdNumber ?? ''}
              isEditable={false}
            />
          </FormField>
          <FormField>
            <FieldItem>{getString('qc.firstDriverLicense')}</FieldItem>
            <RenderInputTextItem
              name="firstDriverDrivingLicense"
              handleOnBlur={onUpdateOrder}
              handleOnEnter={onUpdateOrder}
              valueText={order?.data?.firstDriverDrivingLicense ?? ''}
              isEditable={false}
            />
          </FormField>
        </>
      )}
      {numberOfFixedDriver > 1 && (
        <>
          <FormField>
            <FieldItem>
              {getString('leadDetailFields.secondDriverName')}
            </FieldItem>
            <RenderInputTextItem
              valueText={`${order?.data?.secondDriverName ?? ''}`.trim()}
              name="secondDriverName"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              isEditable={false}
              showEditArrow={!readOnly && isAllowEditCarInfo}
              handleClickEditArrow={() => setShowFixedDriverModal(true)}
            />
          </FormField>
          <FormField>
            <>
              <FieldItem>
                {getString('leadDetailFields.secondDriverDOB')}
              </FieldItem>
              <RenderInputTextItem
                valueText={thaiDateFormat(order?.data?.secondDriverDOB ?? '')}
                name="secondDriverDOB"
                isEditable={false}
              />
            </>
          </FormField>
          <FormField>
            <FieldItem>{getString('qc.secondDriverIdNumber')}</FieldItem>
            <RenderInputTextItem
              name="secondDriverIdNumber"
              handleOnEnter={onUpdateOrder}
              handleOnBlur={onUpdateOrder}
              valueText={order?.data?.secondDriverIdNumber ?? ''}
              isEditable={false}
            />
          </FormField>
          <FormField>
            <FieldItem>{getString('qc.secondDriverLicense')}</FieldItem>
            <RenderInputTextItem
              name="secondDriverDrivingLicense"
              handleOnBlur={onUpdateOrder}
              handleOnEnter={onUpdateOrder}
              valueText={order?.data?.secondDriverDrivingLicense ?? ''}
              isEditable={false}
            />
          </FormField>
        </>
      )}
      {numberOfFixedDriver > 0 && (
        <FixedDriverModal
          isOrder
          driverCount={numberOfFixedDriver}
          openModal={showFixedDriverModal}
          handleCloseModal={() => setShowFixedDriverModal(false)}
          title={getString('leadDetailFields.fixedDriver')}
          leadData={{
            ...order,
            data: { ...order?.data, numberOfFixedDriver },
          }}
          isDisabled={false}
          onSuccess={refreshOrderData}
        />
      )}
      <Dialog
        open={showVehicleModelModal}
        title={`${getString('text.vehicle')} - ${getString('text.typeOfVehicle')}`}
        buttonText={getString('qc.update')}
        formId="update-data-myself"
        content={
          <VehicleModelForm
            data={vehicleModelData}
            setSubmitButtonToggle={setIsVehicleModelSubmitDisabled}
            handleModalToggle={handleVehicleModelModalToggle}
            handleLoading={setIsVehicleModelLoading}
            onSuccess={refreshOrderData}
          />
        }
        showButton
        handleToggle={handleVehicleModelModalToggle}
        buttonProps={{
          disabled: isVehicleModelSubmitDisabled,
        }}
        isLoading={isVehicleModelLoading}
        maxWidth="sm"
      />
    </Paper>
  );
}

const mapStateToProps = (state: any) => ({
  order: state.order.payload,
  isFetching: state.order.isFetching,
  province: state.provinceDetailReducer?.data || {},
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      getProvince,
      updateOrder,
      getDetail,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VehiclePolicySection);

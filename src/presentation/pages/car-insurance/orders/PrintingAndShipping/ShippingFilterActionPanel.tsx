/* eslint-disable arrow-body-style */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  createStyles,
  Divider,
  Grid,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import clsx from 'clsx';
import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';
import { getI18n } from 'react-i18next';
import { useFlags } from 'flagsmith/react';

import FeatureFlags from 'config/flagsmithConfig';
import { SearchOrderPayload } from 'data/slices/orderSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import ComboSearchField from 'presentation/components/common/ComboSearchField';
import Checkbox from 'presentation/components/common/controls/Checkbox';
import Controls from 'presentation/components/controls/Control';
import { optionsMapping } from 'presentation/components/modal/Qc/UpdateDataMyself/helper';
import { OptionProps } from 'presentation/components/modal/Qc/UpdateDataMyself/Input';
import { insuranceType } from 'presentation/components/QcDetailPage/hooks/usePackagesInfo';
import DownloadPolicyDocuments from 'presentation/components/Shipment/DownloadPolicyDocuments';
import GenerateTracking from 'presentation/components/Shipment/GenerateTracking';
import DigitalDelivery from 'presentation/components/Shipment/DigitalDelivery';
import {
  getFilterFormInitialValues,
  omitUninterestedFilterValues,
  useStyleClasses,
} from 'presentation/pages/car-insurance/orders/PrintingAndShipping/helper';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import { showSnackBar } from 'presentation/redux/actions/ui';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getNewShippingMethodsOptions } from 'shared/constants/deliveryOptions';
import { paymentStatusOptions } from 'shared/constants/ordersAllSearchFields';
import { ItemApprovalStatus } from 'shared/constants/orderType';
import 'presentation/components/controls/DateRangeWithType.scss';

type CollapseButtonProps = WithStyles<typeof CollapseButtonStyles> &
  React.HTMLAttributes<HTMLButtonElement>;

const CollapseButtonStyles = createStyles({
  root: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
    visibility: 'visible',
    outline: 'none',
  },
});

const CollapseButton = withStyles(CollapseButtonStyles)(
  ({ children, classes, ...rest }: CollapseButtonProps) => (
    <button className={classes.root} type="button" {...rest}>
      {children}
    </button>
  )
);

const AccordionSummary = withStyles((theme) => ({
  focusVisible: {
    '&.MuiButtonBase-root.MuiAccordionSummary-root': {
      background: theme.palette.common.white,
    },
  },
}))(MuiAccordionSummary);

const textFieldProps = {
  placeholder: getString('text.select'),
};

const policyDocumentFilterOptions = [
  {
    title: getString('order.shipping.policyDocsUploaded'),
    value: `items[].approvalStatus="${ItemApprovalStatus.POLICY_UPLOADED}"`,
  },
  {
    title: getString('order.shipping.policyDocsNotUploaded'),
    value: `items[].approvalStatus!="${ItemApprovalStatus.POLICY_UPLOADED}"`,
  },
];

const insuranceTypeFilterOptions = Object.entries(insuranceType).map(
  ([value, title]) => ({ title: title as string, value })
);

const searchByFilterOptions = [
  {
    option: getString('searchFieldPrintingAndShippingOption.orderId'),
    value: 'order.humanId',
  },
  {
    option: getString('searchFieldPrintingAndShippingOption.policyHolderName'),
    value: 'order.data.policyHolder.fullName',
  },
  {
    option: getString('searchFieldPrintingAndShippingOption.customerName'),
    value: 'customer.fullName',
  },
  {
    option: getString('searchFieldPrintingAndShippingOption.customerPhone'),
    value: 'customerPhones[].phone',
  },
  {
    option: getString('searchFieldPrintingAndShippingOption.customerEmail'),
    value: 'customerEmails[].email',
  },
  {
    option: getString('searchFieldPrintingAndShippingOption.licensePlate'),
    value: 'order.data.carLicensePlate.text',
  },
  {
    option: getString('text.chassisNumber'),
    value: 'order.data.chassisNumber',
  },
  {
    option: getString('tableListing.trackingNumber'),
    value: 'latestShipments[].shipment.trackingNumber',
  },
  {
    option: getString('searchFieldOrderOption.applicationNumber'),
    value: 'items[].applicationNumber',
  },
];

const shipmentFilterOptions = [
  {
    title: getString('shipmentStatus.shippedOut'),
    value: 'attributes.hasShipments=true',
  },
  {
    title: getString('shipmentStatus.notShipped'),
    value: 'attributes.hasShipments=false',
  },
];

type ShippingFilterPanelProps = {
  handleSortAndSearch?: (
    values: Record<string, any>,
    newPageState?: { currentPage: number; pageSize?: number }
  ) => void;
  handleReset?: () => void;
  orders?: Record<string, any>[];
  originalArgs?: SearchOrderPayload;
  cancelledOrders?: boolean;
  onCancelledOrders?: () => void;
};

export default function ShippingFilterPanel({
  handleSortAndSearch,
  handleReset,
  orders,
  originalArgs,
  cancelledOrders,
  onCancelledOrders = () => undefined,
}: ShippingFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const flags = useFlags([
    FeatureFlags.BROK_3788_ENABLE_DIGITAL_DELIVERY_SHIPMENT_ON_POLICY_APPROVAL_20250115_TEMP,
  ]);

  const isDigitalDeliveryEnabled =
    flags[
      FeatureFlags
        .BROK_3788_ENABLE_DIGITAL_DELIVERY_SHIPMENT_ON_POLICY_APPROVAL_20250115_TEMP
    ]?.enabled ?? false;

  const dispatch = useAppDispatch();
  const classes = useStyleClasses();
  const insurerName =
    getI18n()?.language === 'en' ? 'displayName' : 'displayNameTh';
  const insurers = useAppSelector(
    (state) =>
      optionsMapping(
        state.ordersReducer?.insurersAllReducer.data,
        insurerName,
        'name'
      ) || []
  );

  useEffect(() => {
    dispatch(getInsurersAll({ pageSize: 1000 }));
  }, [dispatch]);

  const formik = useFormik({
    onSubmit: (values) => {
      const payload = omitUninterestedFilterValues(values);
      if (handleSortAndSearch) handleSortAndSearch(payload, { currentPage: 1 });
    },
    initialValues: getFilterFormInitialValues(),
  });

  function handleInputChange(field: string) {
    // eslint-disable-next-line func-names
    return function (_e: React.ChangeEvent<any>, payload: any) {
      formik.setFieldValue(field, payload);
    };
  }

  const handleComboSearchFieldUpdate = useCallback(
    (payload: { searchTerm: string; searchBy: string }) => {
      formik.setFieldValue('searchBy', payload);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFormSearch = useCallback(() => {
    formik.submitForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormReset = useCallback(() => {
    formik.resetForm({ values: getFilterFormInitialValues() });
    if (handleSortAndSearch)
      handleSortAndSearch(
        omitUninterestedFilterValues(getFilterFormInitialValues())
      );
    if (handleReset) handleReset();
  }, [formik, handleReset, handleSortAndSearch]);

  const getOptionSelected = useCallback(
    (option: OptionProps, value: OptionProps) => {
      return option.value === value?.value;
    },
    []
  );

  const handleError = useCallback(
    (msg: string) => {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: msg,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    },
    [dispatch]
  );

  const handleCancelledChanges = useCallback(() => {
    if (onCancelledOrders) {
      onCancelledOrders();
      formik.handleSubmit();
    }
  }, [formik, onCancelledOrders]);

  return (
    <Accordion
      data-testid="shipping-action-filter-panel"
      expanded={expanded}
      className="py-5"
    >
      <AccordionSummary className="px-10">
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid container item xs={8} spacing={5}>
            <Grid className={classes.root} item xs={4}>
              <span className="text-[14px] inline-block mb-2">
                {getString('tableListing.insuranceCompany')}
              </span>
              <Autocomplete
                value={formik.values.insuranceCompany}
                onChange={handleInputChange('insuranceCompany')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                optionTextKey="title"
                options={insurers}
              />
            </Grid>
            <Grid className={classes.root} item xs={4}>
              <span className="text-[14px] inline-block mb-2">
                {getString('order.shipping.policyDocumentsStatus')}
              </span>
              <Autocomplete
                value={formik.values.policyDocument}
                onChange={handleInputChange('policyDocument')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                optionTextKey="title"
                options={policyDocumentFilterOptions}
              />
            </Grid>
            <Grid className={classes.root} item xs={4}>
              <span className="text-[14px] inline-block mb-2">
                {getString('order.shipping.preferredDeliveryOption')}
              </span>
              <Autocomplete
                value={formik.values.preferredDeliveryOption}
                onChange={handleInputChange('preferredDeliveryOption')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                options={getNewShippingMethodsOptions()}
                optionTextKey="title"
              />
            </Grid>
          </Grid>
          <Grid container item xs={4}>
            <div className="ml-auto">
              <Checkbox
                name={getString('text.showCancelled')}
                handleUpdate={handleCancelledChanges}
                checked={cancelledOrders}
                dataTestId="show-cancelled-orders"
              />
              <CommonButton
                disabled={!formik.dirty}
                onClick={handleFormReset}
                className="mr-2"
                color="default"
              >
                {getString('text.reset')}
              </CommonButton>
              <CommonButton
                disabled={!formik.dirty}
                data-testid="shipment-search-btn"
                onClick={handleFormSearch}
                variant="contained"
                color="default"
              >
                {getString('text.search')}
              </CommonButton>
            </div>
          </Grid>
          <Grid item container xs={12}>
            <Grid item container>
              <div className="my-4">
                <DownloadPolicyDocuments />
                <GenerateTracking
                  handleError={handleError}
                  orders={orders}
                  originalArgs={originalArgs}
                />
                {isDigitalDeliveryEnabled && (
                  <DigitalDelivery
                    handleError={handleError}
                    orders={orders}
                    originalArgs={originalArgs}
                  />
                )}
              </div>
            </Grid>
            <Divider
              variant="fullWidth"
              className="bg-primary my-4 w-[100%] h-[2px]"
            />
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className="px-10">
        <Grid container direction="column" alignItems="flex-start">
          <Grid item container spacing={2}>
            <Grid className={classes.root} item md={8} xs={12}>
              <span className="text-[14px] inline-block mb-2">
                {getString('text.searchBy')}
              </span>
              <ComboSearchField
                value={formik.values.searchBy}
                options={searchByFilterOptions}
                handleDataUpdate={handleComboSearchFieldUpdate}
              />
            </Grid>
            <Grid className={classes.root} item md={4} xs={12}>
              <span className="inline-block mb-2 text-sm">
                {getString('text.paymentStatus')}
              </span>
              <Autocomplete
                value={formik.values.paymentStatus}
                fullWidth
                onChange={handleInputChange('paymentStatus')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                optionTextKey="title"
                options={paymentStatusOptions as unknown as OptionProps[]}
              />
            </Grid>
          </Grid>
          <Grid item container className="w-full mt-5" spacing={2}>
            <Grid className={classes.root} item md={4} xs={12}>
              <span className="text-[14px] inline-block mb-2">
                {getString('text.printingAndShippingStatus')}
              </span>
              <Autocomplete
                value={formik.values.shipmentStatus}
                onChange={handleInputChange('shipmentStatus')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                optionTextKey="title"
                options={shipmentFilterOptions}
              />
            </Grid>

            <Grid className={classes.root} item md={4} xs={12}>
              <span className="text-[14px] inline-block mb-2">
                {getString('tableListing.insuranceType')}
              </span>
              <Autocomplete
                value={formik.values.insuranceType}
                onChange={handleInputChange('insuranceType')}
                textFieldProps={{ ...textFieldProps }}
                getOptionSelected={getOptionSelected}
                optionTextKey="title"
                options={insuranceTypeFilterOptions}
              />
            </Grid>
            <Grid className={classes.root} item md={4} xs={12}>
              <span className="text-[14px] inline-block mb-2">
                {getString('order.shipping.insuranceApprovedOn')}
              </span>
              <div
                className={clsx(
                  'shared-date-range-picker',
                  classes.formControl,
                  classes.hideLabel,
                  classes.normalizeBorderRadius
                )}
              >
                <Controls.DateRange
                  className="calendar-date-range"
                  name="dateRange"
                  fixedLabel
                  value={formik.values.insuranceApprovedOn}
                  onChange={({ target: { value } }: any) => {
                    formik.setFieldValue('insuranceApprovedOn', value);
                  }}
                  handleOnclickDateRange={() => null} // add this otherwise got type error. sigh!
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
      <CollapseButton
        data-testid="collapse-button"
        onClick={() => setExpanded((expand) => !expand)}
      >
        {expanded ? (
          <KeyboardArrowUp data-testid="up-icon" color="primary" />
        ) : (
          <KeyboardArrowDown data-testid="down-icon" color="primary" />
        )}
      </CollapseButton>
    </Accordion>
  );
}

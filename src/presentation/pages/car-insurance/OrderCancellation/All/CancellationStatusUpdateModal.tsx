import React, { useEffect } from 'react';
import { getString } from 'presentation/theme/localization';
import { CommonSelectOption as BaseCommonSelectOption } from 'shared/types/lead';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer';
import DetailViewNumberInput from 'presentation/components/common/FormikFields/DetailViewNumberInput';
import { Checkbox, MenuItem, Select, TextField } from '@material-ui/core';
import { Button } from '@alphafounders/ui';
import Datepicker from 'presentation/components/common/Datepicker';
import NumberInput from 'presentation/components/controls/NumberInput';
import UploadComponent from 'presentation/components/common/UploadComponent';
import {
  handleChange,
  handleDateChange,
  checkDisableInsurerAmount,
  feesStructures,
} from './helper';
import useCancellationPaymentDetails from './useCancellationPaymentDetails';

type CommonSelectOption = BaseCommonSelectOption & {
  isReadOnly?: boolean;
  showStar?: boolean;
};

export default function CancellationStatusUpdateModal({
  fields,
  currentTab,
  setStatusData,
  updateStatus,
  setIsOpen,
  statusData,
  buttonText,
  extraButton,
  orderItemId,
  isSuccess = false,
  isError = false,
  error,
  setOpenClosePopup,
  checkDisabledUpdateBtn,
  setFixedData,
  isRefundCalculationMethodRequired = false,
}: Readonly<{
  fields: CommonSelectOption[];
  currentTab: string | number;
  setStatusData: (data: any) => void;
  updateStatus: () => void;
  setIsOpen: (isOpen: boolean) => void;
  statusData: Record<string, any>;
  orderItemId?: string;
  buttonText?: string;
  extraButton?: React.ReactNode;
  isSuccess?: boolean;
  isError?: boolean;
  error?: any;
  setOpenClosePopup: (open: boolean) => void;
  checkDisabledUpdateBtn?: () => boolean;
  setFixedData: (data: any) => void;
  isRefundCalculationMethodRequired?: boolean;
}>) {
  const {
    usedCreditShell,
    availableCreditShell,
    paidCharges,
    totalCancellationFee,
    processingFee,
    discountProRate,
    accountingData,
    voucherValue,
  } = useCancellationPaymentDetails(
    statusData?.leadHumanId,
    orderItemId ?? '',
    false,
    isSuccess,
    isError,
    error,
    setOpenClosePopup
  );

  useEffect(() => {
    if (currentTab === 'tabv2') {
      setStatusData((prevState: any) => ({
        ...prevState,
        usedCreditShell,
        availableCreditShell,
        totalCancellationFee,
        processingFee: processingFee ?? '0',
        discountProRate: discountProRate ?? '0',
        cancellationFee: totalCancellationFee ?? '0',
        processingFeeChecked: !accountingData?.waiveProcessingFee,
        cancellationFeeChecked: !accountingData?.waiveCancellationFee,
        discountProRateChecked: !accountingData?.waiveDiscountFee,
        voucherChecked: !accountingData?.waiveVoucherFee,
        voucherValue: accountingData?.voucherValue,
      }));
    }
  }, [
    currentTab,
    setStatusData,
    usedCreditShell,
    availableCreditShell,
    totalCancellationFee,
    processingFee,
    discountProRate,
    accountingData,
  ]);

  const isDisabledButtonAndInsurerAmount = checkDisableInsurerAmount(
    availableCreditShell,
    usedCreditShell,
    paidCharges?.length ?? 0
  );

  const showInput = (
    type: string,
    value: string,
    label: string,
    options: any,
    placeholder?: string,
    tab?: string,
    isReadOnly?: boolean
  ) => {
    const statusField = label.split('.').pop();
    const statusValue = statusData[statusField ?? ''];

    switch (type) {
      case 'date':
        return (
          <div className="my-2">
            <Datepicker
              textFieldProps={{
                name: label,
                dataTestId: label,
                placeholder: 'dd/mm/yyyy',
              }}
              minDate={
                new Date(new Date().setFullYear(new Date().getFullYear() - 20))
              }
              maxDate={
                new Date(new Date().setFullYear(new Date().getFullYear() + 20))
              }
              dateFormat="dd/MM/yyyy"
              onChange={(date: any) =>
                handleDateChange(date, label, setStatusData, setFixedData)
              }
              {...(statusField === 'policyEndDate' && statusValue
                ? { dateValue: new Date(statusValue) }
                : {})}
            />
          </div>
        );
      case 'number':
        return (
          <div className="my-2">
            <NumberInput
              containerClass="border-solid w-[97%] h-6 pt-1.5 pb-2 pl-2 border-gray-200 rounded-md border"
              disabled={isReadOnly}
              placeholder={placeholder}
              name={label}
              thousandSeparator={false}
              value={statusValue ?? ''}
              onValueChange={(e) =>
                handleChange(e, label, setStatusData, setFixedData)
              }
            />
          </div>
        );
      case 'dropdown':
        return (
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            {...(statusValue !== ''
              ? {
                  value: statusValue,
                }
              : {})}
            onChange={(e) =>
              handleChange(e, label, setStatusData, setFixedData)
            }
            className="w-full my-2"
            label="Select"
          >
            {options.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox
            name={label}
            onChange={(v) =>
              handleChange(v, label, setStatusData, setFixedData)
            }
            // checked
            // checked={selectedPolicies?.includes(i)}
            // isDisabled={i.isCancelled}
          />
        );
      case 'radio':
        return (
          <div className="flex flex-row">
            {options.map((option: any) => (
              <div key={option.value} className="flex items-center mr-4">
                <input
                  type="radio"
                  value={option.value}
                  name={label}
                  onChange={(e) =>
                    handleChange(e, label, setStatusData, setFixedData)
                  }
                  {...(statusField === 'customerReceivePolicy' &&
                  [true, false].includes(statusValue)
                    ? { checked: statusValue === option.value }
                    : {})}
                />
                <label htmlFor={label} className="ml-2">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <TextField
            className="w-full my-3"
            disabled={isReadOnly}
            name={label}
            value={statusValue ?? ''}
            onChange={(e) =>
              handleChange(e, label, setStatusData, setFixedData)
            }
            placeholder={placeholder}
            InputProps={{
              inputComponent: 'input',
              disableUnderline: true,
            }}
          />
        );
      default:
        return (
          <TextField
            // disabled={isReadOnly || }
            name={label}
            value={statusField === 'bankAccountNumber' ? statusValue : ''}
            onChange={(e) =>
              handleChange(e, label, setStatusData, setFixedData)
            }
            InputProps={{
              inputComponent: 'input',
              disableUnderline: true,
            }}
          />
        );
    }
  };

  return (
    <div className="mt-4 h-auto flex flex-col w-[480px]">
      <div className="w-full flex flex-wrap text-left">
        {fields.map(
          ({
            label,
            value,
            type,
            options,
            placeholder,
            tab,
            isReadOnly,
            showStar,
          }) =>
            tab && tab === currentTab ? (
              <InputContainer
                key={label}
                title={getString(label)}
                showAsterisk={showStar}
              >
                {showInput(
                  type as string,
                  value,
                  label,
                  options,
                  placeholder,
                  tab,
                  label === 'cancellation.popup.refundAmountFromInsurer'
                    ? isDisabledButtonAndInsurerAmount
                    : isReadOnly
                )}
              </InputContainer>
            ) : null
        )}
        {currentTab === 'tabv2' &&
          isRefundCalculationMethodRequired &&
          feesStructures(
            processingFee,
            totalCancellationFee,
            discountProRate,
            voucherValue
          ).map((field) => (
            <div key={field.name} className="w-full pt-2">
              <div className="-mb-8">
                <Checkbox
                  checked={statusData[field.checkedName] ?? false}
                  onChange={(e) => {
                    setStatusData((prevState: any) => ({
                      ...prevState,
                      [field.checkedName]: e.target.checked,
                    }));
                    setFixedData((prevState: any) => ({
                      ...prevState,
                      [field.touchedField]: true,
                    }));
                  }}
                  color="primary"
                  size="small"
                  className="p-1"
                />
              </div>
              <DetailViewNumberInput
                name={field.name}
                title={` \u00A0 \u00A0 ${getString(field.titleKey)}`}
                value={field.value}
                isReadOnly
                thousandSeparator
                isDisabled={!(statusData[field.checkedName] ?? false)}
                handleUpdate={() => {}}
                showAsterisk={false}
              />
            </div>
          ))}
        {currentTab === 'pending-confirmation-on-customer' && (
          <>
            <div className="w-full">
              <UploadComponent
                slip={statusData?.slip}
                setSlip={(file: any) =>
                  setStatusData((prevState: any) => ({
                    ...prevState,
                    slip: file,
                  }))
                }
                title={getString('cancellation.popup.bankAccount')}
              />
            </div>
            <div className="w-full">
              <UploadComponent
                slip={statusData?.documentId}
                setSlip={(file: any) =>
                  setStatusData((prevState: any) => ({
                    ...prevState,
                    documentId: file,
                  }))
                }
                title={getString('cancellation.popup.idCard')}
              />
            </div>
          </>
        )}
      </div>
      <div className="w-full flex mt-4 justify-center">
        {extraButton}
        <Button
          variant="primary"
          className="uppercase h-10 px-6 mr-2 font-sans"
          dataTestId="approve-btn"
          text={buttonText ?? getString('text.update')}
          onClick={() => updateStatus()}
          disabled={
            currentTab === 'tabv2'
              ? isDisabledButtonAndInsurerAmount
              : checkDisabledUpdateBtn?.()
          }
        />
        <Button
          variant="secondary"
          className="uppercase h-9 px-6 font-sans"
          dataTestId="close-btn"
          text={getString('text.cancel')}
          onClick={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

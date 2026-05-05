import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _truncate from 'lodash/truncate';
import _zip from 'lodash/zip';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getI18n } from 'react-i18next';

import { useGetAddressDataQuery } from 'data/slices/addressSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import Checkbox from 'presentation/components/common/controls/Checkbox';
import Dialog from 'presentation/components/common/Dialog';
import { QcQuestion } from 'presentation/components/common/QcInputContainer/QcInputContainer';
import RadioFieldGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import { vehicleColorOptions } from 'presentation/components/VehiclePolicySection/helper';
import {
  questionFields,
  Questions,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';
import { OICCollection } from 'shared/constants/packageStaticData';

import AddressForm from './AddressForm/AddressForm';
import CommonForm from './CommonForm';
import VehicleModelForm from './VehicleModelForm';
import {
  documentType,
  optionsMapping,
  policyholderOptions,
  titleOptionsFull,
} from './helper';
import useDeliveryOptions from './hooks/useDeliveryOptions';
import LicensePlateForm from './LicensePlateForm';
import { AddressProps } from './type';
import WithPreviewForm from './WithPreviewForm/WithPreviewForm';

import { useEditFormOptions } from '../SalesNeedsToFix/SalesNeedsToFix';

interface UpdateDataMyselfProps {
  order: OrderDataResponse | undefined;
  question: QcQuestion;
  modalToggle: boolean;
  handleOptionSwitch: (payload: string) => void;
  handleModalToggle: () => void;
  selectedDocument?: IUploadedDocument;
}

type AddressQuestions =
  | Questions.POLICYHOLDER_ADDRESS
  | Questions.BILLING_ADDRESS
  | Questions.SHIPPING_ADDRESS;

type AddressFormProps = Omit<
  AddressProps,
  | 'disabled'
  | 'fields'
  | 'handleModalToggle'
  | 'question'
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'setSubmitButtonToggle'
>;

const language = getI18n()?.language || 'en';

const addressMapping: Record<AddressQuestions, string[]> = {
  [Questions.POLICYHOLDER_ADDRESS]: [
    'policyHolderAddress.addressLine',
    `policyHolderAddress.${language === 'en' ? 'province' : 'provinceTh'}`,
    'order.data.policyHolder.policyAddress.province',
    `policyHolderAddress.${language === 'en' ? 'district' : 'districtTh'}`,
    'order.data.policyHolder.policyAddress.district',
    `policyHolderAddress.${
      language === 'en' ? 'subDistrict' : 'subDistrictTh'
    }`,
    'order.data.policyHolder.policyAddress.subDistrict',
    'policyHolderAddress.zipcode',
    'order.data.policyHolder.policyAddress.fullName',
    'order.data.policyHolder.policyAddress.addressType',
  ],
  [Questions.SHIPPING_ADDRESS]: [
    'shippingAddress.addressLine',
    `shippingAddress.${language === 'en' ? 'province' : 'provinceTh'}`,
    'order.data.policyHolder.shippingAddress.province',
    `shippingAddress.${language === 'en' ? 'district' : 'districtTh'}`,
    'order.data.policyHolder.shippingAddress.district',
    `shippingAddress.${language === 'en' ? 'subDistrict' : 'subDistrictTh'}`,
    'order.data.policyHolder.shippingAddress.subDistrict',
    'shippingAddress.zipcode',
    'order.data.policyHolder.shippingAddress.fullName',
    'order.data.policyHolder.shippingAddress.addressType',
    'customer.customer.firstName',
    'customer.customer.lastName',
  ],
  [Questions.BILLING_ADDRESS]: [
    'billingAddress.addressLine',
    `billingAddress.${language === 'en' ? 'province' : 'provinceTh'}`,
    'order.data.policyHolder.billingAddress.province',
    `billingAddress.${language === 'en' ? 'district' : 'districtTh'}`,
    'order.data.policyHolder.billingAddress.district',
    `billingAddress.${language === 'en' ? 'subDistrict' : 'subDistrictTh'}`,
    'order.data.policyHolder.billingAddress.subDistrict',
    'billingAddress.zipcode',
    'order.data.policyHolder.billingAddress.fullName',
    'order.data.policyHolder.billingAddress.addressType',
    'customer.customer.firstName',
    'customer.customer.lastName',
  ],
};

const addressParts = [
  'addressLine',
  'province',
  'provinceCode',
  'district',
  'districtCode',
  'subDistrict',
  'subDistrictCode',
  'postalCode',
  'fullName',
  'addressType',
  'firstName',
  'lastName',
];

function isAddressRelatedQuestion(
  question: string
): question is AddressQuestions {
  return (
    question === Questions.POLICYHOLDER_ADDRESS ||
    question === Questions.SHIPPING_ADDRESS ||
    question === Questions.BILLING_ADDRESS
  );
}

function getAddressProps(
  data: OrderDataResponse | undefined,
  isSameAddress: boolean | undefined,
  qId: string
) {
  const policyAddress = _zip(
    addressParts,
    addressMapping[Questions.POLICYHOLDER_ADDRESS]
  ).reduce(
    (restAddresses, [part, path]: any) => ({
      ...restAddresses,
      [part]: _get(data, path),
    }),
    {}
  );

  // is address policy address or is address(shipping/billing) same as policy address?
  if (qId === Questions.POLICYHOLDER_ADDRESS || isSameAddress) {
    return policyAddress as AddressFormProps;
  }

  /*
   * otherwise
   */

  // billing or shipping address
  let chooseAddress =
    _zip(addressParts, addressMapping[qId as AddressQuestions]).reduce(
      (restAddresses, [part, path]: any) => ({
        ...restAddresses,
        [part]: _get(data, path),
      }),
      {}
    ) || {};

  // filter out empty value
  chooseAddress = Object.fromEntries(
    Object.entries(chooseAddress).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );

  // overwrite the policy address with the address we choose.
  return { ...policyAddress, ...chooseAddress } as AddressFormProps;
}

export default function UpdateDataMyself({
  order: data,
  question,
  modalToggle,
  handleOptionSwitch,
  handleModalToggle,
  selectedDocument,
}: Readonly<UpdateDataMyselfProps>) {
  const [selectedOption, setSelectedOption] = useState('update');
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [sameAsPolicyAddress, setSameAsPolicyAddress] = useState(false);

  const { data: provinces, isFetching: isProvincesFetching } =
    useGetAddressDataQuery({
      pathParam: 'provinces',
      fieldName: 'provinces',
    });

  const preferredDeliveryOptions = useDeliveryOptions();
  const editFormOptions = useEditFormOptions();

  const getQuestion: any =
    questionFields.find(({ qId }) => qId === question.qId) ?? {};
  let { fields } = getQuestion || [];

  const isCompany = data?.order?.data?.policyHolder.isCompany ?? false;
  if (question.qId === Questions.POLICYHOLDER_NAME_TITLE && isCompany) {
    fields = getQuestion?.fieldsCompany;
  }

  const optionsMap = useMemo(() => {
    const mapping: Record<string, any[]> = {};
    mapping.title = titleOptionsFull(data?.order?.product);
    mapping.documentType = documentType;
    mapping.policyHolderDifferentitation = policyholderOptions;
    mapping.vehicleColor = vehicleColorOptions?.map((option) =>
      _omit(option, ['id'])
    );
    mapping.carUsageType = [
      {
        label: getString('text.personal'),
        value: 'personal',
      },
      {
        label: getString('text.commercial'),
        value: 'commercial',
      },
    ];
    mapping.deliveryOption = preferredDeliveryOptions?.deliveryOptions;
    mapping.docsShipmentMethod = preferredDeliveryOptions?.docsShipmentMethod;
    if (!isProvincesFetching)
      mapping.registeredProvince = optionsMapping(
        provinces,
        'nameEn',
        'name'
      )?.map((province) => ({
        ...province,
        value: province.value.replace('provinces/', ''),
      }));
    mapping.oicCode = OICCollection(true);
    return mapping;
  }, [provinces, isProvincesFetching, preferredDeliveryOptions]);

  useEffect(() => {
    if (question.qId === Questions.POLICYHOLDER_ADDRESS) {
      setSameAsPolicyAddress(false);
      return;
    }
    const isShippingAddress = _get(
      data,
      'order.data.policyHolder.policyAddress.isShippingAddress'
    ); // shipping address same as policy holder address

    const isBillingAddress = _get(
      data,
      'order.data.policyHolder.policyAddress.isBillingAddress'
    ); // billing address same as policy holder address

    if (question.qId === Questions.SHIPPING_ADDRESS) {
      setSameAsPolicyAddress(isShippingAddress ?? false);
      return;
    }
    setSameAsPolicyAddress(isBillingAddress ?? false);
  }, [data, question.qId]);

  useEffect(() => {
    if (
      isAddressRelatedQuestion(question.qId) ||
      question.qId === Questions.VEHICLE_LICENSE
    ) {
      setIsBtnDisabled(false);
    }
  }, [question.qId]);

  const handleUpdateOption = (_e: any, val: any) => {
    if (val === 'salesFix') {
      handleModalToggle();
      handleOptionSwitch(val);
      return;
    }
    setSelectedOption(val);
  };

  const handleButtonDisable = useCallback((disable: boolean) => {
    setIsBtnDisabled(disable);
  }, []);

  /**
   *  NOTE: Need optimistic UI update after qc form submitted updated
   */

  let popupTitle = `${getString(question.group as string)} - ${getString(
    question.label as string
  )}`;

  popupTitle =
    popupTitle.length > 60 ? _truncate(popupTitle, { length: 40 }) : popupTitle;

  if (question?.groupId === 'driver') popupTitle = getString('qc.updateData');

  let EditForm: React.ReactElement;

  if (question.qId === Questions.VEHICLE_LICENSE) {
    EditForm = (
      <LicensePlateForm
        orderData={data}
        handleModalToggle={handleModalToggle}
        handleButtonDisable={handleButtonDisable}
      />
    );
    if (selectedDocument) {
      EditForm = WithPreviewForm({
        EditForm,
        selectedDocument,
        editFormClass: 'basis-1/2',
      });
    }
  } else if (question.qId === Questions.VEHICLE_MODEL) {
    EditForm = (
      <VehicleModelForm
        data={data}
        setSubmitButtonToggle={setIsBtnDisabled}
        handleModalToggle={handleModalToggle}
        handleLoading={(loadingState: boolean) => setLoading(loadingState)}
      />
    );
    if (selectedDocument) {
      EditForm = WithPreviewForm({
        EditForm,
        selectedDocument,
        editFormClass: 'basis-[40%] min-w-[340px]',
        previewClass: 'basis-[60%]',
      });
    }
  } else if (isAddressRelatedQuestion(question.qId)) {
    const addressFormProps = getAddressProps(
      data,
      sameAsPolicyAddress,
      question.qId
    );

    const showAddressToggle =
      question.qId === Questions.BILLING_ADDRESS ||
      question.qId === Questions.SHIPPING_ADDRESS;

    EditForm = (
      <>
        {showAddressToggle && (
          <Box marginBottom="30px">
            <Checkbox
              name={getString('qc.usePolicyAddress')}
              handleUpdate={setSameAsPolicyAddress}
              checked={sameAsPolicyAddress}
            />
          </Box>
        )}
        <AddressForm
          {...addressFormProps}
          orderProduct={data?.order?.product}
          disabled={sameAsPolicyAddress ?? false}
          fields={fields}
          question={question.qId}
          handleModalToggle={handleModalToggle}
          setSubmitButtonToggle={setIsBtnDisabled}
        />
      </>
    );
  } else {
    EditForm = (
      <CommonForm
        data={data}
        optionsMap={optionsMap}
        fields={fields as any[]}
        policyId={question.name}
        setSubmitButtonToggle={setIsBtnDisabled}
        handleModalToggle={handleModalToggle}
        handleLoading={(loadingState: boolean) => setLoading(loadingState)}
      />
    );
    if (selectedDocument) {
      EditForm = WithPreviewForm({ EditForm, selectedDocument });
    }
  }

  const DialogContent = (
    <Grid container>
      {question.isEditable ? (
        <Grid item xs={12}>
          <RadioFieldGroup
            row
            className="gap-0"
            name="options"
            value={selectedOption}
            onChange={handleUpdateOption}
            options={editFormOptions}
          />
        </Grid>
      ) : null}
      <Grid item xs={12} className="mt-5">
        {EditForm}
      </Grid>
    </Grid>
  );

  let dialogMaxWidth: 'xs' | 'sm' | 'md' | 'lg' = 'xs';

  if (selectedDocument && question.qId === Questions.VEHICLE_MODEL) {
    dialogMaxWidth = 'lg';
  } else if (selectedDocument) {
    dialogMaxWidth = 'md';
  } else if (question.qId === Questions.VEHICLE_MODEL) {
    dialogMaxWidth = 'sm';
  }

  return (
    <Dialog
      open={modalToggle}
      title={popupTitle}
      buttonText={getString('qc.update')}
      formId="update-data-myself"
      content={DialogContent}
      showButton
      handleToggle={handleModalToggle}
      buttonProps={{
        disabled: isBtnDisabled,
      }}
      isLoading={isLoading}
      maxWidth={dialogMaxWidth}
    />
  );
}

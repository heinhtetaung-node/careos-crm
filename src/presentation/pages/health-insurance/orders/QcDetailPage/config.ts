import _filter from 'lodash/filter';

export enum Questions {
  RECORD_CONVERSATION_PERMISSION = 'permissionToRecordConversation',
  NO_RUDENESS = 'noUseRudenessOrSarcasm',
  HAS_CUSTOMER_EMAIL = 'haveCustomerEmail',
  HAS_CUSTOMER_LINE = 'haveCustomerLine',
  POLICYHOLDER_DIFFERENTIATION = 'policyHolderDifferentitation',
  POLICYHOLDER_NAME_TITLE = 'policyHolderNameWithTitle',
  CLAIM_CONDITIONS = 'claimConditionsExplanation',
  CASH_INSTALLMENT_CONTRACT_CORRECT = 'cashInstallmentContractCorrect',
  POLICYHOLDER_ADDRESS = 'addressPolicyHolder',
  SHIPPING_ADDRESS = 'addressShipping',
  BILLING_ADDRESS = 'addressBilling',
  COMPANY_AGENT_INTRO = 'introductionCompanyAndAgent',
  NOTIFY_BROKER_LICENSE = 'informBrokerLicense',
  NOTIFY_RECORD_CONVERSATION = 'informConversationRecording',
  GOODBYE = 'endingSalutation',
  ASKED_AVAILIBITY = 'endingAskForAvailability',
  GOOD_QUALITY_DOCS = 'documentGoodQuality',
  POLICYSTARTDATE = 'policyStartDate',
  PREMIUM = 'premium',
  COVERAGE_VOLUNTARY_PACKAGE = 'packageType',
  COVERAGE_VOLUNTARY_SUM_INSURED = 'sumInsured',
  COVERAGE = 'coverageDetailCorrect',
  PREMIUM_DISCOUNTS = 'premiumRabbitCareDiscounts',
  PREMIUM_INVOICE = 'premiumTotalInvoice',
  PREMIUM_PAYMENT_DOCUMENTS = 'paymentHasDocuments',
  PREFERRED_DELIVERY = 'deliveryOptionPreferred',
  EXPLAINED_DELIVERY_CONDITION = 'deliveryConditionsExplained',
  PROBLEM_WITH_INSTALLMENT = 'installmentSuccessful',
  DOB_OF_THE_POLICYHOLDER = 'correctPolicyHolderDOB',
  ADD_ONS_ROADSIDE_ASSISTANCE = 'addonsRoadsideAssistance',
  ADD_ONS_ASSET = 'addonsAsset',
  ADD_ONS_CAR_REPLACEMENT = 'addonsCarReplacement',
  DOCUMENT_TYPE_SPECIFIED = 'documentTypeSpecified',
  CORRECT_ID_NUMBER = 'correctIdNumber',
}

export const questionGroups = {
  introduction: {
    id: 'introduction',
    label: 'qc.introduction',
  },
  customerConsent: {
    id: 'customerConsent',
    label: 'qc.customerConsent',
  },
  documents: {
    id: 'documents',
    label: 'qc.documents',
  },
  contactDetails: {
    id: 'contactDetails',
    label: 'qc.contactDetails',
  },
  policyholder: {
    id: 'policyholder',
    label: 'qc.policyHolder',
  },
  policyStartDate: {
    id: 'policyStartDate',
    label: 'qc.policyStartDate',
  },
  premium: {
    id: 'premium',
    label: 'qc.premium',
  },
  packages: {
    id: 'packages',
    label: 'qc.packages',
  },
  claimConditions: {
    id: 'claimConditions',
    label: 'qc.claimConditons',
  },
  cashInstallment: {
    id: 'cashInstallment',
    label: 'qc.cashInstallment',
  },
  shipping: {
    id: 'shipping',
    label: 'qc.shipping',
  },
  address: {
    id: 'address',
    label: 'qc.address',
  },
  ending: {
    id: 'ending',
    label: 'qc.ending',
  },
  addOns: {
    id: 'addOns',
    label: 'text.addOns',
  },
} as Record<string, Record<string, string>>; // remove this type assertion after feature is stable. this is a hacky way to remove type warning in questions due to nullable group.

export type QuestionsList = typeof questions;

// Questions config
// Each question: qId - key, label - display text, isCritical - need to group critical and non-critical questions for BE
// groupId is for qc logic for example countdown, save QC answers.
// group is for translated group name like 'Introduction', 'Ending' etc.
export const questions = _filter(
  [
    {
      qId: Questions.RECORD_CONVERSATION_PERMISSION,
      groupId: questionGroups?.customerConsent?.id,
      description: 'qc.permissionToRecord',
      isCritical: true,
      group: questionGroups?.customerConsent?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.NO_RUDENESS,
      groupId: questionGroups?.customerConsent?.id,
      description: 'qc.properLanguage', // no is in bold
      isCritical: true,
      group: questionGroups?.customerConsent?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.HAS_CUSTOMER_EMAIL,
      groupId: questionGroups.contactDetails.id,
      label: 'qc.email',
      isCritical: true,
      group: questionGroups.contactDetails.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.HAS_CUSTOMER_LINE,
      groupId: questionGroups.contactDetails.id,
      label: 'qc.line',
      isCritical: true,
      disabled: true,
      group: questionGroups.contactDetails.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.POLICYHOLDER_DIFFERENTIATION,
      groupId: questionGroups.policyholder.id,
      label: 'qc.whoIsInsuredPerson',
      isCritical: true,
      group: questionGroups.policyholder.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.POLICYHOLDER_NAME_TITLE,
      groupId: questionGroups.policyholder.id,
      label: 'qc.insuredPersonName',
      isCritical: true,
      group: questionGroups.policyholder.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.DOB_OF_THE_POLICYHOLDER,
      groupId: questionGroups.policyholder.id,
      label: 'qc.dobOfThePolicyHolder',
      isCritical: true,
      group: questionGroups.policyholder.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.CLAIM_CONDITIONS,
      groupId: questionGroups?.claimConditions?.id,
      description: 'qc.explaninStepAndCondition',
      isCritical: true,
      group: questionGroups?.claimConditions?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.CASH_INSTALLMENT_CONTRACT_CORRECT,
      groupId: questionGroups.cashInstallment.id,
      description: 'qc.cashInstallmentDescription',
      isCritical: true,
      disabled: false,
      group: questionGroups.cashInstallment.label,
      title: 'qc.cashInstallment',
    },
    {
      qId: Questions.POLICYHOLDER_ADDRESS,
      groupId: questionGroups.address.id,
      label: 'qc.policy',
      isCritical: true,
      group: questionGroups.address.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.SHIPPING_ADDRESS,
      groupId: questionGroups.address.id,
      label: 'qc.shippingAddress',
      isCritical: true,
      group: questionGroups.address.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.BILLING_ADDRESS,
      groupId: questionGroups.address.id,
      label: 'qc.billing',
      isCritical: true,
      group: questionGroups.address.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.COMPANY_AGENT_INTRO,
      groupId: questionGroups?.introduction?.id,
      description: 'qc.introCompanyAndAgent',
      isCritical: false,
      group: questionGroups?.introduction?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.NOTIFY_BROKER_LICENSE,
      groupId: questionGroups?.introduction?.id,
      description: 'qc.informCustomerBrokerLicense',
      isCritical: false,
      group: questionGroups?.introduction?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.NOTIFY_RECORD_CONVERSATION,
      groupId: questionGroups?.introduction?.id,
      description: 'qc.informCustomerConversationRecord',
      isCritical: false,
      group: questionGroups?.introduction?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.GOODBYE,
      groupId: questionGroups?.ending?.id,
      description: 'qc.thanksForUsingRabbit',
      isCritical: false,
      group: questionGroups?.ending?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.ASKED_AVAILIBITY,
      groupId: questionGroups?.ending?.id,
      description: 'qc.askTimeToFollowUp',
      isCritical: false,
      group: questionGroups?.ending?.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.GOOD_QUALITY_DOCS,
      groupId: questionGroups.documents.id,
      description: 'qc.clearDocuments',
      isCritical: true,
      group: questionGroups.documents.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.POLICYSTARTDATE,
      groupId: questionGroups.policyStartDate.id,
      label: 'Policy start date',
      isCritical: false,
      group: questionGroups.policyStartDate.label,
      title: 'text.policyStartDate',
    },
    {
      qId: Questions.PREMIUM,
      groupId: questionGroups.premium.id,
      label: 'Premium',
      isCritical: false,
      group: questionGroups.premium.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.PREMIUM_DISCOUNTS,
      groupId: questionGroups.premium.id,
      label: 'qc.rabbitCareDiscount',
      isCritical: true,
      group: questionGroups.premium.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.PREMIUM_INVOICE,
      groupId: questionGroups.premium.id,
      label: 'qc.totalInvoiced',
      isCritical: true,
      group: questionGroups.premium.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.PREMIUM_PAYMENT_DOCUMENTS,
      groupId: questionGroups.premium.id,
      label: 'qc.paymentHasDocuments',
      isCritical: true,
      group: questionGroups.premium.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.COVERAGE,
      groupId: questionGroups.packages.id,
      label: 'Insurance type, Insurer',
      isCritical: false,
      title: 'text.insurancePackageTitle',
      group: questionGroups.packages.label,
    },
    {
      qId: Questions.COVERAGE_VOLUNTARY_PACKAGE,
      groupId: questionGroups.packages.id,
      label: 'qc.packageType',
      isCritical: false,
      title: 'text.insurancePackageTitle',
      group: questionGroups.packages.label,
    },
    {
      qId: Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
      groupId: questionGroups.packages.id,
      label: 'qc.coverageDetails',
      isCritical: false,
      title: 'text.sumInsuredLabel',
      group: questionGroups.packages.label,
    },
    {
      qId: Questions.PREFERRED_DELIVERY,
      groupId: questionGroups.shipping.id,
      label: 'qc.preferredDeliveryOptions',
      isCritical: true,
      disabled: false,
      group: questionGroups.shipping.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.EXPLAINED_DELIVERY_CONDITION,
      groupId: questionGroups.shipping.id,
      description: 'qc.explainDeliveryConditions',
      isCritical: true,
      disabled: false,
      group: questionGroups.shipping.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.PROBLEM_WITH_INSTALLMENT,
      groupId: questionGroups.premium.id,
      description: 'qc.problemWithInstallment',
      isCritical: true,
      disabled: false,
      group: questionGroups.premium.label,
      title: 'qc.problemWithInstallment',
    },
    {
      qId: Questions.DOCUMENT_TYPE_SPECIFIED,
      groupId: questionGroups.policyholder.id,
      label: 'leadDetailFields.documentType',
      isCritical: true,
      group: questionGroups.policyholder.label,
      title: 'text.insurancePackageTitle',
    },
    {
      qId: Questions.CORRECT_ID_NUMBER,
      groupId: questionGroups.policyholder.id,
      label: 'leadDetailFields.documentId',
      isCritical: true,
      group: questionGroups.policyholder.label,
      title: 'text.insurancePackageTitle',
    },
  ],
  (question) => Boolean(question.groupId)
);

// Fields config
// qId, isEditable - show edit icon, updatePath - Api to update value, fields - array of fields to show in edit form, noScrollbar - some edit forms can't have scrollbar
// fields: fieldType - input type, name - field name, value - mapping to BE, showLabel - some values need label displayed, isReadonly - can field be edited
export const questionFields = [
  {
    qId: Questions.COMPANY_AGENT_INTRO,
    isEditable: false,
  },
  {
    qId: Questions.NOTIFY_BROKER_LICENSE,
    isEditable: false,
  },
  {
    qId: Questions.NOTIFY_RECORD_CONVERSATION,
    isEditable: false,
  },
  {
    qId: Questions.GOODBYE,
    isEditable: false,
  },
  {
    qId: Questions.ASKED_AVAILIBITY,
    isEditable: false,
  },
  {
    qId: Questions.RECORD_CONVERSATION_PERMISSION,
    isEditable: false,
  },
  {
    qId: Questions.NO_RUDENESS,
    isEditable: false,
  },
  {
    qId: Questions.GOOD_QUALITY_DOCS,
    isEditable: false,
  },
  {
    qId: Questions.HAS_CUSTOMER_EMAIL,
    isEditable: true,
    fields: [
      {
        fieldType: 'text',
        title: 'text.email',
        name: 'email',
        value: 'customer.emails', // an array of emails, need to get 1st one
        updatePath: 'customer/emails',
      },
    ],
  },
  {
    qId: Questions.HAS_CUSTOMER_LINE,
    isEditable: true,
    fields: [
      {
        fieldType: 'text',
        name: 'line',
        value: 'customer.line', // not available
        updatePath: null,
      },
    ],
  },
  {
    qId: Questions.POLICYHOLDER_DIFFERENTIATION,
    isEditable: false,
    fields: [
      {
        fieldType: 'autocomplete',
        title: 'qc.title',
        name: 'policyHolderDifferentitation',
        value: [
          'order.data.policyHolder.isCustomer',
          'order.data.policyHolder.isCompany',
        ],
        updatePath: [
          'data/policyHolder/isCustomer',
          'data/policyHolder/isCompany',
        ],
      },
    ],
  },
  {
    qId: Questions.POLICYHOLDER_NAME_TITLE,
    isEditable: true,
    fields: [
      {
        fieldType: 'autocomplete',
        title: 'leadDetailFields.title',
        name: 'title',
        value: 'order.data.policyHolder.title',
        updatePath: 'data/policyHolder/title',
      },
      {
        fieldType: 'text',
        title: 'qc.firstName',
        name: 'firstName',
        value: 'order.data.policyHolder.firstName',
        updatePath: 'data/policyHolder/firstName',
      },
      {
        fieldType: 'text',
        title: 'qc.lastName',
        name: 'lastName',
        value: 'order.data.policyHolder.lastName',
        updatePath: 'data/policyHolder/lastName',
      },
    ],
    fieldsCompany: [
      {
        fieldType: 'text',
        title: 'text.companyName',
        name: 'companyName',
        value: 'order.data.policyHolder.companyName',
        updatePath: 'data/policyHolder/companyName',
      },
      {
        fieldType: 'text',
        title: 'text.taxId',
        name: 'taxId',
        value: 'order.data.policyHolder.companyTaxId',
        updatePath: 'data/policyHolder/companyTaxId',
      },
    ],
  },
  {
    qId: Questions.DOCUMENT_TYPE_SPECIFIED,
    isEditable: true,
    fields: [
      {
        fieldType: 'autocomplete',
        title: 'leadDetailFields.documentType',
        name: 'documentType',
        value: 'order.data.idType',
        updatePath: 'data/idType',
      },
    ],
  },
  {
    qId: Questions.CORRECT_ID_NUMBER,
    isEditable: true,
    fields: [
      {
        fieldType: 'text',
        title: 'leadDetailFields.documentId',
        name: 'documentId',
        value: 'order.data.idNumber',
        updatePath: 'data/idNumber',
      },
    ],
  },
  {
    qId: Questions.DOB_OF_THE_POLICYHOLDER,
    isEditable: true,
    fields: [
      {
        fieldType: 'dobPicker',
        title: 'qc.dobOfThePolicyHolder',
        name: 'policyHolderDOB',
        value: 'order.data.policyHolder.dateOfBirth',
        updatePath: 'data/policyHolder/dateOfBirth',
      },
    ],
  },
  {
    qId: Questions.POLICYSTARTDATE,
    isEditable: true,
    fields: [
      {
        fieldType: 'datePicker',
        name: 'policyStartDate',
        value: 'item.policyStartDate',
      },
    ],
  },
  {
    qId: Questions.PREMIUM_DISCOUNTS,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'discounts',
        value: 'order.discounts',
      },
    ],
  },
  {
    qId: Questions.PREMIUM_INVOICE,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'invoicePrice',
        value: 'order.invoicePrice',
      },
    ],
  },
  {
    qId: Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'sumInsured',
        title: 'qc.sumInsured',
        value: 'item.sumInsured',
        showLabel: true,
      },
    ],
  },
  {
    qId: Questions.COVERAGE,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'insuranceType',
        value: 'healthPackage.category',
      },
      {
        fieldType: 'text',
        name: 'insurer',
        value: 'healthPackage.insurer',
      },
    ],
  },
  {
    qId: Questions.COVERAGE_VOLUNTARY_PACKAGE,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'voluntaryPackageType',
        value: 'package.packageType',
        helper:
          'Inform customer about change of premium if customers have claims after renewal letter issued',
      },
    ],
  },
  {
    qId: Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
    isEditable: false,
    fields: [
      {
        fieldType: 'text',
        name: 'sumInsured',
        title: 'qc.sumInsured',
        value: 'item.sumInsured',
        showLabel: true,
      },
      {
        fieldType: 'text',
        name: 'deductibleAmount',
        title: 'qc.deductible',
        value: 'item.deductibleAmount',
        showLabel: true,
      },
      {
        fieldType: 'text',
        name: 'fireTheftCoverage',
        title: 'qc.fireAndTheft',
        value: 'item.fireTheftCoverage',
        showLabel: true,
      },
      {
        fieldType: 'text',
        name: 'floodCoverage',
        title: 'qc.flood',
        value: 'item.floodCoverage',
        showLabel: true,
      },
      {
        fieldType: 'text',
        name: 'carRepairType',
        title: 'qc.repairType',
        value: 'item.carRepairType',
        showLabel: true,
      },
    ],
  },
  {
    qId: Questions.CLAIM_CONDITIONS,
    isEditable: false,
  },
  {
    qId: Questions.CASH_INSTALLMENT_CONTRACT_CORRECT,
    isEditable: false,
  },
  {
    qId: Questions.PREFERRED_DELIVERY,
    isEditable: true,
    fields: [
      {
        fieldType: 'autocomplete',
        title: 'qc.deliveryOptions',
        name: 'deliveryOption',
        updatePath: 'data/deliveryOption',
        value: 'order.data.deliveryOption',
      },
      {
        fieldType: 'autocomplete',
        title: 'text.shipment',
        name: 'docsShipmentMethod',
        updatePath: 'data/docsShipmentMethod',
        value: 'order.data.docsShipmentMethod',
        isReadonly: true,
      },
      {
        fieldType: 'text',
        title: 'text.shipmentFee',
        name: 'shipmentFee',
        updatePath: 'data/shipmentFee',
        value: 'order.data.shipmentFee',
        isReadonly: true,
      },
    ],
  },
  {
    qId: Questions.EXPLAINED_DELIVERY_CONDITION,
    isEditable: false,
  },
  {
    qId: Questions.POLICYHOLDER_ADDRESS,
    isEditable: true,
    noScrollbar: true,
    fields: [
      {
        fieldType: 'text',
        title: 'Address',
        name: 'addressLine',
        value: 'order.data.policyHolder.policyAddress.address',
        updatePath: 'data/policyHolder/policyAddress/address',
      },
      {
        fieldType: 'text',
        title: 'Province',
        name: 'province',
        value: 'order.data.policyHolder.policyAddress.province',
        updatePath: 'data/policyHolder/policyAddress/province',
      },
      {
        fieldType: 'text',
        title: 'District',
        name: 'district',
        value: 'order.data.policyHolder.policyAddress.district',
        updatePath: 'data/policyHolder/policyAddress/district',
      },
      {
        fieldType: 'text',
        title: 'Subdistrict',
        name: 'subDistrict',
        value: 'order.data.policyHolder.policyAddress.subDistrict',
        updatePath: 'data/policyHolder/policyAddress/subDistrict',
      },
      {
        fieldType: 'text',
        title: 'Postal code',
        name: 'postalCode',
        value: 'order.data.policyHolder.policyAddress.postCode',
        updatePath: 'data/policyHolder/policyAddress/postCode',
      },
    ],
  },
  {
    qId: Questions.SHIPPING_ADDRESS,
    isEditable: true,
    noScrollbar: true,
    fields: [
      {
        fieldType: 'text',
        title: 'Address',
        name: 'addressLine',
        value: 'shippingAddress.addressLine',
        updatePath: 'data/policyHolder/shippingAddress/address',
      },
      {
        fieldType: 'text',
        title: 'Province',
        name: 'province',
        value: 'shippingAddress.province',
        updatePath: 'data/policyHolder/shippingAddress/province',
      },
      {
        fieldType: 'text',
        title: 'District',
        name: 'district',
        value: 'shippingAddress.district',
        updatePath: 'data/policyHolder/shippingAddress/district',
      },
      {
        fieldType: 'text',
        title: 'Subdistrict',
        name: 'subDistrict',
        value: 'shippingAddress.subDistrict',
        updatePath: 'data/policyHolder/shippingAddress/subDistrict',
      },
      {
        fieldType: 'text',
        title: 'Postal code',
        name: 'postalCode',
        value: 'order.data.policyHolder.shippingAddress.postCode',
        updatePath: 'data/policyHolder/shippingAddress/postCode',
      },
    ],
  },
  {
    qId: Questions.BILLING_ADDRESS,
    isEditable: true,
    noScrollbar: true,
    fields: [
      {
        fieldType: 'text',
        title: 'Address',
        name: 'addressLine',
        value: 'billingAddress.addressLine',
        updatePath: 'data/policyHolder/billingAddress/address',
      },
      {
        fieldType: 'text',
        title: 'Province',
        name: 'province',
        value: 'billingAddress.province',
        updatePath: 'data/policyHolder/billingAddress/province',
      },
      {
        fieldType: 'text',
        title: 'District',
        name: 'district',
        value: 'billingAddress.district',
        updatePath: 'data/policyHolder/billingAddress/district',
      },
      {
        fieldType: 'text',
        title: 'Subdistrict',
        name: 'subDistrict',
        value: 'billingAddress.subDistrict',
        updatePath: 'data/policyHolder/billingAddress/subDistrict',
      },
      {
        fieldType: 'text',
        title: 'Postal code',
        name: 'postalCode',
        value: 'order.data.policyHolder.billingAddress.postCode',
        updatePath: 'data/policyHolder/billingAddress/postCode',
      },
    ],
  },
];

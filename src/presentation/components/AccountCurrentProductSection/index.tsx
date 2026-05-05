import {
  makeStyles,
  Paper,
  Theme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { getString } from 'presentation/theme/localization';
import React, { useState } from 'react';
import ProductSectionContent, { FieldConfig } from './ProductSectionContent';
import PolicyDetailModal from './PolicyDetailModal';
import type {
  AccountCurrentProductData,
  PolicyData,
} from 'shared/types/policy';
import { formatDate } from 'presentation/components/controls/DatePickerWithThaiYear/index.helper';
import { satangToBaht, numberToMoney } from 'utils/currency';
import { cancellationReasons } from 'presentation/pages/car-insurance/OrderDetailPage/helper';

const translateMatterOfConnection = (value: string): string => {
  const translationMap: Record<string, string> = {
    phone_number: getString('text.phoneNumber'),
    id_number: getString('text.idNumber'),
    tax_id: getString('text.taxId'),
  };

  return value
    .split(',')
    .map((item) => translationMap[item.trim()] || item.trim())
    .join(', ');
};

const translateInsuranceType = (type: string | undefined): string => {
  if (!type) return '-';

  const typeMap: Record<string, string> = {
    TYPE_1: getString('insuranceTypes.type1'),
    TYPE_2: getString('insuranceTypes.type2'),
    TYPE_2_PLUS: getString('insuranceTypes.type2Plus'),
    TYPE_3: getString('insuranceTypes.type3'),
    TYPE_3_PLUS: getString('insuranceTypes.type3Plus'),
    INSURANCE_TYPES_UNSPECIFIED: getString('motoType.typeMandatory'),
  };

  return typeMap[type] || type;
};

const translatePaymentOption = (option: string | undefined): string => {
  if (!option) return '-';

  const optionMap: Record<string, string> = {
    CREDIT_CARD_INSTALLMENT: getString(
      'paymentOptions.CREDIT_CARD_INSTALLMENT'
    ),
    FULL_PAYMENT: getString('paymentOptions.FULL_PAYMENT'),
    PAYMENT_OPTION_UNKNOWN: getString('paymentOptions.PAYMENT_OPTION_UNKNOWN'),
    RABBIT_CARE_INSTALLMENT: getString(
      'paymentOptions.RABBIT_CARE_INSTALLMENT'
    ),
    DIRECT_DEBIT_INSTALLMENT: getString(
      'paymentOptions.DIRECT_DEBIT_INSTALLMENT'
    ),
  };

  return optionMap[option] || option;
};

const translatePaymentMethod = (method: string | undefined): string => {
  if (!method) return '-';

  const methodMap: Record<string, string> = {
    BANK_TRANSFER: getString('paymentMethods.BANK_TRANSFER'),
    DIRECT_PAYMENT: getString('paymentMethods.DIRECT_PAYMENT'),
    EDC: getString('paymentMethods.EDC'),
    INSTALLMENT: getString('paymentMethods.INSTALLMENT'),
    ONLINECARD: getString('paymentMethods.ONLINECARD'),
    DIRECT_DEBIT: getString('paymentMethods.DIRECT_DEBIT'),
    QR_CODE: getString('paymentMethods.QR_CODE'),
    RECURRING: getString('paymentMethods.RECURRING'),
    VEDC: getString('paymentMethods.VEDC'),
    CASH: getString('paymentMethods.CASH'),
    CREDIT_TERM: getString('paymentMethods.CREDIT_TERM'),
    CHEQUE: getString('paymentMethods.CHEQUE'),
  };

  return methodMap[method] || method;
};

export interface AccountCurrentProductProps {
  haveOrders?: boolean;
  data?: AccountCurrentProductData;
}

interface ProductSection {
  id: string;
  title: string;
  fields: FieldConfig[];
  orders?: Array<Record<string, any>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    height: '100%',
    border: `1px solid #E9EDF5`,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    overflowY: 'visible',
    overflowX: 'hidden',
  },
  sectionTitle: {
    margin: 0,
    padding: '10px 15px',
    color: theme.palette.primary.main,
    background: theme.palette.grey[200],
    fontWeight: theme.typography.fontWeightBold as number,
    fontSize: '1rem',
  },
  accordion: {
    border: 'none',
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
    },
  },
  accordionSummary: {
    backgroundColor: 'transparent',
    minHeight: 48,
    padding: '0 15px',
    '&.Mui-expanded': {
      minHeight: 48,
    },
  },
  accordionTitle: {
    color: theme.palette.text.primary,
    fontWeight: 400,
    fontSize: '0.875rem',
  },
  accordionDetails: {
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'none',
    overflow: 'visible',
  },
  ordersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: '0 15px 15px',
    maxHeight: '600px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  noOrders: {
    padding: '15px',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  expandIcon: {
    color: theme.palette.primary.main,
  },
}));

function AccountCurrentProductSection({
  haveOrders,
  data,
}: Readonly<AccountCurrentProductProps>) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    orderId: string;
    productType: string;
    data: Record<string, any>;
  } | null>(null);

  const fieldConfigs: Record<string, FieldConfig[]> = {
    'products/car-insurance': [
      { label: getString('leadDetailFields.orderId'), key: 'orderId' },
      {
        label: getString('text.matterOfConnection'),
        key: 'matterOfConnection',
      },
    ],
    'products/health-insurance': [
      { label: getString('leadDetailFields.orderId'), key: 'orderId' },
      {
        label: getString('text.matterOfConnection'),
        key: 'matterOfConnection',
      },
    ],
  };

  const productTitleMap: Record<string, string> = {
    'products/car-insurance': getString('productionOptions.carInsurance'),
    'products/health-insurance': getString('productionOptions.healthInsurance'),
  };

  const transformPolicyToOrder = (policy: PolicyData) => ({
    orderId: policy.orderItemHumanId,
    matterOfConnection: translateMatterOfConnection(
      policy.matterOfConnection || ''
    ),
    // Car info
    year: policy.carInfo?.year,
    brand: policy.carInfo?.brand,
    model: policy.carInfo?.carModel,
    licensePlate: policy.carInfo?.licensePlate,
    // Health info
    planName: policy.healthInfo?.planName,
    beneficiaryName: policy.healthInfo?.beneficiaryName,
    beneficiaryRelationship: policy.healthInfo?.beneficiaryRelationship,
    orderCancellationStatus: policy.healthInfo?.orderCancellationStatus
      ? getString('text.cancelled')
      : '-',
    orderCancellationReason: policy.healthInfo?.orderCancellationReason
      ? cancellationReasons().find(
          (reason) =>
            reason.value === policy.healthInfo?.orderCancellationReason
        )?.title || policy.healthInfo.orderCancellationReason
      : '-',
    orderCancellationDate: policy.healthInfo?.orderCancellationDate
      ? formatDate(policy.healthInfo?.orderCancellationDate, false)
      : undefined,
    // Package info
    insuranceType: translateInsuranceType(policy.packageInfo?.insuranceType),
    expirationDate: policy.packageInfo?.expirationDate
      ? formatDate(policy.packageInfo.expirationDate, false)
      : undefined,
    policyStartDate: policy.packageInfo?.policyStartDate
      ? formatDate(policy.packageInfo.policyStartDate, false)
      : undefined,
    premiumAmount:
      policy.packageInfo?.premiumAmount != null
        ? numberToMoney(satangToBaht(policy.packageInfo.premiumAmount)) || '0'
        : '0',
    sumInsured:
      policy.packageInfo?.sumInsured != null
        ? numberToMoney(satangToBaht(policy.packageInfo.sumInsured)) || '0'
        : '0',
    // Insurer info
    insurerName: policy.insurerInfo?.insurerName,
    phone: policy.insurerInfo?.phone,
    website: policy.insurerInfo?.website,
    // Payment info
    paymentOption: translatePaymentOption(policy.paymentInfo?.paymentOption),
    paymentMethod: translatePaymentMethod(policy.paymentInfo?.paymentMethod),
    paymentStatus: policy.paymentInfo?.paymentStatus,

    leadSource: policy.leadInfo?.source?.source || '',
  });

  const handleChange =
    (panel: string) =>
    (event: React.ChangeEvent<object>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleInfoClick = (
    orderId: string,
    productType: string,
    orderData: Record<string, any>
  ) => {
    setSelectedOrder({ orderId, productType, data: orderData });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const productSections: ProductSection[] =
    data?.insuranceProducts?.map((product) => ({
      id: product.product,
      title: productTitleMap[product.product] || product.productLabel,
      fields: fieldConfigs[product.product] || [],
      orders: product.policies.map(transformPolicyToOrder),
    })) || [];

  return (
    <Paper elevation={3} className={classes.paper}>
      <Typography className={classes.sectionTitle}>
        {getString('text.accountCurrentProduct')}
      </Typography>

      <div className={classes.contentWrapper}>
        {!haveOrders ? (
          <div className={classes.noOrders}>{getString('text.noPolicy')}</div>
        ) : (
          <div>
            {productSections.map((section) => (
              <Accordion
                key={section.id}
                expanded={expanded === section.id}
                onChange={handleChange(section.id)}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                  className={classes.accordionSummary}
                >
                  <Typography className={classes.accordionTitle}>
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  <div className={classes.ordersContainer}>
                    {section.orders && section.orders.length > 0 ? (
                      section.orders.map((order, index) => (
                        <ProductSectionContent
                          key={index}
                          fields={section.fields}
                          data={order}
                          productType={section.id}
                          onInfoClick={handleInfoClick}
                        />
                      ))
                    ) : (
                      <ProductSectionContent
                        fields={section.fields}
                        data={undefined}
                        productType={section.id}
                      />
                    )}
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <PolicyDetailModal
          open={modalOpen}
          onClose={handleCloseModal}
          orderId={selectedOrder.orderId}
          productType={selectedOrder.productType}
          data={selectedOrder.data}
        />
      )}
    </Paper>
  );
}

export default AccountCurrentProductSection;

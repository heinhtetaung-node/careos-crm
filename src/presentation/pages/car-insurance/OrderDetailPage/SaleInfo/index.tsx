import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useUpdateOrderByIdMutation } from 'data/slices/orderSlice';
import { useLazyGetTransactionFeeQuery } from 'data/slices/transactionSlice';
import { useGetUserByParamsUsingLeadSearchQuery } from 'data/slices/userSlice';
import { UserLeadSearchResponse } from 'data/slices/userSlice/interface';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { LeadTypeFilter } from 'shared/helper/utilities';
import { satangToBaht } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import InfoPanel from '../InfoPanel';
import { IField } from '../InfoPanel/type';

type Fields =
  | 'Order Type'
  | 'Renewal ID'
  | 'Shipment Fee'
  | 'Order ID'
  | 'Team'
  | 'Supervisor'
  | 'Sales Agent'
  | 'Ref ID'
  | 'Invoice Price'
  | 'Processing Fee'
  | undefined;

/**
 * includeFields mean fields to include/show in sales info panel
 * includeFields = [] mean include all fields
 */
interface SaleInfoProps {
  extraFields?: IField[];
  includeFields?: Fields[];
}

enum filteredFields {
  Shipment = 'Shipment Fee',
}

function SaleInfo({
  extraFields = [],
  includeFields = [],
}: Readonly<SaleInfoProps>) {
  const { orderId } = useParams();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [updateOrderById] = useUpdateOrderByIdMutation();
  const order = useAppSelector((state) => state.order?.payload);
  const [getTransactionFee, { data: transactionSnapshot }] =
    useLazyGetTransactionFeeQuery();
  const { data: getUserByUserName } = useGetUserByParamsUsingLeadSearchQuery({
    payload: {
      filter: `user.name="${order.convertBy ?? ''}"`,
    },
  });

  useEffect(() => {
    if (order?.payment) {
      getTransactionFee(order?.payment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.payment]);

  const lead = useAppSelector(
    (state) => state.leadsDetailReducer?.lead?.payload
  );

  const [orderType, setOrderType] = useState<any | null>(null);
  const handleUpdateOrder = async (payload: any) => {
    if (orderId!.length <= 0 || payload.name !== 'isFullyPaid') return;
    const updateShipmentMethod = await updateOrderById({
      orderId: orderId!,
      payload: {
        isFullyPaid: payload.value === 'fullyPaid',
      },
    }).unwrap();
    const error =
      (updateShipmentMethod as Record<string, any>)?.error ?? undefined;
    if (!error) {
      showSuccessSnackbar(getString('text.updateOrderSuccessfully'));
      return;
    }
    showErrorSnackbar(
      getString('text.updateOrderFailed', {
        message: error?.data?.message ?? '',
      })
    );
  };

  useEffect(() => {
    if (lead) {
      const type = LeadTypeFilter.find((i) => i.leadType === lead.type) ?? null;
      setOrderType(type);
    }
  }, [lead]);

  const saleInfo = (
    getUserByUserName?.users ? getUserByUserName.users?.[0] : {}
  ) as UserLeadSearchResponse;

  const saleInfoName = saleInfo
    ? `${saleInfo?.firstName} ${saleInfo?.lastName}`
    : '-';
  const schema = [
    {
      title: 'Order Type',
      value: orderType ? getString(orderType?.title) : '-',
      type: 'text',
    },
    {
      title: 'Renewal ID',
      value: '-',
      type: 'text',
    },
    {
      title: 'Order ID',
      value: order?.humanId || '',
      type: 'text',
    },
    {
      title: 'Team',
      value: saleInfo?.teamDisplayName ?? '',
      type: 'text',
    },
    {
      title: 'Supervisor',
      value: order?.supervisor?.firstName
        ? `${order.supervisor.firstName} ${order?.supervisor.lastName ?? ''}`
        : '-',
      type: 'text',
      disabled: !order?.supervisor?.firstName,
    },
    {
      title: 'Sales Agent',
      value: saleInfoName,
      type: 'text',
      disabled: !saleInfo?.firstName,
    },
    {
      title: 'Ref ID',
      value: lead?.reference ?? '',
      type: 'text',
      isOptional: true,
    },
  ] as const;

  const filterDataSchema =
    includeFields.length < 1
      ? schema
      : (schema.filter((field) =>
          includeFields.includes(field.title)
        ) as IField[]);

  let dataSchema = [
    ...(!includeFields.includes(filteredFields.Shipment)
      ? [...filterDataSchema]
      : [...schema]),
    {
      titleString: getString('qc.invoicePrice'),
      value: order?.invoicePrice
        ? satangToBaht(order?.invoicePrice).toString()
        : '',
      type: 'text',
      isOptional: true,
    },
    {
      titleString: getString('paymentDetails.processingFee'),
      value: transactionSnapshot?.priceSummary?.processingFeeAmount ?? '-',
      type: 'text',
      isOptional: true,
    },
    ...(includeFields.includes(filteredFields.Shipment)
      ? [
          {
            titleString: getString('text.shipmentFee'),
            value: satangToBaht(
              transactionSnapshot?.priceSummary?.shipmentFee ?? '-'
            ).toString(),
            type: 'text',
            isOptional: true,
          },
        ]
      : []),
    {
      titleString: getString('text.allFeeAmount'),
      value: transactionSnapshot?.priceSummary?.feeAmount ?? '-',
      type: 'text',
      isOptional: true,
    },
  ];
  if (extraFields.length > 0) dataSchema = [...dataSchema, ...extraFields];

  return (
    <InfoPanel
      dataSchema={dataSchema as unknown as IField[]}
      title={getString('order.sale')}
      handleUpdateOrder={handleUpdateOrder}
    />
  );
}

export default SaleInfo;

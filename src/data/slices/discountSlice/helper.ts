import { getString } from 'presentation/theme/localization';
import { formatDDMMYYYYHHMMA, leadTypeText } from 'shared/helper/utilities';
import { Insurer } from 'shared/types/insurers';
import { numberToMoney, satangToBahtNumber } from 'utils/currency';

import { DiscountsRequestResponse, DiscountTransformedResponse } from './types';
import { PRODUCTS } from 'config/TypeFilter';

const getInsurerName = (insurer: string, insurerList?: Insurer[]) => {
  const response = insurerList?.find((data) => data?.name === insurer);

  return response ? response?.displayName : '';
};

export const transformDiscountResponse = (
  response: DiscountsRequestResponse,
  insurers?: Insurer[] | undefined
) => {
  const result: DiscountTransformedResponse[] = [];
  response?.requests.forEach((discount: any, index) => {
    const name = discount.request.name.split('/');
    const isAmount = !!discount?.request?.amount;
    const requestDiscount = isAmount
      ? discount?.request?.amount
      : parseInt(discount?.request?.percentage, 10) / 100;

    const priceBeforeDiscount = satangToBahtNumber(
      parseInt(discount?.request?.package?.price, 10) ?? 0
    );
    const lead =
      discount.user.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE
        ? discount.healthLead
        : discount.lead;
    const priceAfterDiscount = isAmount
      ? priceBeforeDiscount - satangToBahtNumber(requestDiscount)
      : priceBeforeDiscount - priceBeforeDiscount * (requestDiscount / 100);

    result.push({
      requestTime: formatDDMMYYYYHHMMA(discount?.request?.createTime),
      leadId: lead?.humanId,
      discountType: discount?.discountType,
      agentName: `${discount?.user?.firstName} ${discount?.user?.lastName}`,
      insurer: getInsurerName(discount?.request?.package.insurer, insurers),
      insuranceType: discount?.request?.package?.insuranceType
        ? getString(
            `leadDetailFields.insuranceTypesCheck.${discount?.request?.package?.insuranceType}`
          )
        : '',
      leadType: leadTypeText(lead?.type),
      name: `requests/${name[name.length - 1]}`,
      discount: discount?.request?.amount ? 'amount' : 'percentage',
      requestDiscount: isAmount
        ? `${numberToMoney(requestDiscount)} ${getString(`healthPackage.thb`)}`
        : `${requestDiscount}%`,
      maxDiscount: parseInt(discount?.request?.maxPercentage, 10) / 100,
      priceBeforeDiscount: numberToMoney(
        parseFloat(priceBeforeDiscount.toFixed(2))
      ).toString(),
      priceAfterDiscount: numberToMoney(
        parseFloat(priceAfterDiscount.toFixed(2))
      ).toString(),
      description: discount?.request?.remark,
      configId: discount?.request?.name,
      approver: `${discount?.approver?.firstName} ${discount?.approver?.lastName}`,
      approvalTime: formatDDMMYYYYHHMMA(discount?.request?.updateTime),
      status: discount?.attributes?.cancelled
        ? 'CANCELLED'
        : discount?.request?.status,
      approvalReason: discount?.request?.approverRemark,
      index: index + 1,
      leadName: lead?.name,
      category: getString(
        `healthPackageFilter.productCategoryValue.${lead?.data?.insurance?.category}`
      ),
    });
  });

  return { imports: result, total: response?.total };
};

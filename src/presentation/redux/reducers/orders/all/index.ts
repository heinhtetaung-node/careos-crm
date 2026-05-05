import { Item } from 'data/slices/orderPolicySlice/interface';
import { formatDeliveryOption } from 'data/slices/orderSlice/helper';
import {
  formatDocumentStatus,
  formatQCStatus,
  formatSubmissionStatus,
  formatApprovalStatus,
  formatOrderItem,
  formatNumber,
  formatCustomerName,
  formatInsuredPerson,
  formatOrderInsurancePackage,
  orderInsurancePackage,
} from 'presentation/components/OrderListingTable/helper';
import { formatCoverage } from 'presentation/components/QcDetailPage/helpers/utils';
import {
  OrdersAllActions,
  InsurersAllActions,
  GetInsurerAllAction,
  GetInsurerAllSuccessAction,
  GetInsurerAllFailedAction,
} from 'presentation/redux/actions/orders/all';
import { getString } from 'presentation/theme/localization';
import { IAction, IState } from 'shared/interfaces/common';
import { satangToBaht } from 'utils/currency';
import { format } from 'utils/datetime';

export interface IInsurerState {
  displayName: string;
  shortnameEn: string;
  shortnameTh: string;
  name?: string;
  rating?: number;
  order?: number;
  displayNameTh?: string;
}

export interface IInsurerInitialState {
  data: IInsurerState[];
  isFetching: boolean;
  success: boolean;
  nextPageToken?: string;
}

export interface IInsurerResponse {
  data: {
    insurers: IInsurerState[];
    nextPageToken: string;
  };
}

export type InsurerAction =
  | GetInsurerAllAction
  | GetInsurerAllSuccessAction
  | GetInsurerAllFailedAction;

const initialState: IState<any> & { totalItem?: number } & {
  pageState: any;
} = {
  data: [],
  isFetching: false,
  success: true,
  status: '',
  totalItem: 0,
  tableType: '',
  pageState: {
    pageSize: 15,
    currentPage: 1,
  },
};

const insurerInitialState: IInsurerInitialState = {
  data: [],
  isFetching: false,
  success: true,
  nextPageToken: '',
};

export const formatOrdersAll = (listOrdersAll: any[]) => {
  const data = listOrdersAll.map((item) => ({
    id: item.order.name.split('/')[1],
    orderId: item.order.humanId,
    orderCreated: item.order.createTime,
    licensePlate: item?.order?.data?.carLicensePlate ?? '-',
    earliestPolicyStartDate: item?.attributes?.earliestPolicyStartDate
      ? format(new Date(item.attributes.earliestPolicyStartDate), 'dd/MM/yyyy')
      : '-',
    customer: formatCustomerName(item.customer),
    insuredPerson: item?.order?.data?.policyHolder
      ? formatInsuredPerson(item?.order?.data?.policyHolder)
      : '-',
    insurancePackage: formatOrderInsurancePackage(
      orderInsurancePackage(item?.items)
    ),
    totalInvoiced: formatCoverage(satangToBaht(item?.order?.invoicePrice ?? 0)),
    discount: formatCoverage(
      satangToBaht(
        item?.order?.discounts.reduce(
          (total: number, discount: number) => total + discount,
          0
        )
      )
    ),
    convertBy: item?.order?.convertBy ?? '',
    paymentStatus: item?.order?.isFullyPaid
      ? getString('tableListing.fullyPaid')
      : getString('tableListing.notFullyPaid'),
    deliveryOption: formatDeliveryOption(item?.order?.data),
    documentStatus: formatDocumentStatus(item.order.documentStatus),
    qcStatus: formatQCStatus(item.order.qcStatus),
    submissionStatus: formatSubmissionStatus(item.order.submissionStatus),
    approvalStatus: formatApprovalStatus(item.order.approvalStatus),
    leadSource: item.attributes?.sourceDisplayName || '',
    isStar: false,
    products: item.items?.map((productItem: Item) =>
      formatOrderItem(productItem, item?.order?.data?.policyHolder)
    ),
    isChecked: false,
  }));

  return data;
};

export default function OrdersAllReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case OrdersAllActions.GET_ORDERS_ALL: {
      const { pageSize, currentPage, orderBy } = action.payload;

      return {
        ...state,
        isFetching: true,
        pageState: {
          pageSize: pageSize || state.pageState.pageSize,
          currentPage: currentPage || state.pageState.currentPage,
          orderBy,
        },
      };
    }
    case OrdersAllActions.GET_ORDERS_ALL_SUCCESS: {
      return {
        ...state,
        data: formatOrdersAll(action.payload?.data?.orders || []) || [],
        success: true,
        isFetching: false,
        totalItem: formatNumber(action.payload?.data?.total),
      };
    }
    case OrdersAllActions.GET_ORDERS_ALL_FAILED: {
      return {
        ...state,
        data: [],
        success: false,
        isFetching: false,
        totalItem: 0,
      };
    }
    case OrdersAllActions.RESET_PAGE_STATE: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}

export function InsurersAll(
  state = insurerInitialState,
  action: InsurerAction
): IInsurerInitialState {
  switch (action.type) {
    case InsurersAllActions.GET_INSURERS_ALL: {
      return {
        ...state,
        isFetching: true,
        nextPageToken: action.payload.pageToken,
      };
    }
    case InsurersAllActions.GET_INSURERS_ALL_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        success: true,
        nextPageToken: action.payload.data.nextPageToken || '',
        data: action.payload.data.insurers,
      };
    }
    case InsurersAllActions.GET_INSURERS_ALL_FAILED: {
      return {
        ...state,
        isFetching: false,
        success: false,
      };
    }
    default:
      return state;
  }
}

import { getOrdersAll } from 'presentation/redux/actions/orders/all';
import { getOrdersDocuments } from 'presentation/redux/actions/orders/documents';
import { getQCModule } from 'presentation/redux/actions/orders/qc';
import { getOrderSubmission } from 'presentation/redux/actions/orders/submission';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import { OrderType } from 'shared/constants/orderType';

interface handleSearchIProps {
  orderType: OrderType | undefined;
  values: any;
}

export const isCustomerPhone = (search: any) => search?.key === 'customerPhone';

export const getSearch = (values: any) => {
  let search = { ...values.search };
  if (isCustomerPhone(search)) {
    search = {
      ...search,
      value: search.value,
    };
  }
  return search;
};

export const getNewValue = (values: any, search: any) => ({
  ...values,
  ...(values?.date?.startDate && {
    date: {
      ...values.date.startDate,
    },
  }),
  ...(values?.date?.endDate && {
    date2: {
      ...values.date.endDate,
    },
  }),
  ...(search.key && {
    search: {
      [search.key]: search.value,
    },
  }),
});

export const getPayload = (newValue: any) => ({
  ...newValue,
  currentPage: 1,
  isSearching: true,
});

function useOrderSearch() {
  const dispatch = useAppDispatch();
  const handleSearch = ({ orderType, values }: handleSearchIProps) => {
    const search = getSearch(values);
    const newValue = getNewValue(values, search);
    const payload = {
      ...newValue,
      orderType,
    };
    switch (orderType) {
      case OrderType.All:
        dispatch(getOrdersAll(payload));
        break;
      case OrderType.Document:
        dispatch(getOrdersDocuments(payload));
        break;
      case OrderType.QC:
        dispatch(getQCModule(payload));
        break;
      case OrderType.Submission:
        dispatch(getOrderSubmission(payload));
        break;
      default:
    }
  };

  return { handleSearch };
}

export default useOrderSearch;

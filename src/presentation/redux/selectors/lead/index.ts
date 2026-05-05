import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { Lead } from 'shared/types/lead';
import { ProductType } from 'shared/types/packages';

export const useGetLeadSelector = () => {
  const lead = useAppSelector((state) => state.leadsDetailReducer.lead.payload);
  return lead as Lead;
};

export const useGetProductSelector = () => {
  const product: ProductType = useAppSelector(
    (state) =>
      state.typeSelectorReducer.globalProductSelectorReducer?.data ||
      'products/car-insurance'
  );
  return product;
};

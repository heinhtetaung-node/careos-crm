import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import Controls from 'presentation/components/controls/Control';
import { changeProductSelectorTypes } from 'presentation/redux/actions/typeSelector/globalProduct';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import ProductOptions from 'shared/constants/productOptions';

import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { initialProduct } from 'presentation/redux/reducers/typeSelector/globalProduct';
import {
  UserRoleID,
  RolesWithoutProduct,
  getEligibleProducts,
} from '../ProtectedRouteHelper';

function ProductTypeSelectorGlobal() {
  const dispatch = useDispatch();
  const user = useGetUserSelector();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isRoleWithoutProduct = RolesWithoutProduct.includes(
    user?.role as UserRoleID
  );
  const userProduct = user?.product || globalProduct;

  // Determine the selected product value
  const selectedProduct = useMemo(
    () =>
      isRoleWithoutProduct ? globalProduct : userProduct || initialProduct,
    [isRoleWithoutProduct, globalProduct, userProduct]
  );

  const eligibleProducts = getEligibleProducts(user);

  const productOptions = ProductOptions.filter((prod) =>
    eligibleProducts.includes(prod.value)
  );

  // Sync user's product with global selector if needed
  useEffect(() => {
    if (!isRoleWithoutProduct) {
      dispatch(changeProductSelectorTypes(userProduct));
    }
  }, [dispatch, isRoleWithoutProduct, userProduct]);

  const handleChange = (e: any) => {
    const newValue = e.target.value as string;
    dispatch(changeProductSelectorTypes(newValue));
    window.location.href = '/';
  };

  return (
    <Controls.Select
      value={selectedProduct}
      onChange={handleChange}
      selectField="value"
      options={productOptions.map((prod) => ({
        ...prod,
        title: getString(prod.title),
      }))}
      color={Color.BLUE_BOLD}
    />
  );
}

export default ProductTypeSelectorGlobal;

import { IAction } from '../../../../../shared/interfaces/common';

// Get Product Selector Types
export enum ProductSelectorActionTypes {
  GET_PRODUCT_TYPES = '[ProductSelector] GET_PRODUCT_TYPES',
  GET_PRODUCT_TYPES_SUCCESS = '[ProductSelector] GET_PRODUCT_TYPES_SUCCESS',
  GET_PRODUCT_TYPES_FAIL = '[ProductSelector] GET_PRODUCT_TYPES_FAIL',
}

export const getProductSelectorTypes = (): IAction<any> => ({
  type: ProductSelectorActionTypes.GET_PRODUCT_TYPES,
});
export const getProductSelectorTypesSuccess = (
  payload?: any
): IAction<any> => ({
  type: ProductSelectorActionTypes.GET_PRODUCT_TYPES_SUCCESS,
  payload,
});

export const getProductSelectorTypesFail = (
  payload?: string
): IAction<any> => ({
  type: ProductSelectorActionTypes.GET_PRODUCT_TYPES_FAIL,
  payload,
});

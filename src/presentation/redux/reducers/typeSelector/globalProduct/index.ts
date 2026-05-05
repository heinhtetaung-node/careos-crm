import { IAction, IState } from '../../../../../shared/interfaces/common';
import { ProductSelectorActionTypes } from '../../../actions/typeSelector/globalProduct';

export const initialProduct = 'products/car-insurance';
export const initialState: IState<string> = {
  data: localStorage.getItem('globalProduct') ?? '',
  isFetching: false,
  success: false,
};

export default function (state = initialState, action: IAction<any>): any {
  switch (action.type) {
    case ProductSelectorActionTypes.CHANGE_PRODUCT_TYPES:
      return {
        ...state,
        data: action.payload,
        success: true,
      };
    default:
      return state;
  }
}

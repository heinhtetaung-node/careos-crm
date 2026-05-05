import { combineReducers } from 'redux';

import { apiSlice } from 'data/slices/apiSlice';
import callReducer from 'data/slices/callSlice';
import {
  errorReducer,
  errorReducerKey,
} from 'data/slices/errorSlice/errorsReducer';
import leadActivitiesReducer from 'data/slices/leadDetails/activitySlice';
import leadScriptsReducer from 'data/slices/leadDetails/scriptSlice';
import selectionsReducer from 'data/slices/orderPolicySlice/selectionsSlice';
import packageListingReducer from 'data/slices/packageListing';
import qcDetailReducer from 'data/slices/qcSlice/reducer';

import teamReducer from './admin/team';
import userReducer from './admin/user';
import carDetailReducer from './carDetail';
import carSubModelReducer from './carSubModel';
import customerReducer from './customer';
import customerProfileReducer from './customerProfile';
import documentReducer from './document';
import importFileReducer from './importFile';
import languageReducer from './languages';
import headerLayoutReducer from './layouts/headerLayoutReducer';
import themeReducer from './layouts/themeReducers';
import leadActivityReducer from './leadActivity';
import leadsDetailReducer from './leadDetail';
import customQuoteInitReducer from './leadDetail/customQuote';
import leadsReducer from './leads';
import leadSourceReducer from './leadSource';
import orderReducer from './order';
import orderCommentReducer from './order/comment';
import orderUploadDocumentReducer from './order/document';
import ordersReducer from './orders';
import packageReducer from './package/import';
import presenceReducer from './presence';
import provinceDetailReducer from './provinceDetail';
import typeSelectorReducer from './typeSelector';
import uiInitReducer from './ui';

import insurerWithPackagesReducer from 'presentation/pages/car-insurance/PackageListingPageNew/slices/insurerWithPackagesSlice';

import authReducer from '../slices/auth';

/**
 * @Todo Fix state name and normalizing state shape
 * Name State Slices Based On the Stored Data
 * {@Link https://redux.js.org/style-guide/style-guide#name-state-slices-based-on-the-stored-data}
 *
 * Normalizing State Shape
 * {@Link https://redux.js.org/usage/structuring-reducers/normalizing-state-shape}
 */
export const appReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  authReducer,
  customerReducer,
  headerLayoutReducer,
  languageReducer,
  leadActivityReducer,
  leadSourceReducer,
  leadsDetailReducer,
  leadsReducer,
  presenceReducer,
  teamReducer,
  themeReducer,
  typeSelectorReducer,
  uiInitReducer,
  userReducer,
  packageReducer,
  customerProfileReducer,
  importFileReducer,
  ordersReducer,
  order: orderReducer,
  carDetailReducer,
  provinceDetailReducer,
  orderUploadDocumentReducer,
  documentReducer,
  orderCommentReducer,
  customQuoteInitReducer,
  carSubModelReducer,
  packageListingReducer,
  leadScriptsReducer,
  leadActivitiesReducer,
  selectionsReducer,
  qcDetailReducer,
  callReducer,
  [errorReducerKey]: errorReducer,
  insurerWithPackages: insurerWithPackagesReducer,
});

export const rootReducer = (state: any, action: any) =>
  appReducer(state, action);

export type RootState = ReturnType<typeof appReducer>;

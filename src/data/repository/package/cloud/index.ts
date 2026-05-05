/* eslint-disable arrow-body-style */
import { defer, EMPTY } from 'rxjs';
import { expand, pluck, reduce } from 'rxjs/operators';

import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';

import getConfig from '../../../setting';

const apiGateway = ApiGateway.createAPIConnection(getConfig());

const getAllInsurer = (payload?: any) => {
  const newListInsurer = RabbitResource.Package.getAllInsurer(payload);
  return apiGateway.doGetAjaxRequest(newListInsurer).pipe(pluck('data'));
};

const getAllCarSubModel = (payload?: any) => {
  const getCarSubModelResource =
    RabbitResource.Package.getAllCarSubModel(payload);
  return apiGateway
    .doGetAjaxRequest(getCarSubModelResource)
    .pipe(pluck('data', 'submodels'));
};

const getAllCarModel = (payload?: any) => {
  const getCarModelResource = RabbitResource.Package.getAllCarModel(payload);
  return apiGateway.doGetAjaxRequest(getCarModelResource).pipe(pluck('data'));
};
const getAllInsurerIncursive = () => {
  const pageState = {
    pageSize: 100,
  };
  return getAllInsurer(pageState).pipe(
    expand((response: any) => {
      return defer(() =>
        response.nextPageToken
          ? getAllInsurer({ ...pageState, pageToken: response.nextPageToken })
          : EMPTY
      );
    }),
    pluck('insurers'),
    reduce((acc, cur: any) => {
      return acc.concat(cur);
    }, [])
  );
};

const getAllCarModelIncursive = () => {
  const pageState = {
    pageSize: 500,
  };
  return getAllCarModel(pageState).pipe(
    expand((response: any) => {
      return defer(() =>
        response.nextPageToken
          ? getAllCarModel({ ...pageState, pageToken: response.nextPageToken })
          : EMPTY
      );
    }),
    pluck('models'),
    reduce((acc, cur: any) => {
      return acc.concat(cur);
    }, [])
  );
};

const getImportedPackageHistory = (payload: any, productName: string) => {
  const getImportedPackageResource =
    RabbitResource.Package.getImportedPackageHistory(payload, productName);
  return apiGateway
    .doGetAjaxRequest(getImportedPackageResource)
    .pipe(pluck('data'));
};

const getAllCarSubModelIncursive = () => {
  const pageState = {
    pageSize: 100,
  };
  return getAllCarSubModel(pageState).pipe(
    expand((response: any) => {
      return defer(() =>
        response.nextPageToken
          ? getAllCarSubModel({
              ...pageState,
              pageToken: response.nextPageToken,
            })
          : EMPTY
      );
    }),
    pluck('submodels'),
    reduce((acc, cur: any) => {
      return acc.concat(cur);
    }, [])
  );
};

export default {
  getAllInsurer,
  getAllCarSubModel,
  getAllCarModel,
  getAllInsurerIncursive,
  getAllCarSubModelIncursive,
  getAllCarModelIncursive,
  getImportedPackageHistory,
};

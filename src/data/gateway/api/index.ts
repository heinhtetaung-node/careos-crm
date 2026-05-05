import { Observable, throwError, timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { fromFetch } from 'rxjs/fetch';
import { catchError, map, switchMap } from 'rxjs/operators';

import { MB_PER_BYTES } from 'config/constant';
import { getString } from 'presentation/theme/localization';
import {
  API_METHOD,
  INIT_INTERVAL_RETRY_MS,
  MAX_RETRIES_API,
  STATUS_RETRY_API,
} from 'shared/constants';
import * as CONSTANTS from 'shared/constants';
import { isDevelopment } from 'utils/env';

import Type, { EndPointWithType } from './type';

import ResponseModel from '../../../models/response';
import LocalStorage, {
  LOCALSTORAGE_KEY,
} from '../../../shared/helper/LocalStorage';
import { IResource } from '../../../shared/interfaces/common/resource';
import { TokenType } from '../../constants';
import { retryBackoff } from '../../helper/retryBackOff';
import StorageGateway from '../storage';

type apiRequestFn = (resource: IResource, body?: any) => Observable<any>;

class ApiGateway {
  _endpoint: string;

  _gateway: string;

  _adminUsername: string;

  _adminPassword: string;

  _resource?: IResource;

  _localStorageService: LocalStorage;

  static createAPIConnection(settings: any): any {
    return new ApiGateway(settings);
  }

  constructor(settings: any) {
    const { endpoint, gateway, adminUsername, adminPassword } = settings;
    this._endpoint = endpoint || process.env.VITE_API_ENDPOINT;
    this._gateway = gateway || process.env.VITE_GATEWAY_ENDPOINT;
    this._adminUsername = adminUsername;
    this._adminPassword = adminPassword;
    this._localStorageService = new LocalStorage();
  }

  getEndpoint = (resourceType: string): string => {
    if (resourceType === Type.Public) {
      return this._endpoint;
    }
    if (resourceType === Type.Nest) {
      return this._gateway;
    }
    if (resourceType === Type.Attachment) {
      return EndPointWithType.ATTACHMENT;
    }
    return this._endpoint;
  };

  getParam = (params: { [key: string]: string }): string =>
    Object.keys(params).reduce(
      (accumulator, currentValue, currentIndex) =>
        `${accumulator}${currentIndex === 0 ? '' : '&'}${currentValue}=${
          params[currentValue]
        }`,
      ''
    );

  customHeaderConfig = (requestType: string) => {
    if (isDevelopment && requestType === Type.Nest) {
      const userId = this._localStorageService.getItemByKey(
        LOCALSTORAGE_KEY.USER_ID
      );
      return {
        ...this.headerConfig(),
        'Grpc-Metadata-Rabbit-User-Id': userId || '',
      };
    }
    return this.headerConfig();
  };

  callApiHandle = (
    resource: IResource | string | any,
    method?: API_METHOD,
    body?: any
  ) => {
    let url: string;
    if (typeof resource === 'string') {
      url = resource;
    } else {
      const { Path } = resource;
      const endpoint = this.getEndpoint(resource.Type);
      url = `${endpoint}${Path}`;
    }
    const startTime = Date.now();
    return ajax({
      method,
      url,
      headers: this.customHeaderConfig(resource.Type),
      body,
      withCredentials: true,
    }).pipe(
      map((res) => ({
        ...res,
        responseTimes: Date.now() - startTime,
      })),
      map(this._handleAjaxSuccess),
      catchError((error) => throwError(this.handleAjaxError(error))),
      retryBackoff({
        initialInterval: INIT_INTERVAL_RETRY_MS, // INFO: exponent (1,2,4,8)
        maxRetries: MAX_RETRIES_API, // INFO: max retry api is three time
        shouldRetry: (error) => {
          if (error.code) {
            // INFO: retry api when status code of server > 500
            return error.code >= STATUS_RETRY_API;
          }
          return false;
        },
      })
    );
  };

  /**
   * Upload a file to Google Cloud Storage
   * @param url signed url from Document service
   * @param body
   * @param fileSizeLimit default size is 2 MB, for uploading attachment in Email is 10 MB
   */
  uploadFile = (url: string, body: File, fileSizeLimit = 2) => {
    const maxContentRange = MB_PER_BYTES * fileSizeLimit;
    const headers: any = {
      'x-goog-content-length-range': `0,${maxContentRange}`,
      'Content-Type': `${body.type}`,
    };
    return fromFetch(url, {
      method: 'PUT',
      headers,
      body,
    }).pipe(
      catchError(async (error) => {
        const xmlError = await error.response.text();

        const parser = new DOMParser();
        const result = parser.parseFromString(xmlError, 'text/xml');
        const errorMessage =
          result?.getElementsByTagName('Message')[0]?.innerHTML;
        const errorCode = result.getElementsByTagName('Code')[0]?.innerHTML;
        if (errorCode === 'EntityTooLarge') {
          throw new Error(
            getString('errorMessage.exceedFilesizeLimit', { size: 2 })
          );
        }

        throw new Error(errorMessage);
      })
    );
  };

  uploadCSVFile = (url: string, body: File, headerData: any = null) => {
    const headers: any = {
      ...(Boolean(headerData) && { ...headerData }),
    };

    return fromFetch(url, {
      method: 'PUT',
      headers,
      body,
    });
  };

  doGetAjaxRequest: apiRequestFn = (resource, delayTime = 0) =>
    timer(delayTime).pipe(
      switchMap((_) => this.callApiHandle(resource, API_METHOD.GET))
    );

  doPostAjaxRequest: apiRequestFn = (resource, body?) =>
    this.callApiHandle(resource, API_METHOD.POST, body);

  doPutAjaxRequest: apiRequestFn = (resource, body?) =>
    this.callApiHandle(resource, API_METHOD.PUT, body);

  doPatchAjaxRequest: apiRequestFn = (resource, body?) =>
    this.callApiHandle(resource, API_METHOD.PATCH, body);

  doDeleteAjaxRequest: apiRequestFn = (resource) =>
    this.callApiHandle(resource, API_METHOD.DELETE);

  doAjaxRequest = (
    resource: IResource | string,
    method: API_METHOD,
    body?: any
  ): Observable<any> => this.callApiHandle(resource, method, body);

  headerConfig = (): any => {
    const headers: any = {};
    headers['Content-Type'] = 'application/json';
    return headers;
  };

  _handleAjaxSuccess = (
    response: any
  ): ResponseModel<any> | Observable<ResponseModel<any>> => {
    const { status } = response;
    if (status >= 200 && status < 300) {
      let newResponse = {};
      if (response?.response?.length) {
        newResponse = {
          selectData: response.response,
          responseTimes: response.responseTimes,
        };
      } else {
        newResponse = {
          ...response.response,
          responseTimes: response.responseTimes,
        };
      }
      return ResponseModel.createSuccess(newResponse);
    }
    return ResponseModel.createError(status, response.response);
  };

  handleAjaxError = (error: any): any => {
    let status = 0;
    let message = '';
    let params;
    let errors;

    newrelic?.noticeError?.(error);

    if (error.response) {
      // server was received message, but response smt
      status = error.response?.status_code || error.status;
      message =
        error.response.message || this._createDefaultMessage(error.response);
      params = error.response.parameters;
      if (error.response.errors) {
        errors = error.response.errors;
      }

      if (status >= 200 && status < 300) {
        return this._handleAjaxSuccess(error.response);
      }

      const rawDataText = error.response;
      if (rawDataText && typeof rawDataText === 'string') {
        try {
          const errorObj = JSON.parse(rawDataText);
          if (errorObj) {
            message = errorObj.MESSAGE;
          }
        } catch (err) {
          message = (err as Error).toString();
        }
      }
    } else {
      status = error.status;
      message = CONSTANTS.netWorkErrorMessage;
    }

    return ResponseModel.createError(status, message, params, errors);
  };

  _getTokenFromType = (type: string): any => {
    switch (type) {
      case Type.Customer:
        return this._getCustomerToken();
      case Type.Admin:
        return this._getAdminToken();
      default:
        return this._getCustomerToken();
    }
  };

  _getCustomerToken = (): any => StorageGateway.doGetString(TokenType.Customer);

  _getAdminToken = (): any => StorageGateway.doGetString(TokenType.Admin);

  _createDefaultMessage = (errorList: any): string => {
    if (errorList) {
      return Object.entries(errorList)
        .map(([key, value]) => `${key} : ${value}`)
        .join(',');
    }
    return '';
  };
}

export default ApiGateway;

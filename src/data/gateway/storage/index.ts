import ResponseModel from '../../../models/response';
import StorageModel from '../../../models/storageModel';
import { TokenType, User } from '../../constants';

class StorageGateway {
  doGet = (key: string): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve, reject) => {
        const results = localStorage.getItem(key);
        if (results) {
          resolve(ResponseModel.createSuccess(results));
        } else {
          reject(ResponseModel.createError(400, 'No Data Found'));
        }
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(ResponseModel.createError(400, (error as Error).toString()));
      });
    }
  };

  doGetString = (key: string): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve, reject) => {
        const results = localStorage.getItem(key);

        if (results) {
          resolve(ResponseModel.createSuccess(results));
        } else {
          reject(ResponseModel.createError(400, 'No Data Found'));
        }
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(ResponseModel.createError(400, (error as Error).toString()));
      });
    }
  };

  doGetJson = (key: string): Promise<ResponseModel<StorageModel<any>>> => {
    try {
      return new Promise((resolve, reject) => {
        const results = localStorage.getItem(key);
        if (results) {
          const data = JSON.parse(results);
          resolve(ResponseModel.createSuccess(data));
        } else {
          reject();
        }
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        if (error) {
          reject(ResponseModel.createError(400, (error as Error).toString()));
        }
        resolve(ResponseModel.createSuccess('success'));
      });
    }
  };

  doUpdate = (key: string, value: any): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve, reject) => {
        if (key === User.Key) {
          const sessionToken = value.session;
          localStorage.setItem(TokenType.Admin, sessionToken);
          const result = localStorage.setItem(key, JSON.stringify(value));
          resolve(ResponseModel.createSuccess(result));
        } else {
          localStorage.setItem(key, value);
          resolve(ResponseModel.createSuccess('Success'));
        }
      });
    } catch (error) {
      return new Promise((resolve, reject): any => {
        if (error) {
          resolve(ResponseModel.createSuccess('fail'));
        }
        reject(ResponseModel.createError(400, (error as Error).toString()));
      });
    }
  };

  doUpdateJson = (key: string, value: any): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve, reject): any => {
        localStorage.setItem(key, JSON.stringify(value));
        resolve(ResponseModel.createSuccess('Successfully saved'));
        if (!value) {
          reject();
        }
      });
    } catch (error) {
      return new Promise((reject) => {
        reject(ResponseModel.createError(400, (error as Error).toString()));
      });
    }
  };

  doDelete = (key: string): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve) => {
        localStorage.removeItem(key);
        resolve(ResponseModel.createSuccess('Successfully Delete'));
      });
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(ResponseModel.createError(400, (error as Error).toString()));
        if (error) {
          resolve(ResponseModel.createError(400, (error as Error).toString()));
        }
      });
    }
  };

  doClean = (): Promise<ResponseModel<any>> => {
    try {
      return new Promise((resolve) => {
        localStorage.clear();
        resolve(ResponseModel.createSuccess('Successfully Clear'));
      });
    } catch (error) {
      return new Promise((reject): any => {
        reject(ResponseModel.createError(400, (error as Error).toString()));
      });
    }
  };
}

export default new StorageGateway();

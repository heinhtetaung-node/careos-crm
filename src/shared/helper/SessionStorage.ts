// eslint-disable-next-line max-classes-per-file
export enum SESSION_STORAGE_KEY {
  LIST_PHONE_NUMBER = 'LIST_PHONE_NUMBER',
  SUSPEND = 'SUSPEND',
  PREVIOUS_PAGE = 'PREVIOUS_PAGE',
}
abstract class ISessionStorage {
  abstract setItemByKey(key: string, value: any): void;

  abstract getItemByKey(key: string): any;

  abstract removeItemByKey(key: string): void;

  abstract clearSessionStorage(): void;
}
class SessionStorage extends ISessionStorage {
  private self = window.sessionStorage;

  setItemByKey(key: string, value: any) {
    this.self.setItem(key, value);
  }

  getItemByKey(key: string): any {
    return this.self.getItem(key);
  }

  removeItemByKey(key: string) {
    this.self.removeItem(key);
  }

  clearSessionStorage() {
    this.self.clear();
  }
}

export default SessionStorage;

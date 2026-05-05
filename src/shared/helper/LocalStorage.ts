// eslint-disable-next-line max-classes-per-file
export enum LOCALSTORAGE_KEY {
  USER_ID = 'USER_ID',
  LOCALE = 'LOCALE',
}
abstract class ILocalStorage {
  abstract setItemByKey(key: string, value: any): void;

  abstract getItemByKey(key: string): any;

  abstract removeItemByKey(key: string): void;

  abstract clearLocalStorage(): void;
}
class LocalStorage extends ILocalStorage {
  private self = window.localStorage;

  setItemByKey(key: string, value: any) {
    this.self.setItem(key, value);
  }

  getItemByKey(key: string): any {
    return this.self.getItem(key);
  }

  removeItemByKey(key: string) {
    this.self.removeItem(key);
  }

  clearLocalStorage() {
    this.self.clear();
  }
}

export default LocalStorage;

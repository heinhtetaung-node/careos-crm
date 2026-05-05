export type NewRelic = typeof window.newrelic;

class NewRelicSingleton {
  private static instance: NewRelicSingleton | null = null;

  private newrelic: NewRelic | null = null;

  private actionQueue: Array<(newrelic: NewRelic) => void> = [];

  private constructor(newrelic?: any) {
    this.init(newrelic);
  }

  public static getInstance(newrelic?: any): NewRelicSingleton {
    if (!NewRelicSingleton.instance) {
      NewRelicSingleton.instance = new NewRelicSingleton(newrelic);
    }
    return NewRelicSingleton.instance;
  }

  private init(newrelic?: any) {
    if (typeof window !== 'undefined') {
      this.waitForNewRelic(newrelic);
    }
  }

  private waitForNewRelic(_newrelic?: any) {
    let timeoutId: NodeJS.Timeout;
    const checkNewRelic = () => {
      if (window.newrelic) {
        clearTimeout(timeoutId);
        this.newrelic = window.newrelic;
        this.processQueue();
      } else if (_newrelic) {
        this.newrelic = _newrelic;
      } else {
        timeoutId = setTimeout(checkNewRelic, 100);
      }
    };

    checkNewRelic();
  }

  private processQueue() {
    if (this.newrelic) {
      this.actionQueue.forEach((action) => action(this.newrelic!));
      this.actionQueue = [];
    }
  }

  public queueAction(action: (newrelic: NewRelic) => void) {
    if (this.newrelic && this.newrelic.noticeError !== undefined) {
      action(this.newrelic);
    } else {
      this.actionQueue.push(action);
    }
  }

  public wrapMethod<T extends (...args: any[]) => any>(method: keyof NewRelic) {
    return (...args: Parameters<T>): ReturnType<T> =>
      this.queueAction((agent) =>
        (agent[method] as T)(...args)
      ) as ReturnType<T>;
  }

  // add wrapped methods
  public noticeError = this.wrapMethod<NewRelic['noticeError']>('noticeError');

  public setPageViewName =
    this.wrapMethod<NewRelic['setPageViewName']>('setPageViewName');

  public setCustomAttribute =
    this.wrapMethod<NewRelic['setCustomAttribute']>('setCustomAttribute');

  public addPageAction =
    this.wrapMethod<NewRelic['addPageAction']>('addPageAction');

  public interaction = this.wrapMethod<NewRelic['interaction']>('interaction');

  public setUserId = this.wrapMethod<NewRelic['setUserId']>('setUserId');

  public setUserAttributes = (user: {
    humanId: string;
    firstName: string;
    lastName: string;
    role: string;
    userId: string;
  }): void => {
    this.setUserId(user.humanId);
    this.setCustomAttribute('name', `${user.firstName} ${user.lastName}`);
    this.setCustomAttribute('role', user.role);
    this.setCustomAttribute('email', user.humanId);
    this.setCustomAttribute('userId', user.userId);
  };

  public isAgentReady(): boolean {
    return this.newrelic !== null;
  }

  // clear the instance for testing purposes
  public static clearInstance() {
    NewRelicSingleton.instance = null;
  }
}

export default NewRelicSingleton;

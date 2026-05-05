import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import LeadDetailUseCase from 'domain/usecases/leadDetail';
import { AddressUsage } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import { LeadAddressActionTypes } from 'presentation/redux/actions/leadDetail/addressModal';

import addAddressToLeadsEpic from '.';

jest.mock('domain/usecases/leadDetail');

const testScheduler = new TestScheduler(() => {
  // somehow assert the two objects are equal
  // e.g. with chai `expect(actual).deep.equal(expected)`
});

describe('Test addAddressToLeadsEpic', () => {
  let context: any = {};

  beforeEach(() => {
    context = {
      province: '',
      district: '',
      postCode: '',
      addressType: 'company',
      subDistrict: '',
    };
  });
  it('Should be called addAddressToLeadsEpic', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });

  it('Should be called addAddressToLeadsEpic with shipmentAddressIsSame false', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: false,
      billingAddressIsSame: true,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });

  it('Should be called addAddressToLeadsEpic with billingAddressIsSame false', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: false,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });
});

describe('Test addAddressToLeadsEpic call LeadDetailUseCase', () => {
  let context: any = {};

  beforeEach(() => {
    (
      LeadDetailUseCase.AddAddressToLeadsUseCase as jest.Mock
    ).mockImplementation(() => ({
      execute: (data: any) => {
        const error = {
          _message: new Error('Can not work'),
        };

        if (data.id === 'success') {
          return of([{ value: '' }]);
        }

        if (data.id === 'error') {
          return of({ type: AddressUsage.BILLING, failed: true, error });
        }
        return of([{ type: AddressUsage.BILLING, failed: true, error }]);
      },
    }));
    context = {
      province: '',
      district: '',
      postCode: '',
      addressType: 'company',
      subDistrict: '',
    };
  });

  it('We can check if the consumer called a method on the class instance', () => {
    // Show that mockClear() is working:
    expect(LeadDetailUseCase.AddAddressToLeadsUseCase).toHaveBeenCalled();
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });

  it('We can check if the consumer called a method on the class instance', () => {
    // Show that mockClear() is working:
    expect(LeadDetailUseCase.AddAddressToLeadsUseCase).toHaveBeenCalled();
    const input = {
      id: 'success',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });

  it('We can check if the consumer called a method on the class instance', () => {
    // Show that mockClear() is working:
    expect(LeadDetailUseCase.AddAddressToLeadsUseCase).toHaveBeenCalled();
    const input = {
      id: 'error',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    testScheduler.run(({ hot, expectObservable }) => {
      const action$ = hot('-a', {
        a: { type: LeadAddressActionTypes.ADD_ADDRESS, payload: input },
      });

      const output$ = addAddressToLeadsEpic(action$);

      expectObservable(output$).toBe('---a');
    });
  });
});

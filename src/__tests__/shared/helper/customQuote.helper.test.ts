import configureMockStore from 'redux-mock-store';

import {
  isMaxAge,
  isMinAge,
} from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import * as customQuoteActions from 'presentation/redux/actions/leadDetail/customQuote/index';
import { CustomQuoteActionTypes } from 'presentation/redux/actions/leadDetail/customQuote/index';
import { sub, add } from 'utils/datetime';

const mockStore = configureMockStore();
const store = mockStore();

describe('custom quote actions', () => {
  test('Dispatch create custom quote back', () => {
    const expectedAction = [
      {
        payload: {
          isBackHistory: true,
        },
        type: CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE_BACK,
      },
    ];

    store.dispatch(
      customQuoteActions.createCustomQuoteBack({ isBackHistory: true })
    );
    expect(store.getActions()).toEqual(expectedAction);
  });
});

describe('Test isMaxAge', () => {
  it('Should be max than 100 years', () => {
    expect(isMaxAge(sub(new Date(), { years: 101 }).toISOString())).toEqual(
      true
    );
  });
  it('Should be less than 100 years', () => {
    expect(isMaxAge(add(new Date(), { years: 50 }).toISOString())).toEqual(
      false
    );
  });
});

describe('Test isMinAge', () => {
  it('Should be less than 18 years', () => {
    expect(isMinAge(sub(new Date(), { years: 5 }).toISOString())).toEqual(true);
  });

  it('Should be max than 100 years', () => {
    expect(isMinAge(sub(new Date(), { years: 20 }).toISOString())).toEqual(
      false
    );
  });
});

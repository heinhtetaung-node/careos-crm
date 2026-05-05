import { formatInitialOrderData } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import { getMockOrder } from 'shared/helper/OrderMockData';

describe.skip('formatInitialOrderData', () => {
  it('returns formatted address', () => {
    const formattedData = {
      policy: {
        firstName: '',
        lastName: '',
        addressType: 'personal',
      },
      shipping: {
        firstName: 'test',
        lastName: 'testing',
        fullName: 'test testing',
        addressType: 'personal',
      },
      billing: {
        firstName: 'test',
        lastName: 'testing',
        fullName: 'testing testing',
        addressType: 'personal',
      },
      shipmentAddressIsSame: undefined,
      billingAddressIsSame: undefined,
    };
    const orderData = getMockOrder();
    const result = formatInitialOrderData(orderData.data as any);
    expect(result).toEqual(formattedData);
  });
  it('returns formatted address', () => {
    const formattedData = {
      policy: {
        address: 'Test Address',
        addressType: 'personal',
        firstName: 'Test',
        lastName: 'Address',
        district: 100100,
        fullName: 'Test Address',
        postCode: 10200,
        province: 100000,
        subDistrict: 100101,
        taxId: '121212',
      },
      shipping: {
        address: 'Test Address',
        addressType: 'personal',
        firstName: 'Test',
        lastName: 'Address',
        district: 100100,
        fullName: 'Test Address',
        postCode: 10200,
        province: 100000,
        subDistrict: 100101,
        taxId: '121212',
      },
      billing: {
        address: 'Test Address',
        addressType: 'personal',
        firstName: 'Test',
        lastName: 'Address',
        district: 100100,
        fullName: 'Test Address',
        postCode: 10200,
        province: 100000,
        subDistrict: 100101,
        taxId: '121212',
      },
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    const orderData = {
      data: {
        policyHolder: {
          firstName: 'Test',
          lastName: 'Address',
          policyAddress: {
            address: 'Test Address',
            addressType: 'personal',
            district: 100100,
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
            taxId: '121212',
            isBillingAddress: true,
            isShippingAddress: true,
          },
          shippingAddress: {
            address: 'Test Address',
            addressType: 'personal',
            firstName: 'Test',
            lastName: 'Address',
            district: 100100,
            fullName: 'Test Address',
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
            taxId: '121212',
          },
          billingAddress: {
            address: 'Test Address',
            addressType: 'personal',
            firstName: 'Test',
            lastName: 'Address',
            district: 100100,
            fullName: 'Test Address',
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
            taxId: '121212',
          },
        },
      },
      customer: {
        firstName: 'Test',
        lastName: 'Address',
      },
    };
    const result = formatInitialOrderData(orderData as any);
    expect(result).toEqual(formattedData);
  });
});

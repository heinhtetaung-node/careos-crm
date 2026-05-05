import buildValidationSchema from './helper';

describe('buildValidationSchema', () => {
  it('should return false when empty object is passed', async () => {
    const result = buildValidationSchema([
      'roles/sales',
      'roles/inbound',
    ]).isValidSync({});
    expect(result).toBeFalsy();
  });

  it('should return true when correct data is passed for sales role', async () => {
    const result = buildValidationSchema([
      'roles/sales',
      'roles/inbound',
    ]).isValidSync({
      teamRole: {
        value: 'roles/sales',
        name: 'roles/sales',
        title: 'Sales Agent',
      },
      teamName: 'Haakunamatata',
      product: {
        id: 1,
        title: 'Car Insurance',
        value: 'products/car-insurance',
      },
      leadType: {
        id: 0,
        leadType: 'LEAD_TYPE_NEW',
        title: 'New',
        value: 'new',
      },
      manager: {
        title: 'QA Manager -',
        value: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
      },
      supervisor: {
        title: 'QA Supervisor -',
        value: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
      },
    });
    expect(result).toBeTruthy();
  });

  it('should return false when incomplete data is passed for customer service', async () => {
    const result = buildValidationSchema([
      'roles/sales',
      'roles/inbound',
    ]).isValidSync({
      teamRole: {
        value: 'roles/customer-service',
        name: 'roles/customer-service',
        title: 'Customer Service Agent',
      },
      teamName: 'Haakunamatata',
      insurers: [],
      manager: {
        title: 'QA Manager -',
        value: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
      },
      supervisor: {
        title: 'QA Supervisor -',
        value: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
      },
    });
    expect(result).toBeFalsy();
  });

  it('should return true when complete data is passed for customer service', () => {
    const result = buildValidationSchema([
      'roles/sales',
      'roles/inbound',
    ]).isValid({
      teamRole: {
        value: 'roles/customer-service',
        name: 'roles/customer-service',
        title: 'Customer Service Agent',
      },
      teamName: 'Haakunamatata',
      insurers: [
        {
          name: 'insurers/44',
          shortnameEn: 'Jaymart Insurance',
          displayName: 'Jaymart Insurance Public Company Limited',
        },
      ],
      manager: {
        title: 'QA Manager -',
        value: 'users/a95c20c5-d1d5-44f3-ac9d-aad9c097e058',
      },
      supervisor: {
        title: 'QA Supervisor -',
        value: 'users/a4c2103d-20b1-409f-a772-059afa690f53',
      },
    });
    expect(result).toBeTruthy();
  });
});

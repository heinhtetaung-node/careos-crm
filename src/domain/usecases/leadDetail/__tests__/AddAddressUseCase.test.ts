import AddAddressToLeadsUseCase from '../AddAddressUseCase';

describe('Test AddAddressToLeadsUseCase', () => {
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

  it('Should be AddAddressToLeadsUseCase.validate is true', () => {
    const repo = new AddAddressToLeadsUseCase();
    expect(repo.validate()).toEqual(true);
  });

  it('Should be AddAddressToLeadsUseCase.execute called', () => {
    const input = {
      id: 'success',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(1);
    });
  });

  it('Should be AddAddressToLeadsUseCase.execute called with shipmentAddressIsSame is false', () => {
    const input = {
      id: 'success',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: false,
      billingAddressIsSame: true,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(2);
    });
  });

  it('Should be AddAddressToLeadsUseCase.execute called with billingAddressIsSame is false', () => {
    const input = {
      id: 'success',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: false,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(2);
    });
  });

  it('Should be AddAddressToLeadsUseCase.execute called with error', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(1);
      expect(res[0].failed).toEqual(true);
    });
  });

  it('Should be AddAddressToLeadsUseCase.execute called with shipmentAddressIsSame is false and error', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: false,
      billingAddressIsSame: true,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(2);
      expect(res[0].failed).toEqual(true);
      expect(res[1].failed).toEqual(true);
    });
  });

  it('Should be AddAddressToLeadsUseCase.execute called with billingAddressIsSame is false and error', () => {
    const input = {
      id: '',
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: false,
    };
    const repo = new AddAddressToLeadsUseCase();
    const data = repo.execute(input);
    data.subscribe((_res) => {
      expect(_res).toBe(false);
    });
    expect(typeof data.subscribe).toBe('function');
    data.subscribe((res) => {
      expect(res.length).toEqual(2);
      expect(res[0].failed).toEqual(true);
      expect(res[1].failed).toEqual(true);
    });
  });
});

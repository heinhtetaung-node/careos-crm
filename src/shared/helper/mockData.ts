export default class MockData {
  static getProducts() {
    return [
      { id: 1, title: 'Car Insurance' },
      { id: 2, title: 'Health Insurance' },
      { id: 3, title: 'Life Insurance' },
    ];
  }

  static getLeadTypes() {
    return [
      { id: 1, title: 'New' },
      { id: 2, title: 'Renewal' },
      { id: 3, title: 'Retainer' },
    ];
  }

  static getManagers() {
    return [
      { id: 1, title: 'Siriwan' },
      { id: 2, title: 'Somsi' },
      { id: 3, title: 'Prapat' },
    ];
  }

  static getTeamNames() {
    return [
      { id: 1, title: 'Team A' },
      { id: 2, title: 'Team B' },
      { id: 3, title: 'Team C' },
    ];
  }

  static getUserRoles() {
    return [
      { id: 1, title: 'Admin' },
      { id: 2, title: 'Contact Center Manager' },
      { id: 3, title: 'Contact Center Supervisor' },
      { id: 4, title: 'Contact Center Sale Agent' },
      { id: 5, title: 'Contact Center Inbound Agen' },
    ];
  }

  static getCustomerProfiles() {
    return [
      {
        createdOn: '30/06/2023 (08:11:36 AM)',
        customerID: 'C1033967',
        email: 'pactum@rabbit.co.th',
        id: 'customers/f3c070f4-6173-453f-b484-a1073066ef3f',
        name: 'Test Test',
        phoneNumber: '+66999999999',
      },
      {
        createdOn: '30/06/2023 (08:10:47 AM)',
        customerID: 'C1033966',
        email: 'pactum@rabbit.co.th',
        id: 'customers/9c4c33da-911e-4dbc-93ad-ad69448f347d',
        name: 'Pactum testing',
        phoneNumber: '+66999999999',
      },
      {
        createdOn: '29/06/2023 (11:26:52 AM)',
        customerID: 'C1033964',
        email: 'pactum@rabbit.co.th',
        id: 'customers/3fe26226-efb2-40b5-9771-17f211682e69',
        name: 'Pactum testing',
        phoneNumber: '+660613240362',
      },
    ];
  }

  static getCarePays() {
    return [
      {
        id: 'L123123',
        installment: 1,
        amount: '1,22,222',
        status: 'Paid',
        paymentType: 'full payment',
        dueDate: '12/12/12',
        paymentDate: '12/12/12',
        paymentChannel: 'Online Check Out',
        accountRecipient: 'Hxn',
        customerName: 'Testing',
        customerPhone: '1234xxxxxx',
        license: '123-123-123d',
        ciTeam: 'Siriwan',
        appointmentDate: '12/12/12',
        createDate: '12/12/12',
      },
      {
        id: 'L123123',
        installment: 2,
        amount: '1,22,222',
        status: 'Pending',
        paymentType: 'full payment',
        dueDate: '12/12/12',
        paymentDate: '12/12/12',
        paymentChannel: 'Online Check Out',
        accountRecipient: 'Hxn',
        customerName: 'Testing',
        customerPhone: '1234xxxxxx',
        license: '123-123-123d',
        ciTeam: 'Siriwan',
        appointmentDate: '12/12/12',
        createDate: '12/12/12',
      },
    ];
  }
}

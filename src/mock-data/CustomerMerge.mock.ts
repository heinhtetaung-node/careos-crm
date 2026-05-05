const CustomerMergeMock = {
  customer1: {
    customer: {
      humanId: 'C1033966',
      title: 'Mr.',
      firstName: 'Pactum',
      lastName: 'testing',
      phone: '+66999999999',
      email: 'pactum@rabbit.co.th',
    },
    leads: [
      {
        id: 'leads/020170be-8cf8-44cb-b80a-f212b053df9a',
        humanId: 'L9904669',
      },
      {
        id: 'leads/95e9561d-57b9-42ac-9ea0-bcd13b25989e',
        humanId: 'L9904668',
      },
    ],
    orders: [
      {
        id: 'orders/cfeffc82-167c-4514-81b3-b8aec7ef40fe',
        humanId: 'L9904331',
      },
      {
        id: 'orders/a877b3b4-a5af-4879-a160-0898363e1587',
        humanId: 'L9903249',
      },
      {
        id: 'orders/43d1a510-815e-4bf2-8773-1e0b539673d3',
        humanId: 'L9904572',
      },
    ],
  },
  customer2: {
    customer: {
      humanId: 'C1033955',
      title: 'Mr.',
      firstName: 'Daniel',
      lastName: 'Lackson',
      phone: '+66999999999',
      email: 'daniel.l@rabbit.co.th',
    },
    leads: [
      { id: 'leads/0ad1fbe2-9e95-41dd-83d8-7e2567cd90d7', humanId: 'L9904667' },
      { id: 'leads/85893cb7-d48e-490b-9d25-8219f0bb15d8', humanId: 'L9904666' },
    ],
    orders: [
      {
        id: 'orders/faf7c168-aba3-4476-b093-ba6955926b61',
        humanId: 'L9904609',
      },
      {
        id: 'orders/64360180-8e3b-4c6b-9f74-233180f78d46',
        humanId: 'L9904610',
      },
    ],
  },
};

export default CustomerMergeMock;

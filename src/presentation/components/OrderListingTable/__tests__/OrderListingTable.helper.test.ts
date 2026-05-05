import OrdersAllReducer, {
  formatOrdersAll,
} from 'presentation/redux/reducers/orders/all';
import OrdersDocumentReducer from 'presentation/redux/reducers/orders/documents';
import {
  MotoTypes,
  OrderDocumentStatus,
  OrderQcStatus,
} from 'shared/constants/orderType';
import { add } from 'utils/datetime';

import {
  formatDocumentStatus,
  formatQCStatus,
  formatSubmissionStatus,
  formatApprovalStatus,
  formatMotoType,
  formatOrderItem,
  formatOrderDocuments,
  formatNumber,
  getAgentName,
  formatCustomerName,
  formatOrderSubmission,
  formatPrintingStatus,
  getStatusValue,
  getShipmentStatus,
  getStatusFromCodeStatus,
  getColorCodeMapping,
  formatPolicyStartDate,
} from '../helper';

// eslint-disable-next-line import/prefer-default-export
export const orderDocumentInput = [
  {
    order: {
      id: '3b9622cf',
      name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5',
      lead: '',
      createTime: '2021-10-01T03:03:26.162808Z',
      updateTime: '2021-10-14T02:58:11.548918Z',
      convertBy: '',
      supervisor: '',
      isCancelled: false,
      isFullyPaid: true,
      product: 'products/car-insurance',
      invoicePrice: '2323',
      humanId: 'O70',
      discounts: [],
      payment: '',
      customer: 'customers/887f0e75-50cf-47a0-84b7-d7b348d4de25',
      schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
      data: {
        carDashCam: true,
        carLicensePlate: 'ก1-9999',
        carModified: false,
        carSubModelYear: 2,
        carUsageType: 'personal',
        chassisNumber: 'CH1212121212',
        convertBy: 'users/1ca66baf-8266-4f85-9adf-cb1860089bdb',
        engineNumber: 'EN121212121',
        policyHolder: {
          firstName: 'Rikesh',
          gender: 'm',
          lastName: 'Shrestha',
          title: 'Mr.',
        },
        registeredProvince: 22222,
      },
      documentBy: '',
      documentStatus: OrderDocumentStatus.PENDING,
      qcBy: '',
      qcStatus: 'QC_STATUS_PARTIALLY_REJECTED',
      submissionStatus: 'SUBMISSION_STATUS_UNSPECIFIED',
      approvalStatus: 'APPROVAL_STATUS_UNSPECIFIED',
    },
    customer: {
      name: 'customers/887f0e75-50cf-47a0-84b7-d7b348d4de25',
      createTime: '2021-09-30T07:08:50.984376552Z',
      updateTime: '2021-09-30T07:08:50.984376552Z',
      deleteTime: null,
      createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
      humanId: 'C43',
      firstName: 'Rikesh',
      lastName: 'Shrestha',
      email: '',
      phone: '+66943739024',
    },
    items: [
      {
        name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5/items/851a867b-d8ba-4116-8828-0c6efa83ca49',
        product: 'products/car-insurance',
        package: 'package/232323232',
        price: '232323',
        grossPremium: '2323232',
        insurer: 'insurers/38',
        netPremium: '0',
        vatPercent: 0,
        vatAmount: '223232323',
        stampDutyPercentage: 0,
        stampDuty: '0',
        addons: [],
        documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
        qcStatus: 'ITEM_QC_STATUS_UNSPECIFIED',
        submissionStatus: 'ITEM_SUBMISSION_STATUS_UNSPECIFIED',
        approvalStatus: 'ITEM_APPROVAL_STATUS_UNSPECIFIED',
        discounts: [],
        motorItemType: 'MOTOR_TYPE_2_PLUS',
        humanId: 'O324562_2',
        isCancelled: false,
      },
    ],
  },
];

const documentInputs = [
  'DOCUMENT_STATUS_UNSPECIFIED',
  'DOCUMENT_STATUS_PENDING',
  'DOCUMENT_STATUS_COMPLETE',
  'DOCUMENT_STATUS_FAILED',
  'Others',
  undefined,
];

const documentOutputs = [
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: 'documentStatus.pending',
    status: 'PENDING',
    type: 'text',
  },
  {
    label: 'documentStatus.complete',
    status: 'COMPLETE',
    type: 'text',
  },
  {
    label: 'documentStatus.failed',
    status: 'FAILED',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
];

[0, 1, 2, 3, 4].forEach((index: number) => {
  test(`Test formatDocumentStatus return correct value ${index}`, () => {
    expect(formatDocumentStatus(documentInputs[index])).toEqual(
      documentOutputs[index]
    );
  });
});

const qcInputs = [
  OrderQcStatus.PENDING,
  OrderQcStatus.PREAPPROVED,
  OrderQcStatus.APPROVED,
  OrderQcStatus.REJECTED,
  'Other',
  undefined,
];

const qcOutputs = [
  {
    label: 'qcStatus.pending',
    status: 'PENDING',
    type: 'text',
  },
  {
    label: 'qcStatus.preApproved',
    status: 'PREAPPROVED',
    type: 'text',
  },
  {
    label: 'qcStatus.approved',
    status: 'APPROVED',
    type: 'text',
  },
  {
    label: 'qcStatus.rejected',
    status: 'REJECTED',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
];

[0, 1, 2, 3, 4, 5].forEach((index: number) => {
  test(`Test formatQCStatus return correct value ${index}`, () => {
    expect(formatQCStatus(qcInputs[index])).toEqual(qcOutputs[index]);
  });
});

const submissionInputs = [
  'ITEM_SUBMISSION_STATUS_UNSPECIFIED',
  'ITEM_SUBMISSION_STATUS_PENDING',
  'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
  'ITEM_SUBMISSION_STATUS_SUBMITTED',
  'Other',
  undefined,
  'ITEM_SUBMISSION_STATUS_MISSED_DEADLINE',
];

const submissionOutputs = [
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: 'submissionStatus.pending',
    status: 'PENDING',
    type: 'text',
  },
  {
    label: 'submissionStatus.preSubmitted',
    status: 'PRESUBMITTED',
    type: 'text',
  },
  {
    label: 'submissionStatus.submitted',
    status: 'SUBMITTED',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: '-',
    status: 'text',
    type: 'text',
  },
  {
    label: 'submissionStatus.missedDeadline',
    status: 'MISSED_DEADLINE',
    type: 'text',
  },
];

[0, 1, 2, 3, 4, 5, 6].forEach((index: number) => {
  test(`Test formatSubmissionStatus return correct value ${index}`, () => {
    expect(formatSubmissionStatus(submissionInputs[index])).toEqual(
      submissionOutputs[index]
    );
  });
});

test(`Test formatSubmissionStatus submitted add-ons`, () => {
  expect(formatSubmissionStatus(submissionInputs[3], true)).toMatchObject({
    label: 'submissionStatus.addOns.submitted',
  });
});

const approvalInputs = [
  'ITEM_APPROVAL_STATUS_PENDING',
  'ITEM_APPROVAL_STATUS_APPROVED',
  'ITEM_APPROVAL_STATUS_REJECTED',
  'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
  'Other',
  undefined,
  'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM',
];

const approvalOutputs = [
  {
    label: 'approveStatus.pending',
    status: 'PENDING',
    type: 'text',
  },
  {
    label: 'approveStatus.approved',
    status: 'APPROVED',
    type: 'text',
  },
  {
    label: 'approveStatus.rejected',
    status: 'REJECTED',
    type: 'text',
  },
  {
    label: 'approveStatus.policyUploaded',
    status: 'POLICY_UPLOADED',
    type: 'text',
  },
  {
    label: 'approveStatus.unspecified',
    status: 'UNSPECIFIED',
    type: 'text',
  },
  {
    label: 'approveStatus.unspecified',
    status: 'UNSPECIFIED',
    type: 'text',
  },
  {
    label: 'text.submissionProblem',
    status: 'SUBMISSION_PROBLEM',
    type: 'text',
  },
];

[0, 1, 2, 3, 4, 5, 6].forEach((index: number) => {
  test(`Test formatApprovalStatus return correct value ${index}`, () => {
    expect(formatApprovalStatus(approvalInputs[index])).toEqual(
      approvalOutputs[index]
    );
  });
});

test(`Test formatApprovalStatus approved add-ons`, () => {
  expect(formatApprovalStatus(approvalInputs[1], true)).toMatchObject({
    label: 'approveStatus.addOns.approved',
  });
});

test(`Test formatApprovalStatus policy uploaded add-ons`, () => {
  expect(formatApprovalStatus(approvalInputs[3], true)).toMatchObject({
    label: 'approveStatus.addOns.policyUploaded',
  });
});

const printingStats = [
  'ITEM_PRINTING_AND_SHIPPING_STATUS_DOCUMENT_UPLOAD',
  'ITEM_PRINTING_AND_SHIPPING_STATUS_PENDING',
  'ITEM_PRINTING_AND_SHIPPING_STATUS_WAITING_PAYMENT',
  'Other',
  undefined,
  'ITEM_PRINTING_AND_SHIPPING_STATUS_PRINTED',
];

const printingOutputs = [
  {
    label: 'printingAndShippingStatus.docUpload',
    status: 'WAITING_UPLOAD',
    type: 'text',
  },
  {
    label: 'printingAndShippingStatus.pending',
    status: 'IN_PROGRESS',
    type: 'text',
  },
  {
    label: 'printingAndShippingStatus.waitingPayment',
    status: 'IN_PROGRESS',
    type: 'text',
  },
  {
    label: 'printingAndShippingStatus.unspecified',
    status: 'UNSPECIFIED',
    type: 'text',
  },
  {
    label: 'printingAndShippingStatus.unspecified',
    status: 'UNSPECIFIED',
    type: 'text',
  },
  {
    label: 'printingAndShippingStatus.printed',
    status: 'COMPLETE',
    type: 'text',
  },
];

[0, 1, 2, 3, 4, 5].forEach((index: number) => {
  test(`Test formatPrintingStatus return correct value ${index}`, () => {
    expect(formatPrintingStatus(printingStats[index])).toEqual(
      printingOutputs[index]
    );
  });
});

const motoTypeInput = [
  MotoTypes.MOTOR_TYPE_1,
  MotoTypes.MOTOR_TYPE_2,
  MotoTypes.MOTOR_TYPE_2_PLUS,
  MotoTypes.MOTOR_TYPE_3,
  MotoTypes.MOTOR_TYPE_3_PLUS,
  MotoTypes.MOTOR_TYPE_COMPULSORY,
  MotoTypes.MOTOR_TYPE_UNSPECIFIED,
  MotoTypes.MOTOR_TYPE_MANDATORY,
  '',
];

const motoTypeOutput = [
  'motoType.type1',
  'motoType.type2',
  'motoType.type2Plus',
  'motoType.type3',
  'motoType.type3Plus',
  'motoType.typeMandatory',
  'motoType.typeUnspecified',
  'motoType.typeMandatory',
  '',
];

[0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((index: number) => {
  test(`Test formatMotoType return correct value ${index}`, () => {
    expect(formatMotoType(motoTypeInput[index])).toEqual(motoTypeOutput[index]);
  });
});

test('Test formatOrderItem return correct value', () => {
  const input1 = {
    addons: [],
    approvalStatus: 'ITEM_APPROVAL_STATUS_UNSPECIFIED',
    discounts: [],
    documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
    grossPremium: '2323232',
    motorItemType: 'MOTOR_TYPE_2_PLUS',
    name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5/items/851a867b-d8ba-4116-8828-0c6efa83ca49',
    netPremium: '0',
    package: 'package/232323232',
    price: '232323',
    product: 'products/car-insurance',
    qcStatus: 'ITEM_QC_STATUS_UNSPECIFIED',
    stampDuty: '0',
    stampDutyPercentage: 0,
    submissionStatus: 'ITEM_SUBMISSION_STATUS_UNSPECIFIED',
    vatAmount: '223232323',
    vatPercent: 0,
    insurer: 'insurers/38',
    humanId: 'O740-1',
    isCancelled: true,
  };
  const input2 = {
    firstName: 'Rikesh',
    gender: 'm',
    lastName: 'Shrestha',
    title: 'Mr.',
  };
  const output = {
    ...input1,
    premium: '23,232.32',
    policyHolder: 'Rikesh Shrestha',
    productType: formatMotoType(input1?.motorItemType),
    documentsStatus: formatDocumentStatus(input1?.documentStatus),
    qcStatus: formatQCStatus(input1?.qcStatus),
    submissionStatus: formatSubmissionStatus(input1?.submissionStatus),
    approvalStatus: formatApprovalStatus(input1?.approvalStatus),
    insurer: 'insurers/38',
    insurancePackageType: 'motoType.type2Plus',
    policyId: 'O740-1',
    policyRef: 'O740-1',
  };
  expect(formatOrderItem(input1, input2)).toMatchObject(output);
});

test('Test formatOrderDocuments return correct value', () => {
  const output = [
    {
      approvalStatus: {
        label: 'approveStatus.unspecified',
        status: 'UNSPECIFIED',
        type: 'text',
      },
      policyStartDate: '-',
      timeSinceDocumentsComplete: '-',
      customer: 'Rikesh Shrestha',
      insuredPerson: 'Rikesh Shrestha',
      licensePlate: 'ก1-9999',
      convertBy: '',
      orderCreated: '2021-10-01T03:03:26.162808Z',
      insurancePackage: ['mototype.type2plus'],
      documentStatus: {
        label: 'documentStatus.pending',
        status: 'PENDING',
        type: 'text',
      },
      id: '3b9622cf-b4c9-4fd7-8952-aa629d36d3d5',
      orderId: 'O70',
      products: [
        {
          addons: [],
          approvalStatus: {
            label: 'approveStatus.unspecified',
            status: 'UNSPECIFIED',
            type: 'text',
          },
          discounts: [],
          documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
          documentsStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          grossPremium: '2323232',
          insurer: 'insurers/38',
          humanId: 'O324562_2',
          isCancelled: false,
          motorItemType: 'MOTOR_TYPE_2_PLUS',
          insurancePackageType: 'motoType.type2Plus',
          name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5/items/851a867b-d8ba-4116-8828-0c6efa83ca49',
          netPremium: '0',
          package: 'package/232323232',
          policyHolder: 'Rikesh Shrestha',
          policyRef: 'O324562_2',
          policyId: 'O324562_2',
          premium: '23,232.32',
          price: '232323',
          product: 'products/car-insurance',
          productType: 'motoType.type2Plus',
          qcStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          stampDuty: '0',
          stampDutyPercentage: 0,
          submissionStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          vatAmount: '223232323',
          vatPercent: 0,
        },
      ],
      qcStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      submissionStatus: [
        [
          'mototype.type2plus',
          {
            label: '-',
            status: 'text',
            type: 'text',
          },
        ],
      ],
      assignedTo: '-',
      website: 'Motor',
      paymentTerms: 'One-time',
      paymentStatus: 'tableListing.fullyPaid',
      totalInvoiced: '23.23',
      totalNetPremium: '2,000',
      leadSource: '',
      isStar: false,
      isChecked: false,
    },
  ];
  expect(
    formatOrderDocuments(orderDocumentInput, 'documentAgent')
  ).toMatchObject(output);
});

test('Test format order all successfully in 1st case', () => {
  const exampleListOrder: any = [
    {
      order: {
        name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5',
        lead: '',
        createTime: '2021-10-01T03:03:26.162808Z',
        updateTime: '2021-10-14T02:58:11.548918Z',
        convertBy: '',
        supervisor: '',
        isCancelled: false,
        product: 'products/car-insurance',
        invoicePrice: '2323',
        humanId: 'O70',
        discounts: [10000, 20000, 30000],
        payment: '',
        customer: 'customers/887f0e75-50cf-47a0-84b7-d7b348d4de25',
        schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
        data: {
          carDashCam: true,
          carModified: false,
          carSubModelYear: 2,
          carUsageType: 'personal',
          chassisNumber: 'CH1212121212',
          convertBy: 'users/1ca66baf-8266-4f85-9adf-cb1860089bdb',
          engineNumber: 'EN121212121',
          policyHolder: {
            firstName: 'Rikesh',
            gender: 'm',
            lastName: 'Shrestha',
            title: 'Mr.',
          },
          registeredProvince: 22222,
        },
        documentBy: '',
        documentStatus: 'DOCUMENT_STATUS_INPROGRESS',
        qcBy: '',
        qcStatus: 'QC_STATUS_PARTIALLY_REJECTED',
        submissionStatus: 'SUBMISSION_STATUS_UNSPECIFIED',
        approvalStatus: 'APPROVAL_STATUS_UNSPECIFIED',
      },
      customer: {
        name: 'customers/887f0e75-50cf-47a0-84b7-d7b348d4de25',
        createTime: '2021-09-30T07:08:50.984376552Z',
        updateTime: '2021-09-30T07:08:50.984376552Z',
        deleteTime: null,
        createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
        humanId: 'C43',
        firstName: 'Rikesh',
        lastName: 'Shrestha',
        email: '',
        phone: '+66943739024',
      },
      items: [
        {
          name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5/items/851a867b-d8ba-4116-8828-0c6efa83ca49',
          product: 'products/car-insurance',
          package: 'package/232323232',
          price: '232323',
          grossPremium: '2323232',
          insurer: 'insurers/38',
          netPremium: '0',
          vatPercent: 0,
          vatAmount: '223232323',
          stampDutyPercentage: 0,
          stampDuty: '0',
          addons: [],
          documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
          qcStatus: 'ITEM_QC_STATUS_UNSPECIFIED',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_UNSPECIFIED',
          approvalStatus: 'ITEM_APPROVAL_STATUS_UNSPECIFIED',
          discounts: [],
          motorItemType: 'MOTOR_TYPE_2_PLUS',
          humanId: 'O324562_2',
          isCancelled: true,
        },
      ],
    },
  ];

  const outputFormatOrderAll = [
    {
      id: '3b9622cf-b4c9-4fd7-8952-aa629d36d3d5',
      orderId: 'O70',
      customer: 'Rikesh Shrestha',
      paymentStatus: 'tableListing.notFullyPaid',
      discount: '600.00',
      insuredPerson: 'Rikesh Shrestha',
      documentStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      qcStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      submissionStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      approvalStatus: {
        label: 'approveStatus.unspecified',
        status: 'UNSPECIFIED',
        type: 'text',
      },
      leadSource: '',
      isStar: false,
      products: [
        {
          addons: [],
          approvalStatus: {
            label: 'approveStatus.unspecified',
            status: 'UNSPECIFIED',
            type: 'text',
          },
          discounts: [],
          documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
          documentsStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          grossPremium: '2323232',
          insurer: 'insurers/38',
          humanId: 'O324562_2',
          isCancelled: true,
          motorItemType: 'MOTOR_TYPE_2_PLUS',
          insurancePackageType: 'motoType.type2Plus',
          name: 'orders/3b9622cf-b4c9-4fd7-8952-aa629d36d3d5/items/851a867b-d8ba-4116-8828-0c6efa83ca49',
          netPremium: '0',
          package: 'package/232323232',
          policyHolder: 'Rikesh Shrestha',
          policyRef: 'O324562_2',
          policyId: 'O324562_2',
          premium: '23,232.32',
          price: '232323',
          product: 'products/car-insurance',
          productType: 'motoType.type2Plus',
          qcStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          stampDuty: '0',
          stampDutyPercentage: 0,
          submissionStatus: {
            label: '-',
            status: 'text',
            type: 'text',
          },
          vatAmount: '223232323',
          vatPercent: 0,
        },
      ],
      isChecked: false,
    },
  ];
  expect(formatOrdersAll(exampleListOrder)).toMatchObject(outputFormatOrderAll);
  exampleListOrder[0].order.isFullyPaid = true;
  outputFormatOrderAll[0].paymentStatus = 'tableListing.fullyPaid';
  expect(formatOrdersAll(exampleListOrder)).toMatchObject(outputFormatOrderAll);
});

test('Test format order submission successfully with correct value', () => {
  const exampleOrderSubmissionList = [
    {
      item: {
        name: 'orders/60345f86-d9e3-4077-a47d-b632e4542ef8/items/387a724f-95c1-4e1f-a10b-2129b56f6457',
        createTime: '2021-11-19T17:13:13.122273267Z',
        updateTime: '2021-11-19T17:13:13.122273267Z',
        deleteTime: null,
        product: 'products/car-insurance',
        package: 'package/947314',
        price: '9667',
        grossPremium: 0,
        netPremium: '0',
        vatPercent: 0,
        vatAmount: '0',
        stampDutyPercentage: 0,
        stampDuty: '0',
        addons: [],
        documentStatus: 'ITEM_DOCUMENT_STATUS_UNSPECIFIED',
        qcStatus: 'ITEM_QC_STATUS_UNSPECIFIED',
        submissionStatus: 'ITEM_SUBMISSION_STATUS_UNSPECIFIED',
        approvalStatus: 'ITEM_APPROVAL_STATUS_UNSPECIFIED',
        discounts: [],
        motorItemType: 'MOTOR_TYPE_COMPULSORY',
        isCancelled: false,
        submissionBy: '',
        approvalBy: '',
        submitDate: '0001-01-01T07:06:40Z',
        insurer: 'insurer/37',
        humanId: '1234',
      },
      submissionAgent: null,
      approvalAgent: null,
      attributes: {
        policyHolder: {
          dateOfBirth: '1987-01-21',
          firstName: 'Citra test',
          gender: 'f',
          lastName: 'TestQA',
          nationalID: '1816524775067',
          title: 'Ms.',
        },
        sourceDisplayName: '72rf-sales-flow-api',
      },
      insurer: {
        name: 'insurers/37',
        displayName: 'AIG Insurance',
        shortnameEn: 'AIG Insurance',
        shortnameTh: 'เอไอจี ประกันภัย',
        rating: 0,
        order: 0,
      },
    },
  ];
  const outputSubmission = [
    {
      approvalStatus: {
        label: 'approveStatus.unspecified',
        status: 'UNSPECIFIED',
        type: 'text',
      },
      assignedTo: '-',
      createdOn: '01/01/0001 (07:06:40)',
      insuredPerson: 'Citra test TestQA',
      documentsStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      id: 'orders/60345f86-d9e3-4077-a47d-b632e4542ef8/items/387a724f-95c1-4e1f-a10b-2129b56f6457',
      orderId: '1234',
      insuranceCategory: 'Motor Insurance',
      insuranceCompany: 'AIG Insurance',
      isChecked: false,
      isStar: true,
      convertBy: '',
      licensePlate: 'nn-0003',
      policyStartDate: '-',
      timeSinceQCApproved: '-',
      paymentStatus: '-',
      paymentTerms: 'One-time',
      insuranceType: 'mototype.typemandatory',
      qcStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      submissionStatus: {
        label: '-',
        status: 'text',
        type: 'text',
      },
      isCancelled: false,
      grossPremium: Number('0.00').toFixed(2),
      orderCreated: '2021-11-19T17:13:13.122273267Z',
      totalNetPremium: '0',
    },
  ];
  expect(
    formatOrderSubmission(exampleOrderSubmissionList, 'submissionAgent')
  ).toEqual(outputSubmission);
});

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

test('Test format number total', () => {
  const number = '28';
  expect(formatNumber(number)).toEqual(28);
});

test('Test order all successfully', () => {
  const state = {
    data: [],
    isFetching: false,
    success: true,
    status: '',
    totalItem: 0,
    tableType: '',
    pageState: {
      pageSize: 15,
      currentPage: 1,
    },
  };
  const action = {
    type: '[Order] GET_ORDERS_ALL_SUCCESS ',
    payload: {
      data: {
        orders: [],
        total: 10,
      },
    },
  };

  const result = {
    tableType: '',
    pageState: {
      pageSize: 15,
      currentPage: 1,
    },
    data: [],
    status: '',
    success: true,
    isFetching: false,
    totalItem: 10,
  };
  expect(OrdersAllReducer(state, action)).toEqual(result);
});

test('Test reducer order document successfully', () => {
  const state = {
    data: [],
    isFetching: false,
    success: true,
    status: '',
    totalItem: 0,
    tableType: '',
    pageState: {
      pageSize: 15,
      currentPage: 1,
    },
  };
  const action = {
    type: '[Order] GET_ORDERS_DOCUMENTS_SUCCESS ',
    payload: {
      data: {
        orders: [],
        total: '15',
      },
    },
  };

  const result = {
    tableType: '',
    pageState: {
      pageSize: 15,
      currentPage: 1,
    },
    data: [],
    status: '',
    success: true,
    isFetching: false,
    totalItem: 15,
  };
  expect(OrdersDocumentReducer(state, action)).toEqual(result);
});

test('Test getAgentName run well 1st', () => {
  expect(getAgentName(null)).toEqual('-');
});

test('Test getAgentName run well 2nd', () => {
  const agent = {
    firstName: 'Duy',
    lastName: 'Nguyen',
  };
  expect(getAgentName(agent)).toEqual(agent);
});

test('Test formatCustomerName run well 1st', () => {
  expect(
    formatCustomerName({
      firstName: '',
      lastName: '',
    })
  ).toEqual('-');
});

test('Test formatCustomerName run well 2nd', () => {
  expect(
    formatCustomerName({
      firstName: 'Duy',
      lastName: 'Nguyen',
    })
  ).toEqual('Duy Nguyen');
});
test('Test getStatusValue to return correct colored value', () => {
  expect(getStatusValue('COMPLETE')).toEqual('success');
  expect(getStatusValue('ERROR')).toEqual('danger');
  expect(getStatusValue('IN_PROGRESS')).toEqual('warning');
  expect(getStatusValue('random value')).toEqual('normal');
  expect(getStatusValue('PRESUBMITTED')).toEqual('warning');
  expect(getStatusValue('PREAPPROVED')).toEqual('warning');
});

describe('test getShipmentStatus', () => {
  test('should return delivered if passed SHIPMENT_STATUS_DELIVERED', () => {
    expect(getShipmentStatus('SHIPMENT_STATUS_DELIVERED')).toEqual(
      'shipmentStatus.delivered'
    );
  });

  test('should return delivery failed if passed SHIPMENT_STATUS_DELIVERY_FAILED', () => {
    expect(getShipmentStatus('SHIPMENT_STATUS_DELIVERY_FAILED')).toEqual('');
  });

  test('should return shipped out if passed SHIPMENT_STATUS_SHIPPED_OUT', () => {
    expect(getShipmentStatus('SHIPMENT_STATUS_SHIPPED_OUT')).toEqual(
      'shipmentStatus.shippedOut'
    );
  });

  test('should return not shipped if passed SHIPMENT_STATUS_NOT_SHIPPED', () => {
    expect(getShipmentStatus('SHIPMENT_STATUS_NOT_SHIPPED')).toEqual(
      'shipmentStatus.notShipped'
    );
  });
});

describe('getStatusFromCodeStatus', () => {
  const ColorCodeStatus = {
    success: ['COMPLETE', 'APPROVED', 'SUBMITTED', 'POLICY_UPLOADED'],
    warning: ['PRESUBMITTED', 'PREAPPROVED'],
    danger: ['REJECTED', 'FAILED', 'MISSED_DEADLINE', 'SUBMISSION_PROBLEM'],
  };

  it('Should return the color code according to status', () => {
    const result = getStatusFromCodeStatus('COMPLETE', ColorCodeStatus);
    expect(result).toEqual('success');
  });

  it('Should return the color code according to status', () => {
    const result = getStatusFromCodeStatus('PRESUBMITTED', ColorCodeStatus);
    expect(result).toEqual('warning');
  });

  it('Should return the color code according to status', () => {
    const result = getStatusFromCodeStatus('FAILED', ColorCodeStatus);
    expect(result).toEqual('danger');
  });

  it('Should return the color code according to status', () => {
    const result = getStatusFromCodeStatus('PENDING', ColorCodeStatus);
    expect(result).toEqual('normal');
  });
});

describe('getColorCodeMapping', () => {
  it('returns the status to color code mapping for user table', () => {
    const result = getColorCodeMapping('user');
    expect(result).toEqual({
      success: ['Active'],
    });
  });

  it('returns the status to color code mapping for approvalHistory table', () => {
    const result = getColorCodeMapping('approvalHistory');
    expect(result).toEqual({
      success: ['APPROVED'],
      warning: ['CANCELLED'],
      danger: ['REJECTED'],
    });
  });

  it('returns the status to color code mapping for order tables', () => {
    const result = getColorCodeMapping('order');
    expect(result).toEqual({
      success: [
        'COMPLETE',
        'APPROVED',
        'SUBMITTED',
        'POLICY_UPLOADED',

        'APPROVED',
        'ITEM_APPROVAL_STATUS_APPROVED',
        'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
      ],
      warning: ['PRESUBMITTED', 'PREAPPROVED', 'ITEM_APPROVAL_STATUS_PENDING'],
      danger: [
        'REJECTED',
        'FAILED',
        'MISSED_DEADLINE',
        'SUBMISSION_PROBLEM',
        'CANCELLED',
        'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM',
        'ITEM_APPROVAL_STATUS_REJECTED',
      ],
    });
  });
});

describe('formatPolicyStartDate', () => {
  it("returns 'text.today' formatted policy start date when passed with today's date", () => {
    const result = formatPolicyStartDate(new Date());
    expect(result).toEqual('text.today');
  });

  it("returns 'text.tomorrow' formatted policy start date when passed with tomorrow's date", () => {
    const result = formatPolicyStartDate(add(new Date(), { days: 1 }));
    expect(result).toEqual('text.tomorrow');
  });

  it('returns formatted policy start date', () => {
    const result = formatPolicyStartDate(add(new Date(), { days: 15 }));
    expect(result).toEqual('15 datePicker.days');
  });

  it('returns formatted policy start date', () => {
    const result = formatPolicyStartDate(add(new Date(), { months: 2 }));
    expect(result).toEqual('60 datePicker.days');
  });

  it('returns "-" when passed undefined to the function', () => {
    const result = formatPolicyStartDate(undefined);
    expect(result).toEqual('-');
  });
});

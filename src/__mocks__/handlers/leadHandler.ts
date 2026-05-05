import DiscountMockData from '@alphafounders/mock-data/json/discountPage.json';
import { HttpResponse, http } from 'msw';

import { baseUrls } from 'data/slices/apiSlice';
import {
  mockLeadPaymentInformation,
  mockPaymentOptions,
  mockPaymentSelections,
} from 'mock-data/LeadPaymentInformation';
import { LeadPaymentInformation, PaymentOption } from 'shared/types/lead';

const leadHandler = [
  http.post<{
    voucher: string;
  }>(
    `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/:leadId/voucher`,
    async ({ request }) => {
      const body: any = await request.json();
      const { voucher } = body;

      if (voucher === 'leadNotSync') {
        return HttpResponse.json({}, { status: 424 });
      }

      return HttpResponse.json({});
    }
  ),

  http.get(`${baseUrls.goBff}/v1alpha1/leads/:leadId\\:paymentDetails`, () =>
    HttpResponse.json({
      customerInformation: {
        leadId: 'leads/406bc07a-8360-41be-be66-2b7b216e72b5',
        humanId: 'L9885412',
        customerName: 'cus API PATCH',
      },
      quoteInformation: {
        insurerName: 'บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',
        insuranceKind: 'BOTH',
        insuranceType: 'TYPE_1',
        licensePlate: '345-45 กท',
        car: 'Toyota Corolla Altis 2017 1600 CC (4 Doors) E ',
        grossMandatoryPremium: 646,
        grossVoluntaryPremium: 20900,
        discount: 0,
        totalPremium: 21546,
      },
      paymentSelections: mockPaymentSelections,
      paymentOptions: mockPaymentOptions,
    } as LeadPaymentInformation)
  ),

  http.post(`${baseUrls.goBff}/v1alpha1/leads/:leadId/payments`, () =>
    HttpResponse.json({
      status: 'ACTIVE',
      message: `เรียนคุณ ธนัชพร จงรักษ์\nจากที่ท่านได้ทำการซื้อประกันกับทาง Rabbit Care\nโดยจะครบกำหนดชำระเงินงวดที่ 1 วันที่\n02/08/2022 เป็นจำนวนเงิน 2,000.00 บาท\nท่านสามารถชำระเงินผ่านระบบ Recurring ได้ที่\nhttps://Link.com ขออภัยถ้าท่านได้ชำระเข้ามาแล้ว`,
      paymentLink: 'https://Link.com',
      name: 'transactions/406bc07a-8360-41be-be66-2b7b216e72b5',
    })
  ),

  http.post(`${baseUrls.goBff}/v1alpha1/leads/:leadId/contracts`, () =>
    HttpResponse.json({
      status: 'ACTIVE',
      message: `เรียน คุณธนัชพร จงรักษ์ บริษัท แรบบิท แคร์ \nขอนำส่งสัญญาผ่อนชำระเบี้ยประกันภัย รหัสสัญญา \nO1037768 ทะเบียนรถ 5กฒ-6103 กรุงเทมหานคร \nท่านสามารถตรวจสอบข้อมูลและลงลายมือยืนยันได้ที่ \nhttps://ibroker.rabbitinternet.com/contract/insUAT/O1037768ขออภัยหากท่านดำเนินการแล้ว`,
      contractLink:
        'https://ibroker.rabbitinternet.com/contract/insUAT/O1037768',
      name: 'transactions/406bc07a-8360-41be-be66-2b7b216e72b5',
    })
  ),

  http.get(`${baseUrls.goBff}/v1alpha1/leads/:leadId\\:contractDetails`, () =>
    HttpResponse.json({
      ...mockLeadPaymentInformation,
      paymentOptions: {
        fullPayment: null,
        creditCardInstallment: null,
        rabbitCareInstallment:
          mockLeadPaymentInformation.paymentOptions.rabbitCareInstallment,
      },
      paymentSelections: [
        mockPaymentSelections[PaymentOption.RABBIT_CARE_INSTALLMENT],
      ],
    } as LeadPaymentInformation)
  ),
];

export const paymentDetailsException = http.get(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId\\:paymentDetails`,
  () => HttpResponse.json({ message: 'Not found' }, { status: 404 })
);

export const contractDetailsException = http.get(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId\\:contractDetails`,
  () => HttpResponse.json({ message: 'Not found' }, { status: 404 })
);

export const paymentHandlerErrorException = http.post(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId/payments`,
  () => HttpResponse.json(null, { status: 500 })
);

export const paymentHandlerAlreadyException = http.post(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId/payments`,
  () =>
    HttpResponse.json(
      {
        code: 6,
        message: 'already_paid',
        details: [],
      },
      { status: 409 }
    )
);

export const paymentHandlerMandatoryException = http.post(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId/payments`,
  () =>
    HttpResponse.json(
      {
        code: 6,
        message: 'has_unfilled_mandatory_fields',
        details: [],
      },
      { status: 400 }
    )
);

export const contractHandlerException = http.post(
  `${baseUrls.goBff}/v1alpha1/leads/:leadId/contracts`,
  () => HttpResponse.json(null, { status: 500 })
);

export const getDiscountRequests = http.get(
  `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/discountRequests`,
  () =>
    HttpResponse.json({
      requests: DiscountMockData.discounts,
      total: 1,
    })
);

export default leadHandler;

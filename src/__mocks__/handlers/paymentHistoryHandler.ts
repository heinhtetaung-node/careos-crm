import { HttpResponse, http, delay } from 'msw';

const paymentHistoryHandler = [
  http.get(
    `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/:leadId/payment-records`,
    async ({ params }) => {
      let nextPage = 2;
      let limit = 10;
      const nextPageToken = params.nextPageToken as string;
      const pageSize = params.pageSize as string;
      if (nextPageToken) {
        nextPage = parseInt(nextPageToken, 10) + 1;
      }
      if (pageSize) {
        limit = parseInt(pageSize, 10);
      }
      const histories = [];
      for (let i = 1; i < 101; i += 1) {
        histories.push({
          createTime: '2000-01-01',
          paymentLink: 'https://www.google.com',
          message: `${i}เรียนคุณ ธนัชพร จงรักษ์ จากที่ท่านได้ทำการซื้อประกันกับทาง Rabbit Care โดยจะครบกำหนดชำระเงินงวดที่ 1 วันที่ 02/08/2022 เป็นจำนวนเงิน 2,000.00 บาท ท่านสามารถชำระเงินผ่านระบบ Recurring ได้ที่`,
          expiryTime: '2022-01-01',
          status: 'Sent',
        });
      }
      const currentPage = nextPage - 1;
      const total = histories.length;
      await delay(500);
      return HttpResponse.json({
        paymentRecords: histories.splice((currentPage - 1) * limit, limit),
        nextPageToken: nextPage,
        totalCount: total,
      });
    }
  ),
];

export const paymentHistoryHandlerNolinkException = http.get(
  `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/:leadId/payment-records`,
  async () => {
    const histories = [];
    for (let i = 1; i < 101; i += 1) {
      histories.push({
        createTime: '2000-01-01',
        paymentLink: 'https://www.google.com',
        message: `${i}เรียนคุณ ธนัชพร จงรักษ์ จากที่ท่านได้ทำการซื้อประกันกับทาง Rabbit Care โดยจะครบกำหนดชำระเงินงวดที่ 1 วันที่ 02/08/2022 เป็นจำนวนเงิน 2,000.00 บาท ท่านสามารถชำระเงินผ่านระบบ Recurring ได้ที่`,
        expiryTime: '2022-01-01',
        status: 'Sent',
      });
    }
    histories[0].paymentLink = '';
    await delay(300);
    return HttpResponse.json({
      paymentRecords: histories.splice(0, 10),
      nextPageToken: 2,
      totalCount: histories.length,
    });
  }
);
export default paymentHistoryHandler;

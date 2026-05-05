import { HttpResponse, http } from 'msw';

const getInsureres = http.get(
  `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
  () =>
    HttpResponse.json({
      insurers: [
        {
          name: 'insurers/42',
          displayName: 'FPG Insurance',
          displayNameTh: 'เอฟพีจี ประกันภัย',
          shortnameEn: 'FPG',
          shortnameTh: 'เอฟพีจี',
          rating: 0,
          order: 0,
          logo: '',
          phone: '0-2231-2640',
          website: 'https://www.fpgins.com/ ',
        },
      ],
    })
);

export default getInsureres;

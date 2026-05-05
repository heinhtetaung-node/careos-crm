import PackagesData from '@alphafounders/mock-data/json/transformedComparisonPackagesData.json';

import { decodeCompareQueryParam, getDifferenceData } from './helper';

describe('getDifferenceData', () => {
  const expectedResult = [
    {
      hasData: true,
      title: 'Package Price',
      packages: [1346042, 1373581],
      items: [
        {
          label: 'Voluntary price',
          values: {
            '1346042': {
              text: '<boldGreen>Included</boldGreen><lineBreak/> {{value}} THB/Year',
              textValues: { value: '15,035' },
            },
            '1373581': {
              text: '<boldGreen>Included</boldGreen><lineBreak/> {{value}} THB/Year',
              textValues: { value: '15,500' },
            },
          },
          isEmpty: false,
        },
        {
          label: 'Total price',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '15,681' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '16,146' },
            },
          },
          isEmpty: false,
        },
      ],
    },
    {
      hasData: true,
      title: 'Own Car Damage Coverage',
      packages: [1346042, 1373581],
      items: [
        {
          label: 'Own Car Damage',
          values: {
            '1346042': {
              text: '<boldGreen>{{value}} THB</boldGreen>',
              textValues: { value: '390,000' },
            },
            '1373581': {
              text: '<boldGreen>{{value}} THB</boldGreen>',
              textValues: { value: '450,000' },
            },
          },
          isEmpty: false,
        },
        {
          label: 'Fire and Theft',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '390,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '450,000' },
            },
          },
          isEmpty: false,
        },
      ],
    },
    {
      hasData: true,
      title: 'Personal Coverage',
      packages: [1346042, 1373581],
      items: [
        {
          label: 'Personal Injury',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '50,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '300,000' },
            },
          },
          isEmpty: false,
        },
        {
          label: 'Medical Expense',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '50,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '300,000' },
            },
          },
          isEmpty: false,
        },
        {
          label: 'Bail Bond',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '250,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '200,000' },
            },
          },
          isEmpty: false,
        },
      ],
    },
    {
      hasData: true,
      title: 'Third Party Coverage',
      packages: [1346042, 1373581],
      items: [
        {
          label: 'Property Damage',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '2,500,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '5,000,000' },
            },
          },
          isEmpty: false,
        },
        {
          label: 'Death per Person',
          values: {
            '1346042': {
              text: '{{value}} THB',
              textValues: { value: '1,000,000' },
            },
            '1373581': {
              text: '{{value}} THB',
              textValues: { value: '500,000' },
            },
          },
          isEmpty: false,
        },
      ],
    },
    {
      hasData: true,
      title: 'Terms and conditions',
      packages: [1346042, 1373581],
      items: [
        {
          values: {
            '1346042': {
              text: '1.รถยต์กลุ่ม 5\n 2ช่วงอายุของผู้เอาประกัน 35-45 ปี (แต่ไม่ต้องระบุผู้ขับขี่)\n 3.ตรวจสภาพรถก่อนเข้ารับประกันภัย\n 4.คุ้มครองภัยก่อการร้าย',
            },
            '1373581': {
              text: '     - คุ้มครองครอบคลุมทุกภัย \n     - เป็นกรมธรรม์แบบไม่ระบุชื่อผู้ขับขี่\n     - รับประกันภัยรถยนต์อายุ 2 – 10 ปี \n     - ต้องตรวจสภาพรถยนต์ก่อนรับประกันภัย\n     - ไม่มีค่าเสียหายส่วนแรก**(ยกเว้นกรณีไม่ได้เกิดจากการชน / คว่ำ และไม่สามารถแจ้งให้บริษัทฯ ทราบถึงคู่กรณี อีกฝ่ายหนึ่งได้**)\n     - รับประกันอุปกรณ์เสริม และอุปกรณ์ตกแต่งตามมาตรฐานโรงงาน\n     - รับเฉพาะรถเก๋ง และ รถกระบะ ที่มีการใช้งานส่วนบุคคล ไม่ใช้เพื่อการรับจ้างสาธารณะ หรือ ให้เช่า\n** ไม่รับรถเก๋ง หรือรถกระบะที่ใช้งานในเชิงพาณิชย์ เช่น รับส่งสินค้า, รถโดยสาร, รับจ้างสาธารณะ / ให้เช่า หรือรถกระบะที่มีการดัดแปลงเพื่อเพิ่มน้ำหนักในการบรรทุก และเป็นร้านค้าเคลื่อนที่**',
            },
          },
          isEmpty: false,
        },
      ],
    },
  ];

  it('returns difference data out of all the package detail', () => {
    expect(getDifferenceData(PackagesData)).toEqual(expectedResult);
  });
});

describe('decodeCompareQueryParams', () => {
  it('should return vital package comparison data present in the url', () => {
    const result = decodeCompareQueryParam(
      new URLSearchParams(
        'id=package/123,package/345&insuranceCategory=both,voluntary&sumInsuredMin=0,10&sumInsuredMax=100,1000'
      )
    );
    expect(result).toEqual([
      {
        packageName: 'package/123',
        insuranceCategory: 'both',
        sumInsuredMax: 100,
        sumInsuredMin: 0,
      },
      {
        packageName: 'package/345',
        insuranceCategory: 'voluntary',
        sumInsuredMin: 10,
        sumInsuredMax: 1000,
      },
    ]);
  });
  it('should return hide missing sumInsured Min, Max(partial)', () => {
    const result = decodeCompareQueryParam(
      new URLSearchParams(
        'id=package/123,package/345&insuranceCategory=both,voluntary&sumInsuredMin=,10&sumInsuredMax=,1000'
      )
    );
    expect(result).toEqual([
      {
        packageName: 'package/123',
        insuranceCategory: 'both',
      },
      {
        packageName: 'package/345',
        insuranceCategory: 'voluntary',
        sumInsuredMin: 10,
        sumInsuredMax: 1000,
      },
    ]);
  });
  it('should return hide missing sumInsured Min, Max(all)', () => {
    const result = decodeCompareQueryParam(
      new URLSearchParams(
        'id=package/123,package/345&insuranceCategory=both,voluntary&sumInsuredMin=,&sumInsuredMax=,'
      )
    );
    expect(result).toEqual([
      {
        packageName: 'package/123',
        insuranceCategory: 'both',
      },
      {
        packageName: 'package/345',
        insuranceCategory: 'voluntary',
      },
    ]);
  });
  it('should return empty array if qurery string is empty', () => {
    const result = decodeCompareQueryParam(new URLSearchParams(''));
    expect(result).toEqual([]);
  });
});

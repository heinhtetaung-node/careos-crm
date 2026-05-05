import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { UserRoles } from 'config/constant';

import FollowupTable from './FollowupTable';
import mockPriceDetails from './PriceMockDetail.json';
import { PRODUCTS } from 'config/TypeFilter';

const DATA = [
  {
    id: 'L9910670',
    assignment: null,
    childId:
      'transactions/c9eaf8c3-d76d-428d-ad1e-fbc19708cb90/followups/f060d1a1-cdfb-401d-b246-df85ee843c9b',
    installment: 1,
    amount: 'Waiting for open link',
    paymentStatus: 'PENDING',
    paymentMethod: '-',
    paymentDate: '',
    assignedToUser: '-',
    dueDate: '13/03/2024',
    createDate: '13/03/2024',
    updateDate: '13/03/2024',
    sendSms: true,
    shouldAskForSlip: true,
    transactionSlipData: {},
    canEdit: true,
    show: true,
  },
];
const parentId = 'transactions/c9eaf8c3-d76d-428d-ad1e-fbc19708cb90';
const handleEdit = jest.fn();
const handleSelect = jest.fn();

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn().mockReturnValue({
    'paym-2775_update-followup-due-date_20240205_temp': { enabled: true },
  }),
}));

jest.mock('data/slices/packageSlice', () => ({
  useGetPackageDetailsQuery: () => ({
    data: {
      name: 'customPackages/5c75b928-b0e8-40a3-b4cb-af60c11a948d',
      displayName:
        'C64_00115_Type 1_OIC 110_Mazda Used Car_garage_Mazda 2_2-15 years',
      price: '1826275',
      insurer: 'insurers/35',
      carInsuranceType: 'TYPE_1',
      isFixedPremium: false,
      deductibleAmount: '0',
      sumCoverageMin: '31000000',
      sumCoverageMax: '50000000',
      bailBondCoverage: '20000000',
      fireTheftCoverage: '50000000',
      floodCoverage: '50000000',
      medicalExpensesCoverage: '10000000',
      medicalExpensesCoverageNo: 7,
      personalAccidentCoverage: '10000000',
      personalAccidentCoverageNo: 7,
      liabilityPropertyCoverage: '250000000',
      liabilityPerPersonCoverage: '100000000',
      liabilityPerAccidentCoverage: '1000000000',
      carRepairType: 'GARAGE',
      carAgeMin: 2,
      carAgeMax: 15,
      modifiedCarAccepted: true,
      oicCode: 'TYPE_110',
      termsEn:
        '- ทุนประกันที่รับประกันภัยคือ 80% - 100% ของราคาตลาด ณ.วันทําประกันภัย โดยปัดทุนตามเงื่อนไขด้านล่าง รวมอุปกรณ์ตกแต่งเพิ่มเติม (ถ้ามี)\n* ช่วงทุน 100,000 – 990,000 ปรับช่วงทุนละ 10,000 บาท กรณีมีเศษให้ปัดเศษขึ้นเสมอ\n* ช่วงทุน 1,000,000 – 2,000,000 ปรับช่วงทุนละ 50,000 บาท กรณีมีเศษให้ปัดเศษขึ้นเสมอ\n- คุ้มครองอุปกรณ์ตกแต่งมูลค่าไม่เกิน 30,000 บาท ทั้งนี้อุปกรณ์ตกแต่ง ไม่รวมถึง แคฟร่า , คาร์บอน , สติIกเกอร์ , เคลือบแก้ว\n- ไม่รับทําประกันภัยรุ่นที่ทําการดัดแปลงเพื่อการแข่งขัน รถโหลดเตี้ยหรือยกสูง\n- เบี้ยนี้ไม่สามารถใช้กับรถกระบะ pick up ที่มีการต่อ คอก, รั้วสูง, ตู้, แหนบ และเพลาเสริมจากมาตรฐาน\n-  เบี้ยที่เสนอนี้ได้หักรวมส่วนลดต่าง ๆ ไว้ครบถ้วนแล้ว เช่น ประวัติดี ส่วนลดกล้อง CCTV และส่วนลด Application\n- เบี้ยประกันภัยสําหรับรถยนต์ที่ใช้ส่วนบุคคล ,รถประจําตําแหน่ง (ชื่อบริษัทและ/หรือบุคคล) ไม่ใช้รับจ้างหรือให้เช่า\n- ประเภท 1 บริษัทฯ ขอตรวจสภาพรถก่อนรับประกันภัยทุกกรณี และความเสียหายต้องไม่เกิน 8,000 บาท\n- บริษัทฯ ขอสงวนสิทธิ์ในการพิจารณาเบี้ยประกันภัยใหม่ หากตรวจสภาพรถแล้ว รถไม่เป็นไปตามเงื่อนไขที่กําหนดไว้ข้างต้น\n- ระยะเวลาสิ้นสุดแคมเปญ 31 ธันวาคม 2564 หรือจนกว่าจะมีการเปลี่ยนแปลง',
      termsTh:
        '- ทุนประกันที่รับประกันภัยคือ 80% - 100% ของราคาตลาด ณ.วันทําประกันภัย โดยปัดทุนตามเงื่อนไขด้านล่าง รวมอุปกรณ์ตกแต่งเพิ่มเติม (ถ้ามี)\n* ช่วงทุน 100,000 – 990,000 ปรับช่วงทุนละ 10,000 บาท กรณีมีเศษให้ปัดเศษขึ้นเสมอ\n* ช่วงทุน 1,000,000 – 2,000,000 ปรับช่วงทุนละ 50,000 บาท กรณีมีเศษให้ปัดเศษขึ้นเสมอ\n- คุ้มครองอุปกรณ์ตกแต่งมูลค่าไม่เกิน 30,000 บาท ทั้งนี้อุปกรณ์ตกแต่ง ไม่รวมถึง แคฟร่า , คาร์บอน , สติIกเกอร์ , เคลือบแก้ว\n- ไม่รับทําประกันภัยรุ่นที่ทําการดัดแปลงเพื่อการแข่งขัน รถโหลดเตี้ยหรือยกสูง\n- เบี้ยนี้ไม่สามารถใช้กับรถกระบะ pick up ที่มีการต่อ คอก, รั้วสูง, ตู้, แหนบ และเพลาเสริมจากมาตรฐาน\n-  เบี้ยที่เสนอนี้ได้หักรวมส่วนลดต่าง ๆ ไว้ครบถ้วนแล้ว เช่น ประวัติดี ส่วนลดกล้อง CCTV และส่วนลด Application\n- เบี้ยประกันภัยสําหรับรถยนต์ที่ใช้ส่วนบุคคล ,รถประจําตําแหน่ง (ชื่อบริษัทและ/หรือบุคคล) ไม่ใช้รับจ้างหรือให้เช่า\n- ประเภท 1 บริษัทฯ ขอตรวจสภาพรถก่อนรับประกันภัยทุกกรณี และความเสียหายต้องไม่เกิน 8,000 บาท\n- บริษัทฯ ขอสงวนสิทธิ์ในการพิจารณาเบี้ยประกันภัยใหม่ หากตรวจสภาพรถแล้ว รถไม่เป็นไปตามเงื่อนไขที่กําหนดไว้ข้างต้น\n- ระยะเวลาสิ้นสุดแคมเปญ 31 ธันวาคม 2564 หรือจนกว่าจะมีการเปลี่ยนแปลง',
      expireTime: '9999-01-01T00:00:00Z',
      status: 'ACTIVE',
      filename:
        'STY_20211116_ Mazda UsedCar 2-15Y Garage.xlsx - Data (1)-2022_01_06_16_25_49.csv',
      createTime: '2022-01-06T16:26:08Z',
      updateTime: '2022-01-06T16:26:08Z',
      broker: 'ASK',
      source: 'IMPORT',
      code: 1347621,
      insurerPackageCode: 'careos_staging_uat',
      isEcoCar: false,
      yearlyMileage: 0,
      antiTheftDiscount: '0',
      yearsOwned: 0,
      numberVehiclesHousehold: 0,
      carRegistrationCategory: '',
      drivingPurpose: 'DRIVING_PURPOSES_UNSPECIFIED',
      parkingLocation: '',
      maritalStatus: 'MARTIAL_STATUSES_UNSPECIFIED',
      occupation: '',
      drivingExperience: 0,
      reuseManualPackage: false,
      hasCctvDiscount: false,
      startTime: '2021-12-29T00:00:59Z',
      isLowCost: false,
      provinces: [
        'provinces/370000',
        'provinces/150000',
        'provinces/100000',
        'provinces/380000',
        'provinces/310000',
        'provinces/240000',
        'provinces/180000',
        'provinces/360000',
        'provinces/220000',
        'provinces/500000',
        'provinces/570000',
        'provinces/200000',
        'provinces/860000',
        'provinces/460000',
        'provinces/620000',
        'provinces/710000',
        'provinces/400000',
        'provinces/810000',
        'provinces/520000',
        'provinces/510000',
        'provinces/420000',
        'provinces/160000',
        'provinces/580000',
        'provinces/440000',
        'provinces/490000',
        'provinces/260000',
        'provinces/730000',
        'provinces/480000',
        'provinces/300000',
        'provinces/600000',
        'provinces/800000',
        'provinces/550000',
        'provinces/960000',
        'provinces/390000',
        'provinces/430000',
        'provinces/120000',
        'provinces/130000',
        'provinces/940000',
        'provinces/820000',
        'provinces/930000',
        'provinces/560000',
        'provinces/670000',
        'provinces/760000',
        'provinces/660000',
        'provinces/650000',
        'provinces/540000',
        'provinces/140000',
        'provinces/830000',
        'provinces/250000',
        'provinces/770000',
        'provinces/850000',
        'provinces/700000',
        'provinces/210000',
        'provinces/450000',
        'provinces/270000',
        'provinces/470000',
        'provinces/110000',
        'provinces/740000',
        'provinces/750000',
        'provinces/190000',
        'provinces/910000',
        'provinces/170000',
        'provinces/330000',
        'provinces/900000',
        'provinces/640000',
        'provinces/720000',
        'provinces/840000',
        'provinces/320000',
        'provinces/630000',
        'provinces/920000',
        'provinces/230000',
        'provinces/340000',
        'provinces/410000',
        'provinces/610000',
        'provinces/530000',
        'provinces/950000',
        'provinces/350000',
      ],
      gender: 'GENDERS_UNSPECIFIED',
      carUsingPurpose: 'CAR_USING_PURPOSES_UNSPECIFIED',
      noClaimBonus: 'NO_CLAIM_BONUS_TYPES_UNSPECIFIED',
      excessType: 'EXCESS_TYPES_UNSPECIFIED',
      minYearsOfHoldingDriverLicense: 0,
      maxYearsOfHoldingDriverLicense: 0,
      minNumberOfClaimsInYear: 0,
      maxNumberOfClaimsInYear: 0,
      maxAge: 0,
      minAge: 0,
      minMileage: 0,
      maxMileage: 0,
      carSubmodels: [
        'brands/33/models/298/submodels/11528',
        'brands/33/models/298/submodels/11529',
        'brands/33/models/298/submodels/11274',
        'brands/33/models/298/submodels/11275',
        'brands/33/models/298/submodels/11276',
        'brands/33/models/298/submodels/11277',
        'brands/33/models/298/submodels/11278',
        'brands/33/models/298/submodels/11279',
        'brands/33/models/298/submodels/11280',
        'brands/33/models/298/submodels/11281',
        'brands/33/models/298/submodels/11282',
        'brands/33/models/298/submodels/11283',
        'brands/33/models/298/submodels/11284',
        'brands/33/models/298/submodels/11285',
        'brands/33/models/298/submodels/5161',
        'brands/33/models/298/submodels/2219',
        'brands/33/models/298/submodels/2218',
        'brands/33/models/298/submodels/2220',
        'brands/33/models/298/submodels/2217',
        'brands/33/models/298/submodels/2228',
        'brands/33/models/298/submodels/2227',
        'brands/33/models/298/submodels/2230',
        'brands/33/models/298/submodels/2229',
        'brands/33/models/298/submodels/2226',
        'brands/33/models/298/submodels/2225',
        'brands/33/models/298/submodels/2223',
        'brands/33/models/298/submodels/2221',
        'brands/33/models/298/submodels/2224',
        'brands/33/models/298/submodels/2222',
        'brands/33/models/298/submodels/2234',
        'brands/33/models/298/submodels/2235',
        'brands/33/models/298/submodels/2236',
        'brands/33/models/298/submodels/2237',
        'brands/33/models/298/submodels/2231',
        'brands/33/models/298/submodels/2232',
        'brands/33/models/298/submodels/2233',
        'brands/33/models/298/submodels/2238',
        'brands/33/models/298/submodels/2239',
        'brands/33/models/298/submodels/2317',
        'brands/33/models/298/submodels/2318',
        'brands/33/models/298/submodels/5158',
        'brands/33/models/298/submodels/5159',
        'brands/33/models/298/submodels/5160',
        'brands/33/models/298/submodels/5162',
        'brands/33/models/298/submodels/5163',
        'brands/33/models/298/submodels/5164',
        'brands/33/models/298/submodels/5165',
        'brands/33/models/298/submodels/5166',
        'brands/33/models/298/submodels/5167',
        'brands/33/models/298/submodels/5168',
        'brands/33/models/298/submodels/5169',
        'brands/33/models/298/submodels/5187',
        'brands/33/models/298/submodels/5188',
        'brands/33/models/298/submodels/5189',
        'brands/33/models/298/submodels/5190',
        'brands/33/models/298/submodels/5191',
        'brands/33/models/298/submodels/5192',
        'brands/33/models/298/submodels/12046',
        'brands/33/models/298/submodels/12047',
        'brands/33/models/298/submodels/12048',
        'brands/33/models/298/submodels/12049',
        'brands/33/models/298/submodels/12050',
        'brands/33/models/298/submodels/12051',
        'brands/33/models/298/submodels/12052',
        'brands/33/models/298/submodels/12053',
        'brands/33/models/298/submodels/12054',
        'brands/33/models/298/submodels/12055',
        'brands/33/models/298/submodels/12056',
        'brands/33/models/298/submodels/12057',
        'brands/33/models/298/submodels/12058',
        'brands/33/models/298/submodels/12059',
        'brands/33/models/298/submodels/12257',
        'brands/33/models/298/submodels/12258',
        'brands/33/models/298/submodels/12259',
        'brands/33/models/298/submodels/12261',
        'brands/33/models/298/submodels/12266',
        'brands/33/models/298/submodels/12270',
        'brands/33/models/298/submodels/12268',
        'brands/33/models/298/submodels/12269',
        'brands/33/models/298/submodels/12271',
        'brands/33/models/298/submodels/12272',
        'brands/33/models/298/submodels/12273',
        'brands/33/models/298/submodels/12591',
        'brands/33/models/298/submodels/12592',
        'brands/33/models/298/submodels/12590',
        'brands/33/models/298/submodels/12262',
        'brands/33/models/298/submodels/12267',
        'brands/33/models/298/submodels/12263',
        'brands/33/models/298/submodels/12264',
        'brands/33/models/298/submodels/12265',
        'brands/33/models/298/submodels/12593',
        'brands/33/models/298/submodels/12260',
      ],
      insuranceCategory: 'VOLUNTARY',
      packageType: 'STANDARD',
      noClaimBonusAmount: '0',
      claimValue: '0',
      numberOfClaims: 0,
      lead: 'leads/9ee02920-8eca-4851-b2d8-54d0315745e0',
      searchable: false,
      createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
      priceResourceName: 'prices/fef8d8b0-d669-4eb4-aa60-4b47911b9a17',
      customPackageStatus: 'APPROVAL_NOT_REQUIRED',
    },
  }),
}));

jest.mock('data/slices/transactionSlice', () => ({
  useGetPriceDetailQuery: () => ({
    data: {
      ...mockPriceDetails,
    },
  }),
}));
const initialState: any = {
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: PRODUCTS.CAR_PRODUCT_INSURANCE,
    },
  },
};

describe('Testing Followup Table', () => {
  beforeEach(() => {
    render(
      <FollowupTable
        data={DATA}
        selected={[parentId]}
        handleSelect={handleSelect}
        parentId={parentId}
        handleEdit={handleEdit}
        canEdit={false}
        role={UserRoles.ADMIN_ROLE}
      />,
      {
        initialState,
      }
    );
    expect(screen.getByTestId('followup-table')).toBeInTheDocument();
  });
  it('should trigger the handle select function if checkbox is checked', async () => {
    const checkbox = screen.getAllByTestId('checkbox-followup')[0];
    expect(checkbox).toBeInTheDocument();

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalledWith(
        DATA[0].childId,
        DATA,
        true,
        parentId
      );
    });
  });
  it('should trigger the handle due date edit function if edit icon is clicked', async () => {
    const dueDateEditBtn = screen.getAllByTestId('dueDate-btn')[0];

    expect(dueDateEditBtn).toBeInTheDocument();
    await userEvent.click(dueDateEditBtn);
    await waitFor(() => {
      expect(handleEdit).toHaveBeenCalledWith({
        ...DATA[0],
        type: 'due-date',
        amount: '8,172.57',
      });
    });
  });
  it('should trigger the handle edit function if edit icon is clicked', async () => {
    const smsEditBtn = screen.getAllByTestId('edit-btn')[0];

    expect(smsEditBtn).toBeInTheDocument();
    await userEvent.click(smsEditBtn);
    await waitFor(() => {
      expect(handleEdit).toHaveBeenCalledWith({
        ...DATA[0],
        type: 'sms',
        amount: '8,172.57',
      });
    });
  });
});

import { LEAD_TYPE } from 'shared/constants';
import TeamRole from 'shared/constants/teamRole';
import { IInsurer } from 'shared/interfaces/common/admin/team';

import { getString } from '../presentation/theme/localization';

export const SelectDateType = [
  { id: 1, title: 'text.select', value: '' },
  { id: 2, title: 'dateType.createdOn', value: 'createTime' },
  { id: 3, title: 'dateType.updatedOn', value: 'updateTime' },
];

export const SelectDateTypeMyLeads = [
  { id: 1, title: 'text.select', value: '' },
  {
    id: 2,
    title: 'dateTypeLeadOption.policyStartOn',
    value: 'policyStartTime',
  },
  { id: 3, title: 'dateTypeLeadOption.appointedOn', value: 'appointmentTime' },
  { id: 4, title: 'dateTypeLeadOption.createOn', value: 'createTime' },
  { id: 5, title: 'dateTypeLeadOption.updateOn', value: 'updateTime' },
  { id: 6, title: 'dateTypeLeadOption.assignOn', value: 'assignTime' },
  {
    id: 7,
    title: 'dateTypeLeadOption.lastVisitedOn',
    value: 'lastVisitedTime',
  },
];

export const SearchLeads = [
  { id: 1, title: getString('text.select'), value: '' },
  {
    id: 2,
    title: getString('searchFieldLeadOption.customerName'),
    value: 'customerName',
  },
  { id: 3, title: getString('text.licensePlate'), value: 'licensePlate' },
  { id: 4, title: getString('searchFieldLeadOption.leadId'), value: 'id' },
  { id: 5, title: getString('searchLeads.remark'), value: 'remark' },
];

export const TeamRoleOptions = [
  { id: 1, title: getString('team.sales'), value: TeamRole.Sales },
  { id: 2, title: getString('team.inbound'), value: TeamRole.Inbound },
  {
    id: 3,
    title: getString('team.customerService'),
    value: TeamRole.CustomerService,
  },
  {
    id: 4,
    title: getString('team.documentsCollection'),
    value: TeamRole.DocumentsCollection,
  },
  {
    id: 5,
    title: getString('team.qualityControl'),
    value: TeamRole.QualityControl,
  },
  { id: 6, title: getString('team.submission'), value: TeamRole.Submission },
];

export const TeamName = [
  { id: 1, title: 'Team A', value: 'teamA' },
  { id: 2, title: 'Team B', value: 'teamB' },
  { id: 3, title: 'Team C', value: 'teamC' },
];

export const Product = [
  { id: 1, title: 'Car Insurance', value: 'carInsurance' },
  { id: 2, title: 'Health Insurance', value: 'healthInsurance' },
  { id: 3, title: 'Life Insurance', value: 'lifeInsurance' },
];

export const LeadType = [
  { id: 1, title: 'New', value: LEAD_TYPE.NEW },
  { id: 2, title: 'Retainer', value: LEAD_TYPE.RETAINER },
  { id: 3, title: 'Renewal', value: LEAD_TYPE.RENEWAL },
];

export const Manager = [
  { id: 1, title: 'Siriwan', value: 'Siriwan' },
  { id: 2, title: 'Pithi', value: 'Pithi' },
  { id: 3, title: 'Pimpicha', value: 'Pimpicha' },
  { id: 4, title: 'Toopopthorn', value: 'Toopopthorn' },
  { id: 5, title: 'Warasiri', value: 'Warasiri' },
];

export const Supervisor = [
  { id: 1, title: 'Boygosiyaphong' },
  { id: 2, title: 'Somprapha' },
];

export const Insurers: IInsurer[] = [
  {
    id: 42,
    nameEn: 'FPG Insurance',
    nameTh: 'เอฟพีจี ประกันภัย',
    shortNameEn: 'FPG',
    shortNameTh: 'เอฟพีจี',
  },
  {
    id: 40,
    nameEn: 'Chubb Samaggi Insurance Co. (PLC)',
    nameTh: 'บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'CHUBB',
    shortNameTh: 'ชัปป์',
  },
  {
    id: 12,
    nameEn: 'Erawan Insurance Co., Ltd.',
    nameTh: 'เอราวัณประกันภัย จำกัด',
    shortNameEn: 'Erawan Insurance',
    shortNameTh: 'เอราวัณประกันภัย',
  },
  {
    id: 36,
    nameEn: 'Sri Ayudhaya General Insurance Public Company Limited',
    nameTh: 'บริษัท ศรีอยุธยา เจนเนอรัล ประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Sri Ayudhaya General Insurance',
    shortNameTh: 'ศรีอยุธยา เจนเนอรัล ประกันภัย',
  },
  {
    id: 23,
    nameEn: 'Thai Setakij Insurance Public Company Limited',
    nameTh: 'ไทยเศรษฐกิจประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Thai Setakij Insurance',
    shortNameTh: 'ไทยเศรษฐกิจประกันภัย',
  },
  {
    id: 2,
    nameEn: 'Thai Paiboon Insurance PLC',
    nameTh: 'บจม.ไทยไพบูลย์ ประกันภัย',
    shortNameEn: 'Thai Paiboon Insurance',
    shortNameTh: 'ไทยไพบูลย์ ประกันภัย',
  },
  {
    id: 32,
    nameEn: 'Krungthai Panich Insurance Public Company Limited',
    nameTh: 'กรุงไทยพานิชประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Krungthai Panich Insurance',
    shortNameTh: 'กรุงไทยพานิชประกันภัย',
  },
  {
    id: 34,
    nameEn: 'MSIG Insurance (Thailand) Public Company Limited',
    nameTh: 'บริษัท เอ็ม เอส ไอ จี ประกันภัย (ประเทศไทย) จำกัด (มหาชน)',
    shortNameEn: 'MSIG Insurance',
    shortNameTh: 'เอ็ม เอส ไอ จี ประกันภัย',
  },
  {
    id: 16,
    nameEn: 'Mittare Insurance Public Company Limited',
    nameTh: 'มิตรแท้ประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Mittare Insurance',
    shortNameTh: 'มิตรแท้ประกันภัย',
  },
  {
    id: 15,
    nameEn: 'KSK Insurance (Thailand) Public Company Limited',
    nameTh: 'บริษัท เคเอสเค ประกันภัย (ประเทศไทย) จำกัด (มหาชน)',
    shortNameEn: 'KSK Insurance',
    shortNameTh: 'เคเอสเค ประกันภัย',
  },
  {
    id: 21,
    nameEn: 'Thai Insurance Public Company Limited',
    nameTh: 'ไทยประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Thai Insurance',
    shortNameTh: 'ไทยประกันภัย',
  },
  {
    id: 30,
    nameEn: 'Generali Insurance (Thailand) Public Company Limited',
    nameTh: 'บริษัท เจนเนอราลี่ ประกันภัย (ไทยแลนด์) จำกัด (มหาชน)',
    shortNameEn: 'Generali Insurance',
    shortNameTh: 'เจนเนอราลี่ ประกันภัย',
  },
  {
    id: 13,
    nameEn: 'Indara Insurance Public Company Limited',
    nameTh: 'อินทรประกันภัย จำกัด(มหาชน)',
    shortNameEn: 'Indara Insurance',
    shortNameTh: 'อินทรประกันภัย',
  },
  {
    id: 29,
    nameEn: 'Samaggi Insurance Company Limited (Thailand)',
    nameTh: 'บริษัท สามัคคีประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Samaggi Insurance',
    shortNameTh: 'สามัคคีประกันภัย',
  },
  {
    id: 26,
    nameEn: 'Tokio Marine Insurance (Thailand) Public Company Limited',
    nameTh: 'บริษัท โตเกียวมารีนประกันภัย (ประเทศไทย) จำกัด(มหาชน)',
    shortNameEn: 'Tokio Marine Insurance',
    shortNameTh: 'โตเกียวมารีนประกันภัย',
  },
  {
    id: 18,
    nameEn: 'Nam Seng Insurance Public Company Limited',
    nameTh: 'นำสินประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Nam Seng Insurance',
    shortNameTh: 'นำสินประกันภัย',
  },
  {
    id: 9,
    nameEn: 'Charan Insurance Public Company Limited',
    nameTh: 'จรัญประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Charan Insurance',
    shortNameTh: 'จรัญประกันภัย',
  },
  {
    id: 3,
    nameEn: 'Aioi Bangkok Insurance Public Company Limited',
    nameTh: 'ไอโออิ กรุงเทพประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Aioi Bangkok Insurance',
    shortNameTh: 'ไอโออิ กรุงเทพประกันภัย',
  },
  {
    id: 22,
    nameEn: 'Siam City Insurance PLC',
    nameTh: 'บจม.สยามซิตี้ ประกันภัย',
    shortNameEn: 'Siam City Insurance',
    shortNameTh: 'สยามซิตี้ ประกันภัย',
  },
  {
    id: 8,
    nameEn: 'Chao Phaya Inurance Pubilic Company Limited',
    nameTh: 'เจ้าพระยาประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Chao Phaya Insurance',
    shortNameTh: 'เจ้าพระยาประกันภัย',
  },
  {
    id: 14,
    nameEn: 'Kamol Insurance Public Company Limited',
    nameTh: 'กมลประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Kamol Insurance',
    shortNameTh: 'กมลประกันภัย',
  },
  {
    id: 7,
    nameEn: 'Bangkok Insurance Public Company Limited',
    nameTh: 'บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Bangkok Insurance',
    shortNameTh: 'กรุงเทพประกันภัย',
  },
  {
    id: 27,
    nameEn: 'The Viriyah Insurance Company Limited',
    nameTh: 'บริษัท วิริยะประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Viriyah Insurance',
    shortNameTh: 'วิริยะประกันภัย',
  },
  {
    id: 24,
    nameEn: 'Thaisri Insurance Public Company Limited',
    nameTh: 'ไทยศรีประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Thaisri Insurance',
    shortNameTh: 'ไทยศรีประกันภัย',
  },
  {
    id: 28,
    nameEn: 'Thanachart Insurance Co., Ltd',
    nameTh: 'บริษัท ธนชาตประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Thanachart Insurance',
    shortNameTh: 'ธนชาตประกันภัย',
  },
  {
    id: 35,
    nameEn: 'Safety Insurance Public Company Limited',
    nameTh: 'บริษัท ประกันคุ้มภัย จำกัด (มหาชน)',
    shortNameEn: 'Safety Insurance',
    shortNameTh: 'คุ้มภัย ประกันภัย',
  },
  {
    id: 25,
    nameEn: 'Thaivivat Insurance Public Co., Ltd.',
    nameTh: 'บริษัทประกันภัยไทยวิวัฒน์ จำกัด (มหาชน)',
    shortNameEn: 'Thaivivat Insurance',
    shortNameTh: 'ไทยวิวัฒน์ประกันภัย',
  },
  {
    id: 19,
    nameEn: 'The South East Insurance Public Company Limited',
    nameTh: 'บริษัท อาคเนย์ประกันภัย จำกัด ( มหาชน )',
    shortNameEn: 'Southeast Insurance',
    shortNameTh: 'อาคเนย์ประกันภัย',
  },
  {
    id: 11,
    nameEn: 'Dhipaya Insurance Public Company Limited',
    nameTh: 'บริษัท ทิพยประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Dhipaya Insurance',
    shortNameTh: 'ทิพยประกันภัย',
  },
  {
    id: 17,
    nameEn: 'Muang Thai Insurance Public Company Limited',
    nameTh: 'บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Muang Thai Insurance',
    shortNameTh: 'เมืองไทยประกันภัย',
  },
  {
    id: 4,
    nameEn: 'Asia Insurance 1950 Co., Ltd',
    nameTh: 'บริษัท เอเชียประกันภัย (1950) จำกัด (มหาชน)',
    shortNameEn: 'Asia Insurance',
    shortNameTh: 'เอเชีย ประกันภัย',
  },
  {
    id: 6,
    nameEn: 'AXA Insurance Pubilic Company Limited',
    nameTh: 'บริษัท  แอกซ่าประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'AXA Insurance',
    shortNameTh: 'แอกซ่า ประกันภัย',
  },
  {
    id: 33,
    nameEn: 'LMG Insurance Company Limited',
    nameTh: 'บริษัท แอลเอ็มจี ประกันภัย จำกัด',
    shortNameEn: 'LMG Insurance',
    shortNameTh: 'แอลเอ็มจี ประกันภัย',
  },
  {
    id: 31,
    nameEn: 'The Navakij Insurance Public Company Limited',
    nameTh: 'บริษัท นวกิจประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Navakij Insurance',
    shortNameTh: 'นวกิจประกันภัย',
  },
  {
    id: 10,
    nameEn: 'The Deves Insurance Public Company Limited',
    nameTh: 'บริษัท เทเวศประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Deves Insurance',
    shortNameTh: 'เทเวศประกันภัย',
  },
  {
    id: 20,
    nameEn: 'Syn Mun Kong Insurance Public Company Limited',
    nameTh: 'บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Syn Mun Kong Insurance',
    shortNameTh: 'สินมั่นคงประกันภัย',
  },
  {
    id: 1,
    nameEn: 'Allianz  General Insurance Public Company Limited',
    nameTh: 'บริษัท อลิอันซ์ ประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Allianz C.P.',
    shortNameTh: 'อลิอันซ์ ซี.พี.',
  },
  {
    id: 5,
    nameEn: 'Assets Insurance Public Company Limited',
    nameTh: 'สินทรัพย์ประกันภัย จำกัด (มหาชน)',
    shortNameEn: 'Assets Insurance',
    shortNameTh: 'สินทรัพย์ประกันภัย',
  },
  {
    id: 37,
    nameEn: 'AIG Insurance (Thailand) Public Company Limited',
    nameTh: 'เอไอจี ประกันภัย (ประเทศไทย) จำกัด (มหาชน)',
    shortNameEn: 'AIG Insurance',
    shortNameTh: 'เอไอจี ประกันภัย',
  },
  {
    id: 38,
    nameEn: 'Roojai Insurance',
    nameTh: 'รู้ใจ ประกันภัย',
    shortNameEn: 'ROOJAI',
    shortNameTh: 'รู้ใจ',
  },
];

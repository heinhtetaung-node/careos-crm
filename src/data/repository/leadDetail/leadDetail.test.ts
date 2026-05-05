import LeadDetailCloud from './cloud';

import LeadDetailRepository, { apiGateway } from './index';

const Product = 'products/car-insurance';
const pageState = {
  pageSize: 20,
  currentPage: 0,
  orderBy: 'id',
};

test('calls getAppointment', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyGetAppointment = jest.spyOn(LeadDetailCloud, 'getAppointment');

  const payload = {
    startDate: '09/20/2021',
    filter: 'test',
  };

  leadDetailRepository.getAppointment(payload);

  expect(spyGetAppointment).toHaveBeenCalledWith(payload);
});

test('calls updateLead', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyUpdateLead = jest.spyOn(LeadDetailCloud, 'updateLead');

  const payload = {
    name: 'John',
  };

  leadDetailRepository.updateLead('leadId', payload);

  expect(spyUpdateLead).toHaveBeenCalled();
});

test('calls createPaySlip', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyCreatePaySlip = jest.spyOn(LeadDetailCloud, 'createPaySlip');

  const payload = {
    price: 1500,
  };

  leadDetailRepository.createPaySlip('leadId', payload);

  expect(spyCreatePaySlip).toHaveBeenCalled();
});

test('calls getLeadPackage', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spygetLeadPackage = jest.spyOn(LeadDetailCloud, 'getLeadPackage');

  leadDetailRepository.getLeadPackage('leadId');

  expect(spygetLeadPackage).toHaveBeenCalled();
});

test('calls leadBulkImportant', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyLeadBulkImportant = jest.spyOn(LeadDetailCloud, 'leadBulkImportant');

  leadDetailRepository.leadBulkImportant({ ids: ['123'], important: true });

  expect(spyLeadBulkImportant).toHaveBeenCalled();
});

test('calls getMyLead', () => {
  const spyGetMylead = jest.spyOn(LeadDetailCloud, 'getMyLead');

  LeadDetailCloud.getMyLead('car', {});

  expect(spyGetMylead).toHaveBeenCalled();
});

test('calls postComment', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spypostComment = jest.spyOn(LeadDetailCloud, 'postComment');

  leadDetailRepository.postComment({ text: 'hello' } as any);

  expect(spypostComment).toHaveBeenCalled();
});

test('calls updateLeadStatus', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyupdateLeadStatus = jest.spyOn(LeadDetailCloud, 'updateLeadStatus');
  const payload = {
    leadId: '',
    status: '',
    comment: '',
  };
  leadDetailRepository.updateLeadStatus(payload);

  expect(spyupdateLeadStatus).toHaveBeenCalled();
});

test('calls updateLicensePlate', () => {
  const leadDetailRepository = new LeadDetailRepository();

  const spyupdateLicensePlate = jest.spyOn(
    LeadDetailCloud,
    'updateLicensePlate'
  );
  const payload = {
    leadId: '',
    body: '',
  };
  leadDetailRepository.updateLicensePlate(payload);

  expect(spyupdateLicensePlate).toHaveBeenCalled();
});

test('calls getCarBrand', () => {
  const spygetCarBrand = jest.spyOn(LeadDetailCloud, 'getCarBrand');
  LeadDetailCloud.getCarBrand('');

  expect(spygetCarBrand).toHaveBeenCalled();
});

test('calls getCarModel', () => {
  const spyGetCarModel = jest.spyOn(LeadDetailCloud, 'getCarModel');
  LeadDetailCloud.getCarModel('');
  expect(spyGetCarModel).toHaveBeenCalled();
});

test('calls getCarSubModel', () => {
  const spygetCarSubModel = jest.spyOn(LeadDetailCloud, 'getCarModel');
  LeadDetailCloud.getCarSubModel('');
  expect(spygetCarSubModel).toHaveBeenCalled();
});

test('calls getCarBySubModelYear', () => {
  const spygetCarBySubModelYear = jest.spyOn(
    LeadDetailCloud,
    'getCarBySubModelYear'
  );
  LeadDetailCloud.getCarBySubModelYear('');
  expect(spygetCarBySubModelYear).toHaveBeenCalled();
});

test('calls getListInsurerFilter', () => {
  const spygetListInsurerFilter = jest.spyOn(
    LeadDetailCloud,
    'getCarBySubModelYear'
  );
  LeadDetailCloud.getListInsurerFilter();
  expect(spygetListInsurerFilter).toHaveBeenCalled();
});

test('calls getListInsurer', () => {
  const spygetListInsurerFilter = jest.spyOn(LeadDetailCloud, 'getListInsurer');
  LeadDetailCloud.getListInsurer('');
  expect(spygetListInsurerFilter).toHaveBeenCalled();
});

test('calls getSubDistrict', () => {
  const spygetSubDistrict = jest.spyOn(LeadDetailCloud, 'getSubDistrict');
  LeadDetailCloud.getSubDistrict('bangkok');
  expect(spygetSubDistrict).toHaveBeenCalled();
});

test('calls getDistrictById', () => {
  const spygetDistrictById = jest.spyOn(LeadDetailCloud, 'getDistrictById');
  LeadDetailCloud.getDistrictById({ district: 'bangkok' });
  expect(spygetDistrictById).toHaveBeenCalled();
});

test('calls getDistrict', () => {
  const spygetDistrict = jest.spyOn(LeadDetailCloud, 'getDistrict');
  LeadDetailCloud.getDistrict('');
  expect(spygetDistrict).toHaveBeenCalled();
});

test('calls getProvinceById', () => {
  const spygetProvinceById = jest.spyOn(LeadDetailCloud, 'getProvinceById');
  LeadDetailCloud.getProvinceById('');
  expect(spygetProvinceById).toHaveBeenCalled();
});

test('calls getProvince', () => {
  const spygetProvince = jest.spyOn(LeadDetailCloud, 'getProvince');
  LeadDetailCloud.getProvince();
  expect(spygetProvince).toHaveBeenCalled();
});

test('calls updateLeadData', () => {
  const spyupdateLeadData = jest.spyOn(LeadDetailCloud, 'updateLeadData');
  LeadDetailCloud.updateLeadData({ leadId: 'test', name: 'John' });
  expect(spyupdateLeadData).toHaveBeenCalled();
});

test('calls getAgent', () => {
  const spygetAgent = jest.spyOn(LeadDetailCloud, 'getAgent');
  LeadDetailCloud.getAgent('');
  expect(spygetAgent).toHaveBeenCalled();
});

test('calls addLead', () => {
  apiGateway.doPostAjaxRequest = jest.fn();
  const payload = {
    createBy: 'users/xyz',
    text: 'xyz',
    mailId: 'mails/xyz',
  };
  LeadDetailRepository.addLead(payload);
  expect(apiGateway.doPostAjaxRequest).toHaveBeenCalled();
  expect(apiGateway.doPostAjaxRequest).toHaveBeenCalledTimes(1);
  expect(apiGateway.doPostAjaxRequest).toHaveBeenCalledWith(
    {
      Path: '/api/lead/v1alpha2/leads',
      Type: 'public',
    },
    payload
  );
});

test('calls getCommunications', () => {
  const spygetCommunications = jest.spyOn(LeadDetailCloud, 'getCommunications');
  LeadDetailCloud.getCommunications({ user: 'test' });
  expect(spygetCommunications).toHaveBeenCalled();
});

test('calls addAddressToLeads', () => {
  const spyaddAddressToLeads = jest.spyOn(LeadDetailCloud, 'addAddressToLeads');
  LeadDetailCloud.addAddressToLeads({ user: 'test' });
  expect(spyaddAddressToLeads).toHaveBeenCalled();
});

test('calls addEmail', () => {
  const spyaddEmail = jest.spyOn(LeadDetailCloud, 'addEmail');
  LeadDetailCloud.addEmail({ leadId: 'test' } as any);
  expect(spyaddEmail).toHaveBeenCalled();
});

test('calls getListEmail', () => {
  const spygetListEmail = jest.spyOn(LeadDetailCloud, 'getListEmail');
  LeadDetailCloud.getListEmail({ leadId: 'test' } as any);
  expect(spygetListEmail).toHaveBeenCalled();
});

test('calls createCustomQuote', () => {
  const spycreateCustomQuote = jest.spyOn(LeadDetailCloud, 'createCustomQuote');
  LeadDetailCloud.createCustomQuote('test', { name: 'John' } as any);
  expect(spycreateCustomQuote).toHaveBeenCalled();
});

test('calls createAttachment', () => {
  const spycreateAttachment = jest.spyOn(LeadDetailCloud, 'createAttachment');
  LeadDetailCloud.createAttachment({ leadId: 'test' } as any);
  expect(spycreateAttachment).toHaveBeenCalled();
});

test('calls createAttachment', () => {
  const spygetAttachment = jest.spyOn(LeadDetailCloud, 'getAttachment');
  LeadDetailCloud.getAttachment('');
  expect(spygetAttachment).toHaveBeenCalled();
});

test('calls deleteAppointment', () => {
  const spydeleteAppointment = jest.spyOn(LeadDetailCloud, 'deleteAppointment');
  LeadDetailCloud.deleteAppointment({ userId: '', appointmentId: '' });
  expect(spydeleteAppointment).toHaveBeenCalled();
});

test('calls saveAppointment', () => {
  const spysaveAppointment = jest.spyOn(LeadDetailCloud, 'saveAppointment');
  LeadDetailCloud.saveAppointment({ startTime: new Date() } as any);
  expect(spysaveAppointment).toHaveBeenCalled();
});

test('calls sendSms', () => {
  const spysendSms = jest.spyOn(LeadDetailCloud, 'sendSms');
  LeadDetailCloud.sendSms({ time: '12:00' } as any);
  expect(spysendSms).toHaveBeenCalled();
});

test('calls deleteCoupon', () => {
  const spydeleteCoupon = jest.spyOn(LeadDetailCloud, 'deleteCoupon');
  LeadDetailCloud.deleteCoupon({ leadId: 'test' } as any);
  expect(spydeleteCoupon).toHaveBeenCalled();
});

test('calls addPhone', () => {
  const spyaddPhone = jest.spyOn(LeadDetailCloud, 'addPhone');
  LeadDetailCloud.addPhone({ phone: '098765456' } as any);
  expect(spyaddPhone).toHaveBeenCalled();
});

test('calls sendEmail', () => {
  const sendEmail = jest.spyOn(LeadDetailCloud, 'sendEmail');
  LeadDetailCloud.sendEmail({ email: 'test@gmail.com' } as any);
  expect(sendEmail).toHaveBeenCalled();
});

test('calls pushComment', () => {
  const pushComment = jest.spyOn(LeadDetailCloud, 'pushComment');
  LeadDetailCloud.pushComment({ comment: 'test value' } as any);
  expect(pushComment).toHaveBeenCalled();
});

test('calls getLeadDetailById', () => {
  const getLeadDetailById = jest.spyOn(LeadDetailCloud, 'getLeadDetailById');
  LeadDetailCloud.getLeadDetailById({ leadId: 'test' });
  expect(getLeadDetailById).toHaveBeenCalled();
});

test('calls getMyLeads', () => {
  const leadDetailRepository = new LeadDetailRepository();
  const spyGetMyLead = jest.spyOn(LeadDetailCloud, 'getMyLead');
  leadDetailRepository.getMyLeads(Product, pageState);
  expect(spyGetMyLead).toHaveBeenCalledWith(Product, pageState, 0);
});

import { canDownload } from 'presentation/pages/car-insurance/leads/ImportLeadPage/ImportLeadPageHelper';

const fakeRole = 'roles/admin';
test('Check user could be download data', () => {
  expect(canDownload(fakeRole)).toEqual(true);
});

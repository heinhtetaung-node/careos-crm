import {
  fetchIdsFromUrl,
  getFilterValues,
  getTransformedMessage,
  isValidPackageUrl,
} from './email.helper';

const hostUrl = `https://staging-finance.rabbitinternet.com/en/product/motor-insurance/quotes`;
const packageIds = [938670, 924917];
const compareUrl = `${hostUrl}?compare=${packageIds.join(',')}`;
const detailsUrl = `${hostUrl}?details=${packageIds[0]}`;
const filterValues = `&filter=insuranceCategory=both,sumInsured_min=430000,sumInsured_max=660000`;

const sampleEmailMessage = `
Thank you for choosing Rabbit Care, Thailand’s largest online financial marketplace. We provide the best service and most competitive pricing in the market - guaranteed. 

[[url]] 

Please see attached your car insurance quotation with detailed coverage information, order ID: L62043 
`;

describe('Email helper module', () => {
  describe('isValidPackageUrl', () => {
    it('returns true for valid compare and details url', () => {
      expect(isValidPackageUrl(compareUrl + filterValues)).toEqual(true);
      expect(isValidPackageUrl(detailsUrl + filterValues)).toEqual(true);
    });

    it('returns false for invalid package urls', () => {
      expect(isValidPackageUrl(undefined)).toEqual(false);
      expect(isValidPackageUrl(``)).toEqual(false);
      expect(isValidPackageUrl(hostUrl)).toEqual(false);
      expect(isValidPackageUrl(`${hostUrl}?error=`)).toEqual(false);
    });
  });

  describe('fetchIdsFromUrl', () => {
    it('extracts package ids from url', () => {
      expect(fetchIdsFromUrl(compareUrl)).toEqual(packageIds);
      expect(fetchIdsFromUrl(detailsUrl)).toEqual([packageIds[0]]);
    });
  });

  describe('getTransformedMessage', () => {
    it('replaces {{url}} with appropriate {{package}} or {{compare}} placeholders', () => {
      expect(getTransformedMessage(sampleEmailMessage, compareUrl)).toContain(
        `{{compare:938670,924917}}`
      );
      expect(getTransformedMessage(sampleEmailMessage, detailsUrl)).toContain(
        `{{package:938670}}`
      );
    });
  });
  describe('getFilterValue', () => {
    it('returns null when passed with empty string url', () => {
      const result = getFilterValues('');
      expect(result).toBeNull();
    });
    it('returns null when passed url with no filter', () => {
      const result = getFilterValues(detailsUrl);
      expect(result).toBeNull();
    });
    it('returns filter string when passed with filter values', () => {
      const result = getFilterValues(detailsUrl + filterValues);
      expect(result).toEqual(
        'insuranceCategory=both,sumInsured_min=430000,sumInsured_max=660000'
      );
    });
  });
});

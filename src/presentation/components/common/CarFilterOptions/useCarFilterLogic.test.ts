import { renderHook } from '@testing-library/react';
import { useCarFilterLogic } from './useCarFilterLogic';

const mockUpdateLead = jest.fn();
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: () => ({ updateLead: mockUpdateLead }),
  })
);
describe('useCarFilterLogic', () => {
  const mockSetCurrentData = jest.fn();
  const mockSetCurrentMultipleData = jest.fn();
  const mockLeadData = { name: 'test-lead' };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('transformValue', () => {
    it('transforms boolean string values correctly', () => {
      const { result } = renderHook(() =>
        useCarFilterLogic({
          leadData: mockLeadData,
          setCurrentData: mockSetCurrentData,
          setCurrentMultipleData: mockSetCurrentMultipleData,
        })
      );
      expect(result.current.transformValue('true')).toBe(true);
      expect(result.current.transformValue('false')).toBe(false);
      expect(result.current.transformValue('PERSONAL')).toBe('personal');
      expect(result.current.transformValue('COMMERCIAL')).toBe('commercial');
      expect(result.current.transformValue('other')).toBe('other');
    });
  });
  describe('handleChange', () => {
    describe('early return cases', () => {
      it('handles carSubModelYear with value "0" - sets subModelText to empty and returns early', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('carSubModelYear', '0');
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          subModelText: '',
          carSubModelYear: '0',
        });
        expect(mockSetCurrentData).not.toHaveBeenCalled();
        expect(mockUpdateLead).not.toHaveBeenCalled();
      });
      it('handles carSubModelYear with non-zero value - follows normal flow', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('carSubModelYear', '2023');
        expect(mockSetCurrentData).toHaveBeenCalledWith(
          'carSubModelYear',
          '2023'
        );
        expect(mockUpdateLead).toHaveBeenCalledWith('/carSubModelYear', '2023');
        expect(mockSetCurrentMultipleData).not.toHaveBeenCalled();
      });
      it('returns early for brand key without API calls', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('brand', 'Toyota');
        expect(mockSetCurrentData).toHaveBeenCalledWith('brand', 'Toyota');
        expect(mockUpdateLead).not.toHaveBeenCalled();
      });
      it('returns early for model key without API calls', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('model', 'Camry');
        expect(mockSetCurrentData).toHaveBeenCalledWith('model', 'Camry');
        expect(mockUpdateLead).not.toHaveBeenCalled();
      });
      it('returns early for year key without API calls', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('year', '2023');
        expect(mockSetCurrentData).toHaveBeenCalledWith('year', '2023');
        expect(mockUpdateLead).not.toHaveBeenCalled();
      });
    });
    describe('province change with carLicensePlate', () => {
      it('handles province change with carLicensePlate present', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            carLicensePlate: 'ABC123',
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('province', 'Bangkok');
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/carLicensePlate',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          carLicensePlate: '',
          province: 'Bangkok',
        });
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/registeredProvince',
          'Bangkok'
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/carLicensePlate',
          '',
          'remove'
        );
      });
      it('handles province change without carLicensePlate', () => {
        const { result } = renderHook(() =>
          useCarFilterLogic({
            leadData: mockLeadData,
            setCurrentData: mockSetCurrentData,
            carLicensePlate: undefined,
            setCurrentMultipleData: mockSetCurrentMultipleData,
          })
        );
        result.current.handleChange('province', 'Bangkok');
        expect(mockUpdateLead).not.toHaveBeenCalledWith(
          '/carLicensePlate',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).not.toHaveBeenCalled();
        expect(mockSetCurrentData).toHaveBeenCalledWith('province', 'Bangkok');
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/registeredProvince',
          'Bangkok'
        );
      });
    });
  });
});

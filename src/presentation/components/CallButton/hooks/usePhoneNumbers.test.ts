import { renderHook } from '__tests__/rtl-test-utils';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { PhoneNumber } from 'shared/types/customer';
import usePhoneNumbers from './usePhoneNumbers';

jest.mock('presentation/redux/selectors/lead');

const mockUseGetLeadSelector = useGetLeadSelector as jest.MockedFunction<
  typeof useGetLeadSelector
>;

describe('usePhoneNumbers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return phone numbers and primary phone index from lead data', () => {
    const mockPhoneNumbers: PhoneNumber[] = [
      { phone: '0999999999', status: 'verified' },
      { phone: '0888888888', status: 'unverified' },
      { phone: '0777777777', status: 'verified' },
    ];

    mockUseGetLeadSelector.mockReturnValue({
      data: {
        customerPhoneNumber: mockPhoneNumbers,
        primaryPhoneIndex: 1,
      },
    } as any);

    const { result } = renderHook(() => usePhoneNumbers());

    expect(result.current.phoneNumbers).toEqual(mockPhoneNumbers);
    expect(result.current.primaryPhoneIndex).toBe(1);
  });

  it('should return empty array when customerPhoneNumber is undefined', () => {
    mockUseGetLeadSelector.mockReturnValue({
      data: {
        primaryPhoneIndex: 0,
      },
    } as any);

    const { result } = renderHook(() => usePhoneNumbers());

    expect(result.current.phoneNumbers).toEqual([]);
    expect(result.current.primaryPhoneIndex).toBe(0);
  });

  it('should return default primaryPhoneIndex of 0 when primaryPhoneIndex is undefined', () => {
    const mockPhoneNumbers: PhoneNumber[] = [
      { phone: '0999999999', status: 'verified' },
    ];

    mockUseGetLeadSelector.mockReturnValue({
      data: {
        customerPhoneNumber: mockPhoneNumbers,
      },
    } as any);

    const { result } = renderHook(() => usePhoneNumbers());

    expect(result.current.phoneNumbers).toEqual(mockPhoneNumbers);
    expect(result.current.primaryPhoneIndex).toBe(0);
  });
});

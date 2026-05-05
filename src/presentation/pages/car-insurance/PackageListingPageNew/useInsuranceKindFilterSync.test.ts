import { renderHook, act } from '@testing-library/react-hooks';
import { useInsuranceKindFilterSync } from './useInsuranceKindFilterSync';

const createParams = (
  leadData: {
    insuranceKind?: string;
    voluntaryInsuranceType?: string[];
  } = {
    insuranceKind: 'both',
    voluntaryInsuranceType: ['type_1'],
  }
) => ({
  leadData,
  updateLead: jest.fn(),
  setInsuranceTypes: jest.fn(),
  setInsuranceCategory: jest.fn(),
  setCurrentData: jest.fn((updater) => updater({ existing: true })),
});

describe('useInsuranceKindFilterSync', () => {
  it('hydrates selected insurance types and category from lead data', () => {
    const params = createParams();

    renderHook(() => useInsuranceKindFilterSync(params));

    expect(params.setInsuranceTypes).toHaveBeenCalledWith([
      'type_1',
      'compulsory',
    ]);
    expect(params.setInsuranceCategory).toHaveBeenCalledWith('both');
    expect(params.setCurrentData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates lead and local filter state when insurance type selection changes', () => {
    const params = createParams({
      insuranceKind: 'voluntary',
      voluntaryInsuranceType: [],
    });
    const { result } = renderHook(() => useInsuranceKindFilterSync(params));

    act(() => {
      result.current(['type_1', 'compulsory']);
    });

    expect(params.updateLead).toHaveBeenCalledWith('/voluntaryInsuranceType', [
      'type_1',
    ]);
    expect(params.updateLead).toHaveBeenCalledWith('/insuranceKind', 'both');
    expect(params.setInsuranceCategory).toHaveBeenCalledWith('both');
    expect(params.setInsuranceTypes).toHaveBeenCalledWith([
      'type_1',
      'compulsory',
    ]);
  });

  it('does not rewrite lead insurance kind when the resolved kind is unchanged', () => {
    const params = createParams({
      insuranceKind: 'both',
      voluntaryInsuranceType: ['type_1'],
    });
    const { result } = renderHook(() => useInsuranceKindFilterSync(params));

    act(() => {
      result.current(['type_1', 'compulsory']);
    });

    expect(params.updateLead).not.toHaveBeenCalledWith(
      '/insuranceKind',
      expect.anything()
    );
  });
});

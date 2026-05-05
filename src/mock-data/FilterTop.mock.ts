export const mockFilterTopProps = {
  priceRange: [1000, 1000000] as [number, number],
  initialPriceRange: [0, 1000000] as [number, number],
  onPriceRangeChange: jest.fn(),
  insuranceTypes: [],
  onInsuranceTypesChange: jest.fn(),
  repairTypes: [],
  onRepairTypesChange: jest.fn(),
  deductibles: [],
  onDeductiblesChange: jest.fn(),
  selectedInsurers: [],
  onSelectedInsurersChange: jest.fn(),
};

export const mockFilterTopPropsWithInsuranceTypes = {
  ...mockFilterTopProps,
  insuranceTypes: ['type_1'],
};

export const mockFilterTopPropsWithMultipleInsuranceTypes = {
  ...mockFilterTopProps,
  insuranceTypes: ['type_1', 'type_3'],
};

export const mockFilterTopPropsWithSelectedInsurers = {
  ...mockFilterTopProps,
  selectedInsurers: ['insurers/7'],
};

export const mockFilterTopPropsWithCallbacks = {
  ...mockFilterTopProps,
  onRepairTypesChange: jest.fn(),
  onDeductiblesChange: jest.fn(),
};

export const mockFilterTopPropsWithState = (overrides = {}) => ({
  ...mockFilterTopProps,
  ...overrides,
});

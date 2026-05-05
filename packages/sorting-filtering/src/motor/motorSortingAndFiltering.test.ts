import { filterDeductible, sortItems } from './index';

const mockPackages = [
  {
    id: 1,
    invoicePrice: '100000',
    sumCoverage: '222222222',
    deductibleAmount: '0',
  },
  {
    id: 2,
    invoicePrice: '200000',
    sumCoverage: '222222221',
    deductibleAmount: '100000',
  },
];
describe('sortItem', () => {
  it('should sort Items by price', () => {
    const result = sortItems(
      mockPackages as any,
      { sortBy: 'price' } as any,
      'en'
    );
    expect(result).toEqual([
      {
        id: 1,
        invoicePrice: '100000',
        sumCoverage: '222222222',
        deductibleAmount: '0',
      },
      {
        id: 2,
        invoicePrice: '200000',
        sumCoverage: '222222221',
        deductibleAmount: '100000',
      },
    ]);
  });

  it('should sort Items by sumInsured', () => {
    const result = sortItems(
      mockPackages as any,
      { sortBy: 'sumInsured' } as any,
      'en'
    );
    expect(result).toEqual([
      {
        id: 2,
        invoicePrice: '200000',
        sumCoverage: '222222221',
        deductibleAmount: '100000',
      },
      {
        id: 1,
        invoicePrice: '100000',
        sumCoverage: '222222222',
        deductibleAmount: '0',
      },
    ]);
  });
});

describe('filterDeductible', () => {
  it('all packages', () => {
    const result = filterDeductible(mockPackages, {
      deductible: 'all_packages',
    });
    expect(result).toEqual([
      {
        id: 1,
        invoicePrice: '100000',
        sumCoverage: '222222222',
        deductibleAmount: '0',
      },
      {
        id: 2,
        invoicePrice: '200000',
        sumCoverage: '222222221',
        deductibleAmount: '100000',
      },
    ]);
  });

  it('only deductible', () => {
    const result = filterDeductible(mockPackages, {
      deductible: 'only_deductible',
    });
    expect(result).toEqual([
      {
        id: 2,
        invoicePrice: '200000',
        sumCoverage: '222222221',
        deductibleAmount: '100000',
      },
    ]);
  });

  it('no deductible', () => {
    const result = filterDeductible(mockPackages, {
      deductible: 'no_deductible',
    });
    expect(result).toEqual([
      {
        id: 1,
        invoicePrice: '100000',
        sumCoverage: '222222222',
        deductibleAmount: '0',
      },
    ]);
  });
});

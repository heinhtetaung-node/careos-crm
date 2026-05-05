export const insuranceTypeCases: [string[], string[]][] = [
  [[], []],
  [
    ['type_1', 'type_2'],
    ['type 1', 'type 2'],
  ],
  [['compulsory'], ['compulsory']],
  [['type_1', 'compulsory'], ['type 1 compulsory']],
];

export const repairTypeCases: [string[], string[]][] = [
  [[], []],
  [
    ['garage', 'dealer'],
    ['garage repair', 'dealer repair'],
  ],
];

export const deductibleCases: [string[], string[]][] = [
  [[], []],
  [['no_deductible'], ['false']],
  [['only_deductible'], ['true']],
  [['custom'], ['custom']],
  [
    ['no_deductible', 'only_deductible', 'other'],
    ['false', 'true', 'other'],
  ],
];

export const insurerCases: [string[], string[]][] = [
  [[], []],
  [
    ['insurers/123', 'insurers/456'],
    ['123', '456'],
  ],
  [['invalid', 'insurers/789'], ['789']],
  [['bad/key', 'insurers/42'], ['42']],
];

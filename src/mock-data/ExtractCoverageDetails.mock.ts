export const mockCoverageData = {
  empty: {},

  withoutSingleValue: {
    personalInjury: null,
    maximumAnnualCoverage: null,
  },

  allCoverageTypes: {
    maximumAnnualCoverage: { currencyCode: 'THB', units: '500000', nanos: 0 },
    personalInjury: { currencyCode: 'THB', units: '100000', nanos: 0 },
    personalMedicalExpense: { currencyCode: 'THB', units: '50000', nanos: 0 },
    personalBailBond: { currencyCode: 'THB', units: '25000', nanos: 0 },
    thirdPartyPropertyDamage: {
      currencyCode: 'THB',
      units: '200000',
      nanos: 0,
    },
    thirdPartyDeathPerPerson: {
      currencyCode: 'THB',
      units: '300000',
      nanos: 0,
    },
    thirdPartyMaxDeath: { currencyCode: 'THB', units: '1000000', nanos: 0 },
    ownedCarFlood: { currencyCode: 'THB', units: '150000', nanos: 0 },
    ownedCarFireTheft: { currencyCode: 'THB', units: '200000', nanos: 0 },
  },

  unknownCoverageType: {
    unknownType: { currencyCode: 'THB', units: '999999', nanos: 0 },
  },

  duplicateCoverageTypes: {
    personalInjury: { currencyCode: 'THB', units: '200000', nanos: 0 },
  },

  decimalValues: {
    personalInjury: { currencyCode: 'THB', units: '100000', nanos: 500000000 },
  },

  invalidNumericValues: {
    personalInjury: { currencyCode: 'THB', units: 'invalid', nanos: 0 },
  },

  nullUndefinedSingleValue: {
    personalInjury: null,
    maximumAnnualCoverage: null,
  },

  emptyStringValues: {
    personalInjury: { currencyCode: 'THB', units: '', nanos: 0 },
  },

  zeroValues: {
    personalInjury: { currencyCode: 'THB', units: '0', nanos: 0 },
  },

  negativeValues: {
    personalInjury: { currencyCode: 'THB', units: '-1000', nanos: 0 },
  },

  scientificNotation: {
    personalInjury: { currencyCode: 'THB', units: '1000000', nanos: 0 },
  },

  infinityValues: {
    personalInjury: { currencyCode: 'THB', units: 'Infinity', nanos: 0 },
    maximumAnnualCoverage: {
      currencyCode: 'THB',
      units: '-Infinity',
      nanos: 0,
    },
  },

  mixedValidInvalid: {
    personalInjury: { currencyCode: 'THB', units: '100000', nanos: 0 },
    maximumAnnualCoverage: { currencyCode: 'THB', units: 'invalid', nanos: 0 },
    personalMedicalExpense: { currencyCode: 'THB', units: '50000', nanos: 0 },
  },
};

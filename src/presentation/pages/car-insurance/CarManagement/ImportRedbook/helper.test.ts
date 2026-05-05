import {
  importRedbookTemplate,
  importRedbookRequireColumn,
  importRedbookTemplateWithType,
} from './helper';

describe('ImportRedbook helper', () => {
  it('should have 56 columns in the template', () => {
    expect(importRedbookTemplate).toHaveLength(56);
  });

  it('should include VehicleKey as the first template column', () => {
    expect(importRedbookTemplate[0]).toBe('VehicleKey');
  });

  it('should include BatteryWarrantyKm as the last template column', () => {
    expect(importRedbookTemplate[55]).toBe('BatteryWarrantyKm');
  });

  it('should require only VehicleKey', () => {
    expect(importRedbookRequireColumn).toEqual(['VehicleKey']);
  });

  it('should have templateWithType entries matching template length', () => {
    expect(importRedbookTemplateWithType).toHaveLength(
      importRedbookTemplate.length
    );
  });

  it('should have string|number type for mixed fields', () => {
    const mixedFields = [
      'FamilyCode',
      'FamilyDescription',
      'FAMILYDESCRIPTIONLL',
      'BadgeDescription',
      'BadgeDescriptionThai',
      'BadgeSecondaryDescription',
      'BadgeSecondaryDescriptionThai',
      'Series',
      'SeriesThai',
    ];
    mixedFields.forEach((name) => {
      const field = importRedbookTemplateWithType.find((t) => t.name === name);
      expect(field?.dataType).toBe('string|number');
    });
  });

  it('should have number type for numeric fields', () => {
    const numericFields = ['YearGroup', 'NewPrice', 'EngineSize', 'Cylinders'];
    numericFields.forEach((name) => {
      const field = importRedbookTemplateWithType.find((t) => t.name === name);
      expect(field?.dataType).toBe('number');
    });
  });

  it('should have string type for text-only fields', () => {
    const stringFields = [
      'VehicleKey',
      'MakeDescription',
      'Description',
      'InsuranceCode',
    ];
    stringFields.forEach((name) => {
      const field = importRedbookTemplateWithType.find((t) => t.name === name);
      expect(field?.dataType).toBe('string');
    });
  });

  it('should have matching names between template and templateWithType', () => {
    const typeNames = importRedbookTemplateWithType.map((t) => t.name);
    expect(typeNames).toEqual(importRedbookTemplate);
  });
});

import { insuranceMotorTemplateWithDatatype } from './importPackagePageHelper';

describe('insuranceMotorTemplateWithDatatype', () => {
  const getDataType = (name: string) =>
    insuranceMotorTemplateWithDatatype.find((f) => f.name === name)?.dataType;

  it('allows numeric values for vehicle_brand', () => {
    expect(getDataType('vehicle_brand')).toBe('string|number');
  });

  it('allows numeric values for vehicle_model', () => {
    expect(getDataType('vehicle_model')).toBe('string|number');
  });

  it('allows numeric values for vehicle_submodel', () => {
    expect(getDataType('vehicle_submodel')).toBe('string|number');
  });
});

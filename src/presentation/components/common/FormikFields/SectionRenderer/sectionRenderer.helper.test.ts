import { setValuesToDataSchema } from './helper';

const mockSchema = {
  firstItem: {
    InputComponent: 'Comp' as any,
    inputProps: { prop1: '1', prop2: '2' },
    CustomRowComponent: undefined,
  },
};

describe('setValuesToDataSchema', () => {
  it('should set patch values to a dataschema and return a new dataschema', () => {
    const result = setValuesToDataSchema(mockSchema, [
      { name: 'firstItem', patches: { prop1: 1 } },
    ]);
    expect(result).toStrictEqual({
      firstItem: {
        InputComponent: 'Comp',
        CustomRowComponent: undefined,
        inputProps: { prop1: 1, prop2: '2' },
      },
    });
  });
});

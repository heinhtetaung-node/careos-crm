import {
  transformUrlQuerySearch,
  transformUrlQuerySearchTrueFalse,
} from './helper';

describe('transformUrlQuerySearch', () => {
  it('returns empty string when selectValue is empty', () => {
    const result = transformUrlQuerySearch('', {
      selectValue: '',
      inputValue: 'value',
    });
    expect(result).toBe('');
  });

  it('returns empty string when inputValue is falsy', () => {
    const resultEmpty = transformUrlQuerySearch('', {
      selectValue: 'some.field',
      inputValue: '',
    });
    const resultFalse = transformUrlQuerySearch('', {
      selectValue: 'some.field',
      inputValue: false,
    });

    expect(resultEmpty).toBe('');
    expect(resultFalse).toBe('');
  });

  it('returns query without leading space when url is empty', () => {
    const result = transformUrlQuerySearch('', {
      selectValue: 'lead.status',
      inputValue: 'ACTIVE',
    });
    expect(result).toBe('lead.status="ACTIVE"');
  });

  it('returns query with leading space when url already has content', () => {
    const result = transformUrlQuerySearch('existing', {
      selectValue: 'lead.status',
      inputValue: 'PURCHASED',
    });
    expect(result).toBe(' lead.status="PURCHASED"');
  });

  it('respects custom operator parameter', () => {
    const result = transformUrlQuerySearch(
      'existing',
      {
        selectValue: 'lead.type',
        inputValue: 'RETAINER',
      },
      '!='
    );
    expect(result).toBe(' lead.type!="RETAINER"');
  });
});

describe('transformUrlQuerySearchTrueFalse', () => {
  it('returns query without leading space when url is empty', () => {
    const result = transformUrlQuerySearchTrueFalse('', {
      selectValue: 'lead.isRejected',
      inputValue: 'true',
    });
    expect(result).toBe('lead.isRejected="true"');
  });

  it('returns query with leading space when url already has content', () => {
    const result = transformUrlQuerySearchTrueFalse('existing', {
      selectValue: 'lead.isRejected',
      inputValue: 'true',
    });
    expect(result).toBe(' lead.isRejected="true"');
  });

  it('uses default operator "=" when operator is not provided', () => {
    const result = transformUrlQuerySearchTrueFalse('', {
      selectValue: 'lead.isRejected',
      inputValue: 'true',
    });
    expect(result).toBe('lead.isRejected="true"');
  });

  it('respects custom operator parameter', () => {
    const result = transformUrlQuerySearchTrueFalse(
      'existing',
      {
        selectValue: 'lead.isRejected',
        inputValue: 'true',
      },
      '!='
    );
    expect(result).toBe(' lead.isRejected!="true"');
  });

  it('wraps inputValue in quotes when strictlyBooleanValue is false (default)', () => {
    const result = transformUrlQuerySearchTrueFalse('', {
      selectValue: 'lead.isRejected',
      inputValue: true,
    });
    expect(result).toBe('lead.isRejected="true"');
  });

  it('wraps string inputValue in quotes when strictlyBooleanValue is false', () => {
    const result = transformUrlQuerySearchTrueFalse('', {
      selectValue: 'lead.isRejected',
      inputValue: 'true',
    });
    expect(result).toBe('lead.isRejected="true"');
  });

  it('does not wrap inputValue in quotes when strictlyBooleanValue is true', () => {
    const result = transformUrlQuerySearchTrueFalse(
      '',
      {
        selectValue: 'lead.isRejected',
        inputValue: true,
      },
      '=',
      true
    );
    expect(result).toBe('lead.isRejected=true');
  });

  it('does not wrap string inputValue in quotes when strictlyBooleanValue is true', () => {
    const result = transformUrlQuerySearchTrueFalse(
      '',
      {
        selectValue: 'lead.isRejected',
        inputValue: 'true',
      },
      '=',
      true
    );
    expect(result).toBe('lead.isRejected=true');
  });

  it('handles boolean false inputValue with strictlyBooleanValue false', () => {
    const result = transformUrlQuerySearchTrueFalse('', {
      selectValue: 'lead.isRejected',
      inputValue: false,
    });
    expect(result).toBe('lead.isRejected="false"');
  });

  it('handles boolean false inputValue with strictlyBooleanValue true', () => {
    const result = transformUrlQuerySearchTrueFalse(
      '',
      {
        selectValue: 'lead.isRejected',
        inputValue: false,
      },
      '=',
      true
    );
    expect(result).toBe('lead.isRejected=false');
  });

  it('handles custom operator with strictlyBooleanValue true', () => {
    const result = transformUrlQuerySearchTrueFalse(
      'existing',
      {
        selectValue: 'lead.isRejected',
        inputValue: true,
      },
      '!=',
      true
    );
    expect(result).toBe(' lead.isRejected!=true');
  });

  it('handles empty url with strictlyBooleanValue true and custom operator', () => {
    const result = transformUrlQuerySearchTrueFalse(
      '',
      {
        selectValue: 'lead.isRejected',
        inputValue: false,
      },
      '!=',
      true
    );
    expect(result).toBe('lead.isRejected!=false');
  });
});

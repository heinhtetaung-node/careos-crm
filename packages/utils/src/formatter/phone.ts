export const isLandLine = (value: string, rule?: string) => {
  if (!value || ['phonevi', 'phonesg'].includes(rule as any)) {
    return false;
  }
  const landLinePrefix = ['02', '03', '04', '05', '07'];
  return landLinePrefix.some((prefix) => value.startsWith(prefix));
};

type Country = 'TH' | 'VN' | 'SG';

const commonFormatter = (
  country: Country,
  value: string,
  isLandline = false
): string => {
  if (!value) return '';

  const len = value.length;

  const patterns = {
    TH: isLandline
      ? len <= 5
        ? [/^(\d{2})(\d{1,3})/, '$1-$2']
        : [/^(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3']
      : len <= 6
        ? [/^(\d{3})(\d{1,3})/, '$1-$2']
        : [/^(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3'],
    VN: /^84/.test(value)
      ? [/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3-$4']
      : len <= 7
        ? [/^(\d{4})(\d{1,3})/, '$1-$2']
        : [/^(\d{4})(\d{3})(\d{1,3})/, '$1-$2-$3'],
    SG: /^65/.test(value)
      ? [/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3-$4']
      : [/^(\d{4})(\d{1,4})/, '$1-$2'],
  };

  const [regex, format] = patterns[country];
  return value.replace(regex, format as any);
};

export const formatPhoneNumber = (value: string, rule: string) => {
  if (!value) {
    return '';
  }
  switch (rule) {
    case 'phonevi':
      return commonFormatter('VN', value);
    case 'phonesg':
      return commonFormatter('SG', value);
    default:
      return commonFormatter('TH', value, isLandLine(value));
  }
};

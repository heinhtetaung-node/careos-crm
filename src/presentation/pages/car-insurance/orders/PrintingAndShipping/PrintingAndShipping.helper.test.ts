import { formatDateTime } from './helper';

describe('formatDateTime', () => {
  it('should return formatted date time', () => {
    const response = formatDateTime('2024-03-11T03:51:00.156344Z');
    expect(response).toBe('11/03/2024 (03:51:00)');
  });

  it('should return formatted date time new', () => {
    const response = formatDateTime('2024-03-06T06:41:24.190198Z');
    expect(response).toBe('06/03/2024 (06:41:24)');
  });

  it('should return formatted date time', () => {
    const response = formatDateTime('12/24/2020');
    expect(response).toBe('23/12/2020 (17:00:00)');
  });

  it('should return formatted date time', () => {
    const response = formatDateTime('2023/12/24');
    expect(response).toBe('23/12/2023 (17:00:00)');
  });

  it('should return formatted date time', () => {
    const response = formatDateTime('25/12/1900');
    expect(response).toBe('');
  });
});

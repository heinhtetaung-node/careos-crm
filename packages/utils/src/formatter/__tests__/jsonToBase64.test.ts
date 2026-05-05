import { jsonToBase64 } from '../jsonToBase64';

describe('convert jsonToBase64', () => {
  it('should convert to base64', () => {
    const result = jsonToBase64({ premium_installment: true });
    expect(result).toBe('eyJwcmVtaXVtX2luc3RhbGxtZW50Ijp0cnVlfQ==');
  });
});

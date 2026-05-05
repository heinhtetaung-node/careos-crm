import getEndpoint, { ServicesName } from './endpointHelper';

describe('getEndpoint', () => {
  it('should return api endpoint with path', () => {
    const result = getEndpoint('/api/v1alpha1/lead/name');
    expect(result).toBe(
      `${process.env.VITE_API_ENDPOINT}/api/v1alpha1/lead/name`
    );
  });

  it('should return api endpoint when passed path doesnt have slash in path', () => {
    const result = getEndpoint('api/v1alpha1/leadDetails');
    expect(result).toBe(
      `${process.env.VITE_API_ENDPOINT}/api/v1alpha1/leadDetails`
    );
  });

  it('should return go endpoint with path', () => {
    const result = getEndpoint('/api/phones', ServicesName.GFF);
    expect(result).toBe(`${process.env.VITE_GO_GATEWAY_ENDPOINT}/api/phones`);
  });

  it('should return node endpoint with path', () => {
    const result = getEndpoint('/api/email', ServicesName.NODE);
    expect(result).toBe(`${process.env.VITE_GATEWAY_ENDPOINT}/api/email`);
  });

  it('should return kratos endpoint with path', () => {
    const result = getEndpoint('/login', ServicesName.KRATOS);
    expect(result).toBe(`${process.env.VITE_KRATOS_URL}/login`);
  });
});

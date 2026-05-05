// Mock window.newrelic and its methods
export const mockNewRelic: any = {
  noticeError: jest.fn(),
  addPageAction: jest.fn(),
  interaction: jest.fn(),
  setPageViewName: jest.fn(),
  setCustomAttribute: jest.fn(),
  setUserId: jest.fn(),
  // Add other methods as needed
};

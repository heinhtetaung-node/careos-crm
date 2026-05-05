export const scrollTestCases = [
  { scrollTop: 0, scrollHeight: 200, clientHeight: 100, shouldTrigger: false }, // 0 + 100 >= 200 - 10 = false
  { scrollTop: 50, scrollHeight: 200, clientHeight: 100, shouldTrigger: false }, // 50 + 100 >= 200 - 10 = false
  { scrollTop: 90, scrollHeight: 200, clientHeight: 100, shouldTrigger: true }, // 90 + 100 >= 200 - 10 = true
  { scrollTop: 100, scrollHeight: 200, clientHeight: 100, shouldTrigger: true }, // 100 + 100 >= 200 - 10 = true
  { scrollTop: 200, scrollHeight: 300, clientHeight: 100, shouldTrigger: true }, // 200 + 100 >= 300 - 10 = true
  { scrollTop: 190, scrollHeight: 300, clientHeight: 100, shouldTrigger: true }, // 190 + 100 >= 300 - 10 = true
];

export const createMockScrollEvent = (
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
) =>
  ({
    currentTarget: {
      scrollTop,
      scrollHeight,
      clientHeight,
    },
  }) as React.UIEvent<HTMLDivElement>;

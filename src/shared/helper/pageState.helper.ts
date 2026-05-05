interface IPageToken {
  page: number;
  token: string;
}
const getPageState = (tokenList: IPageToken[], pageIndex: number) => {
  const token = tokenList.find((page) => page.page === pageIndex)?.token || '';
  return {
    currentPage: pageIndex,
    pageToken: token,
  };
};
export default getPageState;

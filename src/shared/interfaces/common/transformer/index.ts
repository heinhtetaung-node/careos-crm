export interface ITransformer<PresentationModel, RequestModel> {
  transformDataToPresentation(...params: any): PresentationModel;

  transformListDataToListPresentation(...params: any): Array<PresentationModel>;

  transformPresentationToRequestModel(...params: any): RequestModel;

  transformListPresentationToListRequestModel(
    ...params: any
  ): Array<RequestModel>;
}

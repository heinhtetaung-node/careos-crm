export interface IAttachment {
  name: string;
  fileSize: string;
  label: string;
  embedded: boolean;
  createTime: string;
  updateTime: string;
  deleteTime: string;
  createdBy: string;
}

export const customAttachment = (data: IAttachment[]) => {
  const customData = data?.filter(
    (item: IAttachment) => item.embedded === false
  );
  return customData;
};

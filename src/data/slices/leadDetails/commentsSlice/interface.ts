export interface ParamProps {
  [key: string]: number | string;
}

export interface CommentProps {
  createBy: string;
  createTime: string;
  deleteTime: null | string;
  name: string;
  text: string;
  updateTime: string;
}

export interface CommentRequestPayload {
  leadId: string;
  commentsParam: ParamProps;
}

export interface CommentResponsePayload {
  comments: CommentProps[];
  nextPageToken: string;
}

export interface AddCommentRequestPayload {
  leadId: string;
  text: string;
}

import {
  OrderCommentTypes,
  clearComment,
  getComment,
  getCommentSuccess,
  getCommentFail,
} from 'presentation/redux/actions/order/comment';

const test = { a: 'test ' };

describe('Order Activity Comment Actions', () => {
  it('Should dispatch clear all comment action', () => {
    const action = {
      type: OrderCommentTypes.CLEAR_ALL_COMMENT,
      payload: test,
    };
    expect(clearComment(test)).toEqual(action);
  });

  it('Should dispatch get comment action', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT,
      payload: test,
    };
    expect(getComment(test)).toEqual(action);
  });

  it('Should dispatch get comment success action', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT_SUCCESS,
      payload: test,
    };
    expect(getCommentSuccess(test)).toEqual(action);
  });

  it('Should dispatch get comment failure action', () => {
    const action = {
      type: OrderCommentTypes.GET_COMMENT_FAIL,
      payload: test,
    };
    expect(getCommentFail(test)).toEqual(action);
  });
});

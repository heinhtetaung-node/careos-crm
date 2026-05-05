import OrderCommentCloud from './comment';

import OrderDetailRepository from '.';

test('calls getComment for an order', () => {
  const orderDetailRepository = new OrderDetailRepository();

  const spyGetComment = jest.spyOn(OrderCommentCloud, 'getComment');
  const payload = {
    name: `orders/5c78080c-8869-4aaf-82e5-65393f517d20`,
    params: {
      pageSize: 5,
      showDeleted: false,
    },
  };

  orderDetailRepository.getComment(payload);

  expect(spyGetComment).toHaveBeenCalledWith(payload);
});

test('calls createOrderComment for an order', () => {
  const orderDetailRepository = new OrderDetailRepository();

  const spyAddComment = jest.spyOn(OrderCommentCloud, 'createOrderComment');
  const payload = {
    orderId: `orders/5c78080c-8869-4aaf-82e5-65393f517d20`,
    createBy: '',
    text: 'test comment',
  };

  orderDetailRepository.createOrderComment(payload);

  expect(spyAddComment).toHaveBeenCalledWith(payload);
});

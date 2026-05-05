const params = window.location.pathname.split('/');
const last = params[params.length - 1];
const getCommentName = params.includes('policies')
  ? `orders/${params[params.indexOf('orders') + 1]}/`
  : `orders/${last}/`;

export default getCommentName;

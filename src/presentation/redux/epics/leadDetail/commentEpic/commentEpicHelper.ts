const params = window.location.pathname.split('/');

const getCommentName = `leads/${params[params.length - 1]}/`;

export default getCommentName;

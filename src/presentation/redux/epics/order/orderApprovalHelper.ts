const params = window.location.pathname.split('/');
const last = params[params.length - 1];
const isApprovalPage = last === 'approval';

export default isApprovalPage;

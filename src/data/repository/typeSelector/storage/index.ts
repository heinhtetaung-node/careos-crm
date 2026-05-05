// import StorageGateway from 'data/gateway/storage';
// import { TokenType } from 'data/constants';
import { LeadTypeFilter, ProductTypeFilter } from 'config/TypeFilter';

const getProducts = () => {
  return new Promise((resolve) => {
    resolve(ProductTypeFilter);
  });
};

const getLeadTypes = () => {
  return new Promise((resolve) => {
    resolve(LeadTypeFilter);
  });
};

export default {
  getProducts,
  getLeadTypes,
};

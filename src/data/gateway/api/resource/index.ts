import Admin from './admin';
import Auth from './auth';
import Call from './call';
import CarDetail from './carDetail';
import Document from './document';
import ImportFile from './importFile';
import Lead from './lead';
import LeadDetail from './leadDetail';
import Order from './order';
import OrderDetail from './orderDetail';
import Package from './package';
import Presence from './presence';
import ProvinceDetail from './provinceDetail';
import Team from './team';
import TypeSelector from './typeSelector';
import User from './user';

// eslint-disable-next-line import/prefer-default-export
export const RabbitResource = {
  TypeSelector,
  Admin,
  User,
  Team,
  Lead,
  LeadDetail,
  Presence,
  Auth,
  Call,
  Package,
  ImportFile,
  CarDetail,
  ProvinceDetail,
  Order,
  OrderDetail,
  Document,
};

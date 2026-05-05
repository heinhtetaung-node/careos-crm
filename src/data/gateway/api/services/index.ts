import AssignApi from './assign';
import BffLookupApi from './bffLookup';
import CarsApi from './cars';
import CustomerApi from './customer';
import ImportApi from './import';
import LeadApi from './lead';
import MailerApi from './mailer';
import OrderApi from './order';
import UserApi from './user';

const apiServices = {
  OrderApi,
  CustomerApi,
  UserApi,
  ImportApi,
  BffLookupApi,
  LeadApi,
  MailerApi,
  CarsApi,
  AssignApi,
};

export default apiServices;

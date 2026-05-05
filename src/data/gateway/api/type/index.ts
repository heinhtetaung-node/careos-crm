const TYPE_ADMIN = 'admin';
const TYPE_CUSTOMER = 'customer';
const TYPE_PUBLIC = 'public';
const TYPE_GOOGLE_MAPS = 'google_maps';
const TYPE_NEST = 'nest';
const TYPE_ATTACHMENT = 'attachment';

export enum EndPointWithType {
  NEST = 'http://localhost:3100',
  ATTACHMENT = '',
}

export default {
  Public: TYPE_PUBLIC,
  Admin: TYPE_ADMIN,
  Customer: TYPE_CUSTOMER,
  GoogleMaps: TYPE_GOOGLE_MAPS,
  Nest: TYPE_NEST,
  Attachment: TYPE_ATTACHMENT,
};

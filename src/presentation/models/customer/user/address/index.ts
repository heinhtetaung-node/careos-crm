export default class PresentationAddressModel {
  _id: number;

  _city: string;

  _countryId: string;

  _salutation?: string;

  _email?: string;

  _street?: Array<string>;

  _fullStreet?: string;

  _telephone?: string;

  _postcode?: string;

  _firstName: string;

  _lastName: string;

  _fullName: string;

  _customerId?: number;

  _region?: string;

  _regionCode?: string;

  _regionId?: number;

  _isSaveInAddressBook?: boolean;

  _isSameAsBilling?: boolean;

  constructor() {
    this._id = 0;
    this._city = '';
    this._countryId = '';
    this._firstName = '';
    this._lastName = '';

    this._fullName = '';
  }
}

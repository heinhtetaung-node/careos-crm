export default class PresentationUserPaymentMethodModel {
  _id: number;

  _cardName: string;

  _maskedCC: string;

  _cardType: string;

  _expirationDate: string;

  _isDefault: boolean;

  _branchName: string;

  constructor() {
    this._id = 0;
    this._cardName = '';
    this._maskedCC = '';
    this._cardType = '';
    this._expirationDate = '';
    this._isDefault = false;
    this._branchName = '';
  }
}

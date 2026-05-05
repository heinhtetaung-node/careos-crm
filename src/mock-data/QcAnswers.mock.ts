const qcAnswersFromApiMock = {
  motorAnswerSheet: {
    criticalMotorAnswerSheet: {
      addressBilling: true,
      addressPolicyHolder: true,
      addressShipping: true,
      chassisNumber: true,
      claimConditionsExplanation: true,
      dashCam: true,
      deliveryConditionsExplained: true,
      deliveryOptionPreferred: false,
      documentGoodQuality: false,
      driversOneFullNameAndAge: false,
      driversTwoFullNameAndAge: false,
      engineNumber: false,
      haveCustomerEmail: true,
      haveCustomerLine: true,
      noUseRudenessOrSarcasm: true,
      oicAndDrivingPurpose: true,
      permissionToRecordConversation: true,
      policyHolderDifferentiation: false,
      policyHolderNameWithTitle: true,
      premiumRabbitCareDiscounts: true,
      premiumTotalInvoice: true,
      vehicleColor: true,
      vehicleHasModifications: true,
      vehicleLicensePlateWithProvince: true,
      vehicleModel: true,
      vehicleModificationsTotalValue: false,
      correctAddons: false,
    },
    nonCriticalMotorAnswerSheet: {
      endingAskForAvailability: true,
      endingSalutation: true,
      informBrokerLicense: true,
      informConversationRecording: true,
      introductionCompanyAndAgent: true,
    },
    packageAnswerSheet: {
      orders: {
        coverageDetailCorrect: true,
        informedAboutPremiumChangeIfClaimed: false,
        packageType: false,
        policyStartDate: true,
        premium: true,
        sumInsured: false,
      },
      orders1: {
        coverageDetailCorrect: true,
        informedAboutPremiumChangeIfClaimed: false,
        packageType: false,
        policyStartDate: true,
        premium: true,
        sumInsured: false,
      },
    },
  },
};

export const mockQcAnswersFromApi = { ...qcAnswersFromApiMock };

const answersCorrectAll = {
  answer: true,
  isCritical: false,
};

const answersCorrectAllCritical = {
  answer: true,
  isCritical: true,
};

export const qcAnswersMock = {
  addonsAsset: answersCorrectAllCritical,
  addonsCarReplacement: answersCorrectAllCritical,
  addonsRoadsideAssistance: answersCorrectAllCritical,
  correctAddons: answersCorrectAllCritical,
  introductionCompanyAndAgent: answersCorrectAll,
  informBrokerLicense: answersCorrectAll,
  informConversationRecording: answersCorrectAll,
  endingSalutation: answersCorrectAll,
  endingAskForAvailability: answersCorrectAll,
  permissionToRecordConversation: answersCorrectAll,
  noUseRudenessOrSarcasm: answersCorrectAll,
  documentGoodQuality: answersCorrectAll,
  haveCustomerEmail: answersCorrectAll,
  policyHolderDifferentiation: answersCorrectAll,
  policyHolderNameWithTitle: answersCorrectAll,
  vehicleLicensePlateWithProvince: answersCorrectAll,
  vehicleModel: answersCorrectAll,
  vehicleColor: answersCorrectAll,
  chassisNumber: answersCorrectAll,
  engineNumber: answersCorrectAll,
  oicAndDrivingPurpose: answersCorrectAll,
  dashCam: answersCorrectAll,
  vehicleHasModifications: answersCorrectAll,
  driversOneFullNameAndAge: answersCorrectAll,
  driversTwoFullNameAndAge: answersCorrectAll,
  policyStartDateVoluntary: answersCorrectAll,
  premiumVoluntary: answersCorrectAll,
  premiumRabbitCareDiscounts: answersCorrectAll,
  premiumTotalInvoice: answersCorrectAll,
  coverageDetailsVoluntaryPackageType: answersCorrectAll,
  coverageDetailsVoluntaryOwnCarDamage: answersCorrectAll,
  claimConditionsExplanation: answersCorrectAll,
  addressPolicyHolder: answersCorrectAll,
  addressShipping: answersCorrectAll,
  addressBilling: answersCorrectAll,
};

export const mockQcAnswers = qcAnswersMock;

export default qcAnswersFromApiMock;

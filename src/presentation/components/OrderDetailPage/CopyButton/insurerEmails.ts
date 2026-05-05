export interface EmailConfig {
  to: string;
  cc: string[];
}

export interface InsurerEmailConfig {
  default: EmailConfig;
  renewal?: EmailConfig;
  truck?: EmailConfig;
}

export type InsurerEmailsMap = Record<string, InsurerEmailConfig>;

const COMMON_FOLLOWUP_EMAIL = 'Followup@rabbit.co.th';

const createEmailConfig = (to: string, cc: string[] = []): EmailConfig => ({
  to,
  cc: [...cc, COMMON_FOLLOWUP_EMAIL],
});

const createInsurerConfig = (
  to: string,
  cc: string[] = []
): InsurerEmailConfig => ({
  default: createEmailConfig(to, cc),
});

const createInsurerConfigWithTypes = (
  configs: Partial<
    Record<keyof InsurerEmailConfig, { to: string; cc?: string[] }>
  > & {
    default: { to: string; cc?: string[] };
  }
): InsurerEmailConfig => {
  const result: InsurerEmailConfig = {
    default: createEmailConfig(configs.default.to, configs.default.cc),
  };

  (Object.keys(configs) as Array<keyof InsurerEmailConfig>).forEach((key) => {
    if (key !== 'default' && configs[key]) {
      result[key] = createEmailConfig(configs[key].to, configs[key].cc);
    }
  });

  return result;
};

export const insurerEmails: InsurerEmailsMap = {
  'insurers/27': createInsurerConfig('lpn_insure@viriyah.co.th'),
  'insurers/7': createInsurerConfigWithTypes({
    default: {
      to: 'pb_rabbit@bangkokinsurance.com',
      cc: [
        'umaporn.s@bangkokinsurance.com',
        'Pornpen.l@bangkokinsurance.com',
        'suparat.w@bangkokinsurance.com',
      ],
    },
    truck: {
      to: 'umaporn.s@bangkokinsurance.com',
      cc: ['Pornpen.l@bangkokinsurance.com', 'suparat.w@bangkokinsurance.com'],
    },
  }),
  'insurers/28': createInsurerConfig('natchawan.suk@thanachart.co.th', [
    'Sirinan.tai@thanachart.co.th',
  ]),
  'insurers/24': createInsurerConfig('Contact_center@ergo.co.th', [
    'prapasiri.jo@ergo.co.th',
    'jintana.ru@ergo.co.th',
  ]),
  'insurers/25': createInsurerConfig('Soraya_kes@thaivivat.co.th', [
    'rawarat_dac@thaivivat.co.th',
    'kritatat_pra@thaivivat.co.th',
    'jantarakarn_man@thaivivat.co.th',
    'Orawan_pri@thaivivat.co.th',
  ]),
  'insurers/6': createInsurerConfig('dsu@axa.co.th', [
    'nawaphat.ru@axa.co.th',
    'panarat.ti@axa.co.th',
  ]),
  'insurers/17': createInsurerConfig('motorcenter@muangthaiinsurance.com', [
    'suphitcha.i@muangthaiinsurance.com',
    'jeeranan.p@muangthaiinsurance.com',
    'motorbrokerteam2@muangthaiinsurance.com',
  ]),
  'insurers/11': createInsurerConfig('nondhanand@dhipaya.co.th', [
    'pattamaporns@dhipaya.co.th',
  ]),
  'insurers/33': createInsurerConfigWithTypes({
    default: {
      to: 'LMG_OPT_NEW@lmginsurance.co.th',
      cc: ['IDS-VIP@lmginsurance.co.th', 'isaveeporn.k@lmginsurance.co.th'],
    },
    renewal: {
      to: 'LMG_OPT_RENEW@lmginsurance.co.th',
      cc: ['IDS-VIP@lmginsurance.co.th', 'isaveeporn.k@lmginsurance.co.th'],
    },
  }),
  'insurers/31': createInsurerConfig('telebroker@navakij.co.th'),
  'insurers/35': createInsurerConfig('AB1@tokiomarinesafety.co.th'),
  'insurers/2': createInsurerConfig('brokerbd1@thaipaiboon.com'),
  'insurers/10': createInsurerConfig('Julawan_k@deves.co.th', [
    'wimonrat@deves.co.th',
    'servicemotor@deves.co.th',
  ]),
  'insurers/13': createInsurerConfig('jantira.t@tgh.co.th', [
    'MOTOR@tgh.co.th',
  ]),
  'insurers/34': createInsurerConfig('Digital_Sale-support@th.msig-asia.com', [
    'Nitivadee_L@th.msig-asia.com',
  ]),
  'insurers/1': createInsurerConfig('sivapreeya.l@azay.co.th', [
    'agency.a@allianz.co.th',
    'agency.a@azay.co.th',
  ]),
  'insurers/40': createInsurerConfig('Chubb.BKKA@chubb.com', [
    'Nonglak.Kongjai-arn@chubb.com',
    'surachit.Thahong@chubb.com',
    'Peerawit.Sukprasert@Chubb.com',
  ]),
  'insurers/44': createInsurerConfig('jaruwan.re@jaymartinsurance.co.th', [
    'uwmotor@jaymartinsurance.co.th',
    'commercial_1@jaymartinsurance.co.th',
  ]),
  'insurers/43': createInsurerConfig('sompo_BKR@sompo.co.th'),
  'insurers/3': createInsurerConfig('rattaporn@aioibkkns.co.th', [
    'sajittree@aioibkkns.co.th',
  ]),
};

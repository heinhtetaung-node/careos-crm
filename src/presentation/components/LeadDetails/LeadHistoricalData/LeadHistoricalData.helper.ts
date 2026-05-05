import {
  NANA_SOURCE_IDS,
  ECT_SOURCE_IDS,
  ADB_SOURCE_IDS,
} from 'config/constant';
import { getString, checkKeyExist } from 'presentation/theme/localization';

export const nanaPresetFields = [
  {
    title: getString('foreignLead.preset.car'),
    value: 'car',
    fields: [
      'car_submodel_year_id',
      'chassis_number',
      'color',
      'currently_owned',
      'driving_purpose',
      'has_cctv',
      'license_plate',
      'registered_province_id',
      'vin',
    ],
  },
  {
    title: getString('foreignLead.preset.address'),
    value: 'address',
    fields: [
      'name_en',
      'name_th',
      'zipcode',
      'address_line_1',
      'address_line_2',
      'billing_address_address_line_1',
      'billing_address_address_line_2',
      'shipping_address_address_line_1',
      'shipping_address_address_line_2',
    ],
  },
  {
    title: getString('foreignLead.preset.person'),
    value: 'person',
    fields: [
      'birthdate',
      'email',
      'firstname',
      'gender',
      'language',
      'lastname',
      'phone',
      'thai_national_id',
    ],
  },
];

export const ectPresetFields = [
  {
    title: getString('foreignLead.preset.car'),
    value: 'car',
    fields: [
      'car_camera_c',
      'car_cc_c',
      'car_code_c',
      'car_color_code_c',
      'car_inspection_c',
      'car_make_c',
      'car_make_id_c',
      'car_model_c',
      'car_model_id_c',
      'car_modification_c',
      'modification_description_c',
      'car_ncb_c',
      'car_plate_c',
      'car_regis_province_c',
      'car_submodel_c',
      'car_submodel_id_c',
      'car_usage_c',
      'car_value_c',
      'card_token_c',
      'chasis_number_c',
      'engine_number_c',
      'conditions_c',
      'alt1_car_code_c',
      'alt1_car_usage_c',
      'alt1_condition_1_c',
      'alt1_condition_2_c',
      'alt1_condition_3_c',
      'alt2_car_code_c',
      'alt2_car_usage_c',
      'alt2_condition_1_c',
      'alt2_condition_2_c',
      'alt2_condition_3_c',
    ],
  },
  {
    title: getString('foreignLead.preset.address'),
    value: 'address',
    fields: [
      'address_state',
      'address_street',
      'address_village_c',
      'address_company_c',
      'address_building_c',
      'address_postalcode',
      'address_more_c',
      'address_name_c',
      'address_road_c',
      'address_room_c',
      'primary_address_building_c',
      'primary_address_city',
      'primary_address_company_c',
      'primary_address_country',
      'primary_address_floor_c',
      'primary_address_moo_c',
      'primary_address_more_c',
      'primary_address_name_c',
      'primary_address_postalcode',
      'primary_address_road_c',
      'primary_address_room_c',
      'primary_address_soi_c',
      'primary_address_state',
      'primary_address_street',
      'alt_address_building_c',
      'alt_address_city',
      'alt_address_company_c',
      'alt_address_country',
      'alt_address_floor_c',
      'alt_address_moo_c',
      'alt_address_more_c',
      'alt_address_name_c',
      'alt_address_postalcode',
      'alt_address_road_c',
      'alt_address_room_c',
      'alt_address_soi_c',
      'alt_address_state',
      'alt_address_street',
      'alt_address_village_c',
    ],
  },
  {
    title: getString('foreignLead.preset.person'),
    value: 'person',
    fields: [
      'title',
      'first_name',
      'last_name',
      'gender_c',
      'is_foreigner_c',
      'age_c',
      'birthdate',
      'marital_status_c',
      'phone_fax',
      'phone_home',
      'phone_mobile',
      'phone_other',
      'phone_work',
      'phone_other',
      'assistant',
      'assistant_phone',
      'preferred_callback_time_c',
      'line_id_c',
      'description',
      'email_address',
    ],
  },
];

export const adbPresetFields = [
  {
    title: getString('foreignLead.preset.car'),
    value: 'car',
    fields: [
      'Plate_No',
      'Car_Color',
      'Plate_Province',
      'Model',
      'Car_Code',
      'Sub_Model',
      'Seat_CC_Weight',
      'Frame_No',
      'Body_Type',
      'Accessory',
      'Car_Model_Label',
    ],
  },
  {
    title: getString('foreignLead.preset.person'),
    value: 'person',
    fields: [
      'EMail',
      'Tel_No',
      'Mobile_I',
      'Mobile_II',
      'Title_Name',
      'Title_Name_EN',
      'Customer_FName',
      'Customer_LName',
      'Customer_Title',
      'Customer_FName_EN',
      'Customer_LName_EN',
      'Mobile_No',
      'Land_Line',
      'Driver_DOB',
      'Co_Driver_DOB',
      'Co_Driver_Name',
      'Co_Driver_License_No',
      'Driver_License_No',
      'Customer_Type',
      'Fax',
      'Driver_Name',
    ],
  },
  {
    title: getString('foreignLead.preset.address'),
    value: 'address',
    fields: [
      'District_Name_EN',
      'District_Name_TH',
      'Province_Name_EN',
      'Province_Name_TH',
      'Subdistrict_Name_EN',
      'Subdistrict_Name_TH',
      'Addr1',
      'Addr2',
      'Post_Code',
      'Receiver_Name',
    ],
  },
];

export function getPresetFields(sourceID: string) {
  if (NANA_SOURCE_IDS.includes(sourceID)) {
    return nanaPresetFields;
  }

  if (ECT_SOURCE_IDS.includes(sourceID)) {
    return ectPresetFields;
  }

  if (ADB_SOURCE_IDS.includes(sourceID)) {
    return adbPresetFields;
  }

  return null;
}

/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/prefer-default-export
export function sortObjectAlphabetically(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectAlphabetically);
  }
  if (obj !== null && typeof obj === 'object' && Object.keys(obj).length) {
    const sortedFilteredKeys = Object.keys(obj)
      .filter((key: string) => obj[key] !== null && obj[key] !== '') // Filter out null or empty string values
      .sort((a: string, b: string) => a.localeCompare(b)); // Sort the remaining keys alphabetically

    return sortedFilteredKeys.reduce((acc: any, key: string) => {
      acc[key] = sortObjectAlphabetically(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

type NestedObject = { [key: string]: any };

export function filterDeepNestedObjectByKeys(
  obj: NestedObject,
  filterString: string
): NestedObject {
  const result: NestedObject = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedResult = filterDeepNestedObjectByKeys(obj[key], filterString);
      if (Object.keys(nestedResult).length > 0) {
        result[key] = nestedResult;
      }
    } else if (
      key.toLowerCase().includes(filterString) &&
      (obj[key] !== null || obj[key] !== '')
    ) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function addTranslationKey(obj: NestedObject): NestedObject {
  const result: NestedObject = {};

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in obj) {
    const newKey = `foreignLead.${key}`;
    if (Array.isArray(obj[key])) {
      result[checkKeyExist(newKey) ? getString(newKey) : key] = obj[key].map(
        (item: NestedObject) => {
          if (typeof item === 'object' && item !== null) {
            return addTranslationKey(item);
          }
          return item;
        }
      );
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[checkKeyExist(newKey) ? getString(newKey) : key] =
        addTranslationKey(obj[key]);
    } else {
      result[checkKeyExist(newKey) ? getString(newKey) : key] = obj[key];
    }
  }

  return result;
}

export function filterDeepNestedObjectByFields(
  obj: NestedObject,
  fields: string[]
): NestedObject {
  const result: NestedObject = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedResult = filterDeepNestedObjectByFields(obj[key], fields);
      if (Object.keys(nestedResult).length > 0) {
        result[key] = nestedResult;
      }
    } else if (fields.includes(key) && (obj[key] !== null || obj[key] !== '')) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function redactPhoneFields(obj: NestedObject) {
  const phoneFields = [
    'Line_ID',
    'Fax',
    'Mobile_No',
    'Mobile_II',
    'phone',
    'phone_work',
    'phone_home',
    'phone_mobile',
    'phone_car_inspection_c',
    'Tel_No',
    'line_id_c',
  ];

  const result: NestedObject = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      if (phoneFields.includes(key)) {
        result[key] = obj[key].map((data: string) => {
          if (
            typeof data === 'string' &&
            data.length > 3 &&
            !Number.isNaN(parseInt(data, 10))
          ) {
            return `${data.substring(0, 3)}${'x'.repeat(data.length - 3)}`;
          }
          return data;
        });
      } else {
        result[key] = obj[key].map((item: NestedObject) => {
          if (typeof item === 'object' && item !== null) {
            return redactPhoneFields(item);
          }
          return item;
        });
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedResult = redactPhoneFields(obj[key]);
      if (Object.keys(nestedResult).length > 0) {
        result[key] = nestedResult;
      }
    } else if (
      phoneFields.includes(key) &&
      (obj[key] !== null || obj[key] !== '') &&
      !Number.isNaN(parseInt(obj[key], 10)) &&
      typeof parseInt(obj[key], 10) === 'number' &&
      obj[key].length > 3
    ) {
      result[key] = `${obj[key].toString().substring(0, 3)}${'x'.repeat(
        obj[key].length - 3
      )}`;
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

export function redactSensitiveData(obj: NestedObject) {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  let jsonData = JSON.stringify(obj);
  const emailMatches = jsonData.match(emailPattern);

  emailMatches?.forEach((email) => {
    const emailSplit = email.split('@');

    if (emailSplit[0].length <= 3) {
      return;
    }
    jsonData = jsonData.replace(
      email,
      `${emailSplit[0].substring(0, 3)}${'x'.repeat(
        emailSplit[0].length - 3
      )}@${emailSplit[1]}`
    );
  });
  const newJSONData = JSON.parse(jsonData);

  return redactPhoneFields(newJSONData);
}

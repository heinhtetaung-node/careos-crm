import clsx from 'clsx';
import { useFormik } from 'formik';
import React, {
  ChangeEvent,
  ClipboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { useGetAddressDataQuery } from 'data/slices/addressSlice';
import {
  useLazyGetOrderItemsQuery,
  useUpdateOrderByIdMutation,
} from 'data/slices/orderSlice';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import Checkbox from 'presentation/components/common/controls/Checkbox';
import { getString } from 'presentation/theme/localization';
import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';
import { useLeadUpdaterFromOrder } from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

import {
  formatValue,
  licensePlateStandardize,
  LicensePlateType,
  optionsMapping,
} from '../helper';
import { useFormStyles } from '../index.styles';
import i18next from 'i18next';
import { capitalizeFirstLetter } from 'shared/helper/utilities';

interface LicensePlateFormProbs {
  orderData: OrderDataResponse | undefined;
  handleModalToggle?: () => void;
  handleButtonDisable: (disable: boolean) => void;
}

export default function LicensePlateForm({
  orderData,
  handleModalToggle,
  handleButtonDisable,
}: LicensePlateFormProbs) {
  const { orderId } = useParams<{ orderId: string }>();
  const { updateLead } = useLeadUpdaterFromOrder(orderData);
  const formStyles = useFormStyles();
  const [redPlate, setRedPlate] = useState(false);
  const [licenseCode, setLicenseCode] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseProvinceCode, setLicenseProvinceCode] = useState('');
  const licenseDivider = LicensePlateType.divider as string;

  const [updateOrderById] = useUpdateOrderByIdMutation();
  const [fetchOrder] = useLazyGetOrderItemsQuery();

  const { data: provinces } = useGetAddressDataQuery({
    pathParam: 'provinces',
    fieldName: 'provinces',
  });

  const provinceOptions = useMemo(
    () =>
      optionsMapping(
        provinces ?? [],
        `name${capitalizeFirstLetter(i18next.language)}`,
        'name'
      )?.map((p) => ({
        ...p,
        value: p.value.replace('provinces/', ''),
      })) ?? [],
    [provinces]
  );

  const baselineRegisteredProvince = useRef<number | undefined>();

  const initialRegisteredProvinceOption = useMemo(() => {
    const reg = orderData?.order?.data?.registeredProvince;
    if (reg == null || !provinceOptions.length) return null;
    return provinceOptions.find((o) => Number(o.value) === Number(reg)) ?? null;
  }, [orderData, provinceOptions]);

  const provincesAbbreviations = useMemo(
    () => provinceAbbreviationCollection(),
    []
  );

  const handleSubmit = async (values: Record<string, any>) => {
    if (!orderId || !orderData?.order?.data) return;
    handleButtonDisable(true);
    const rawProvince = formatValue(values.registeredProvince);
    const registeredProvince =
      rawProvince != null && rawProvince !== ''
        ? Number(rawProvince)
        : orderData.order.data.registeredProvince;
    if (registeredProvince == null || Number.isNaN(registeredProvince)) return;
    const plateForLead = redPlate
      ? LicensePlateType.redPlate
      : `${values.licensePlate} ${licenseProvinceCode}`;
    await updateLead('/registeredProvince', registeredProvince);
    // Same as EditableCarSection / useUpdateCarData: red plate → 'redplate' on lead
    await updateLead('/carLicensePlate', plateForLead);
    await updateOrderById({
      orderId,
      payload: {
        data: {
          ...orderData.order.data,
          carLicensePlate: plateForLead,
          isRedPlate: redPlate,
          registeredProvince,
        },
      },
    }).unwrap();
    await fetchOrder({ orderId }).unwrap();
    if (handleModalToggle) {
      handleModalToggle();
    }
  };

  const initialFormValues = useMemo(
    () => ({
      licensePlate: `${licenseCode}${licenseDivider}${licenseNumber}`,
      registeredProvince: initialRegisteredProvinceOption,
    }),
    [
      licenseCode,
      licenseNumber,
      licenseDivider,
      initialRegisteredProvinceOption,
    ]
  );

  const formik: any = useFormik({
    onSubmit: (values) => handleSubmit(values),
    enableReinitialize: true,
    initialValues: initialFormValues,
  });

  useEffect(() => {
    handleButtonDisable(true);
    if (!orderData) return;
    const { carLicensePlate } = orderData.order.data;
    const [codeAndNumber, provinceCode] = carLicensePlate.split(' ');
    const [code, number] = codeAndNumber.split(licenseDivider);
    setLicenseCode(code ?? '');
    setLicenseNumber(number ?? '');
    setRedPlate(orderData.order?.data?.isRedPlate ?? false);
    baselineRegisteredProvince.current =
      orderData.order.data.registeredProvince;
    if (provinceCode?.length > 0) {
      setLicenseProvinceCode(provinceCode);
      return;
    }
    const provincesAbbreviations = provinceAbbreviationCollection();
    const { registeredProvince } = orderData.order?.data ?? undefined;
    const abbreviation = registeredProvince
      ? provincesAbbreviations.find(
          (object) => object?.oic === registeredProvince
        )?.abbreviation
      : '';
    setLicenseProvinceCode(abbreviation ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  useEffect(() => {
    const raw = formatValue(formik.values.registeredProvince);
    if (raw == null || raw === '') return;
    const oic = Number(raw);
    const abbrev =
      provincesAbbreviations.find((row) => row.oic === oic)?.abbreviation ?? '';
    setLicenseProvinceCode(abbrev);
  }, [formik.values.registeredProvince, provincesAbbreviations]);

  useEffect(() => {
    const { licensePlate, registeredProvince } = formik.values;
    const initialLicense = `${licenseCode}${licenseDivider}${licenseNumber}`;
    const licenseChanged =
      licensePlate.length >= LicensePlateType.validLength &&
      !initialLicense.includes(licensePlate);
    const raw = formatValue(registeredProvince);
    const provinceNum = raw != null && raw !== '' ? Number(raw) : undefined;
    const provinceChanged =
      provinceOptions.length > 0 &&
      baselineRegisteredProvince.current !== undefined &&
      provinceNum !== undefined &&
      provinceNum !== baselineRegisteredProvince.current;
    if (licenseChanged || provinceChanged) {
      handleButtonDisable(false);
    } else {
      handleButtonDisable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values, licenseCode, licenseNumber, provinceOptions.length]);

  const handleLicenseChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value: licensePlateValue } = event.target;
      formik.setFieldValue(
        'licensePlate',
        licensePlateStandardize(licensePlateValue)
      );
    },
    [formik]
  );

  const onLicensePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const licensePlateValue = event.clipboardData.getData('Text');
    const licenseFormat = [...licensePlateValue].reduce(
      (prev, next) => licensePlateStandardize(`${prev}${next}`),
      ''
    );
    formik.setFieldValue('licensePlate', licenseFormat);
  };

  const handeUpdateRedplate = useCallback(
    (checked: boolean) => {
      setRedPlate(checked);
      if (checked) {
        formik.setFieldValue('licensePlate', LicensePlateType.redPlate);
        return;
      }
      const defaultLicense =
        licenseCode !== LicensePlateType.redPlate
          ? `${licenseCode}${licenseDivider}${licenseNumber}`
          : '';
      formik.setFieldValue('licensePlate', defaultLicense);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik, licenseCode, licenseNumber]
  );

  const licenseProvinceExists = licenseProvinceCode !== '';
  return (
    <form
      id="update-data-myself"
      data-testid="update-data-myself-form"
      onSubmit={formik.handleSubmit}
      className={formStyles.root}
    >
      <div className="grid mb-5 grid-cols-8 gap-2">
        <div
          className={clsx(
            licenseProvinceExists && !redPlate ? 'col-span-4' : 'col-span-5'
          )}
        >
          <CommonTextField
            className="input"
            dataTestId="license-plate"
            label={getString('qc.licensePlate')}
            name="licensePlate"
            placeholder={getString('qc.licensePlate')}
            value={formik.values.licensePlate}
            onChange={handleLicenseChange}
            disabled={redPlate}
            inputProps={{
              maxLength: 8,
              autocomplete: 'off',
              onPaste: onLicensePaste,
            }}
          />
        </div>
        {licenseProvinceExists && !redPlate && (
          <div className="bg-zinc-100 flex justify-center content-center items-center rounded-md">
            {licenseProvinceCode}
          </div>
        )}
        <div className="col-span-3">
          <Checkbox
            name={getString('leadDetailFields.redPlate')}
            handleUpdate={handeUpdateRedplate}
            checked={redPlate}
            dataTestId="is-redplate"
          />
        </div>
      </div>
      <Autocomplete
        className="input"
        options={provinceOptions}
        optionTextKey="title"
        getOptionSelected={(
          option: { value: string },
          value: { value: string }
        ) => option?.value === value?.value}
        value={formik.values.registeredProvince}
        onChange={(
          _e: unknown,
          val:
            | string
            | { value: string }
            | { title: string; value: string }
            | Array<string | { value: string }>
            | null
        ) => formik.setFieldValue('registeredProvince', val)}
        textFieldProps={{
          label: getString('text.province'),
          placeholder: getString('qc.select'),
          dataTestId: 'province',
        }}
      />
    </form>
  );
}

import { Divider } from '@alphafounders/ui';
import { DocumentIcon } from '@alphafounders/icons';
import { insertInterval } from '@careos/utils';
import { Tooltip, withStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LANGUAGES, getString } from 'presentation/theme/localization';
import { Addon } from 'shared/types/addons';
import { formatSatangToBaht } from 'utils/currency';

import { formatPrice } from './helper';

interface AddonDetailProps {
  addon: Addon;
}

const CustomTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    minWidth: '22rem',
  },
}))(Tooltip);

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between font-normal">
      <div className="grow-2">{label}</div>
      <div className="grow-1">{value}</div>
    </div>
  );
}

export function DetailTooltip({ addon }: { addon: Addon }) {
  const { i18n } = useTranslation();

  const addonScope = useMemo(
    () =>
      addon.scopes?.map((scope) => (
        <LineItem
          key={scope.displayNameEn}
          label={
            i18n.language === LANGUAGES.ENGLISH
              ? scope.displayNameEn
              : scope.displayNameTh
          }
          value={scope.term}
        />
      )) ?? [],
    [addon, i18n.language]
  );

  const addonCoverage = useMemo(
    () =>
      addon.coverages?.coverage?.map((coverage) => (
        <LineItem
          key={coverage.displayNameEn}
          label={
            i18n.language === LANGUAGES.ENGLISH
              ? coverage.displayNameEn
              : coverage.displayNameTh
          }
          value={getString('packageListing.templates.moneyNormal', {
            value: formatSatangToBaht(coverage.price),
          })}
        />
      )) ?? [],
    [addon, i18n.language]
  );

  return (
    <div className="p-2" data-testid="addon-detail">
      <div className="flex justify-between font-bold">
        <div className="grow-2">
          <div className="text-base">{addon.displayName}</div>
          <div className="font-normal">
            {i18n.language === LANGUAGES.ENGLISH
              ? addon.provider.displayNameEn
              : addon.provider.displayNameTh}
          </div>
        </div>
        <div className="grow-1">{formatPrice(addon.price)}</div>
      </div>
      <Divider variant="primary" orientation="horizontal" pattern="dash" />
      {insertInterval(
        addonScope.concat(addonCoverage),
        1,
        <Divider variant="primary" orientation="horizontal" pattern="dash" />
      )}
      <Divider variant="primary" orientation="horizontal" pattern="dash" />
      <div className="font-bold text-base">
        {getString('text.termsAndConditions')}
      </div>
      <ul className="pl-3">
        {(i18n.language === LANGUAGES.ENGLISH
          ? addon.termsAndConditions.en
          : addon.termsAndConditions.th
        ).map((tnc) => (
          <li className="font-normal">{tnc}</li>
        ))}
      </ul>
    </div>
  );
}

function AddonDetail({ addon }: AddonDetailProps) {
  return (
    <div className="w-full flex justify-between">
      {addon.displayName}
      <CustomTooltip title={<DetailTooltip addon={addon} />} arrow>
        <span data-testid="addon-detail-hover">
          <DocumentIcon />
        </span>
      </CustomTooltip>
    </div>
  );
}

export default AddonDetail;

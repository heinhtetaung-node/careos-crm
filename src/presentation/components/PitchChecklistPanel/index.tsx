import {
  Checkbox,
  CircularProgress,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ListAltIcon from '@material-ui/icons/ListAlt';
import RefreshIcon from '@material-ui/icons/Refresh';
import { skipToken } from '@reduxjs/toolkit/query';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PitchChecklistSection,
  useGetPitchChecklistQuery,
  useUpdatePitchChecklistItemMutation,
} from 'data/slices/leadDetails/pitchChecklistSlice';
import { getString, LANGUAGES } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import './index.scss';

interface PitchChecklistPanelProps {
  leadName?: string;
  isEditable: boolean;
  isExpanded: boolean;
  onToggle: (nextExpanded: boolean) => void;
}

const getSectionStats = (section: PitchChecklistSection) => {
  const total = section.items?.length ?? 0;
  const checked =
    section.items?.filter((item) => Boolean(item.checked)).length ?? 0;

  return {
    checked,
    total,
  };
};

const getChecklistStats = (
  sections: PitchChecklistSection[],
  fallbackChecked = 0,
  fallbackTotal = 0
) => {
  if (!sections.length) {
    return {
      checked: fallbackChecked,
      total: fallbackTotal,
    };
  }

  return sections.reduce(
    (acc, section) => {
      const { checked, total } = getSectionStats(section);

      return {
        checked: acc.checked + checked,
        total: acc.total + total,
      };
    },
    { checked: 0, total: 0 }
  );
};

export default function PitchChecklistPanel({
  leadName,
  isEditable,
  isExpanded,
  onToggle,
}: PitchChecklistPanelProps) {
  const { i18n } = useTranslation();
  const { showErrorSnackbar } = useSnackbar();
  const [pendingItemKeys, setPendingItemKeys] = useState<string[]>([]);

  const pitchChecklistLabel = (labelTh: string, labelEn: string) =>
    i18n.language === LANGUAGES.ENGLISH
      ? labelEn || labelTh
      : labelTh || labelEn;

  const {
    data: pitchChecklist,
    isFetching,
    isError,
    refetch,
  } = useGetPitchChecklistQuery(leadName ?? skipToken);
  const [updatePitchChecklistItem] = useUpdatePitchChecklistItemMutation();

  const sections = useMemo(
    () =>
      [...(pitchChecklist?.sections ?? [])].sort(
        (left, right) => left.order - right.order
      ),
    [pitchChecklist?.sections]
  );
  const stats = useMemo(
    () =>
      getChecklistStats(
        sections,
        pitchChecklist?.stats?.checked ?? 0,
        pitchChecklist?.stats?.total ?? 0
      ),
    [pitchChecklist?.stats?.checked, pitchChecklist?.stats?.total, sections]
  );
  const progress = stats.total
    ? Math.round((stats.checked / stats.total) * 100)
    : 0;

  const handleItemToggle = async (itemKey: string, checked: boolean) => {
    if (!leadName || !isEditable) {
      return;
    }

    setPendingItemKeys((current) => [...current, itemKey]);

    try {
      await updatePitchChecklistItem({
        leadName,
        itemKey,
        checked,
      }).unwrap();
    } catch {
      showErrorSnackbar(getString('text.pitchChecklistUpdateFailed'));
    } finally {
      setPendingItemKeys((current) =>
        current.filter((currentKey) => currentKey !== itemKey)
      );
    }
  };

  return (
    <div
      className={clsx('pitch-checklist-panel', {
        'pitch-checklist-panel--expanded': isExpanded,
      })}
      data-testid="pitch-checklist-panel"
    >
      {!isExpanded ? (
        <button
          type="button"
          className="pitch-checklist-panel__collapsed-toggle"
          onClick={() => onToggle(true)}
          aria-expanded={false}
          aria-label={getString('text.pitchChecklist')}
        >
          <span className="pitch-checklist-panel__collapsed-icon" aria-hidden>
            <ListAltIcon fontSize="small" />
          </span>
          <span className="pitch-checklist-panel__collapsed-copy">
            <span className="pitch-checklist-panel__collapsed-title">
              {getString('text.pitchChecklist')}
            </span>
          </span>
          <span className="pitch-checklist-panel__collapsed-progress">
            <span className="pitch-checklist-panel__collapsed-progress-track">
              <CircularProgress
                variant="determinate"
                value={100}
                size={20}
                thickness={4}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={20}
                thickness={4}
              />
            </span>
            <span className="pitch-checklist-panel__collapsed-progress-text">
              {`(${progress}%)`}
            </span>
          </span>
          <span className="pitch-checklist-panel__toggle-icon" aria-hidden>
            <KeyboardArrowUpIcon fontSize="small" />
          </span>
        </button>
      ) : (
        <div className="pitch-checklist-panel__surface">
          <div className="pitch-checklist-panel__toolbar">
            <div className="pitch-checklist-panel__toolbar-main">
              <div className="pitch-checklist-panel__title-row">
                <span className="pitch-checklist-panel__title">
                  {getString('text.pitchChecklistTitle')}
                </span>
                <Tooltip
                  title={getString('text.pitchChecklistDescription')}
                  placement="top"
                  arrow
                >
                  <span className="pitch-checklist-panel__info-trigger">
                    <InfoOutlinedIcon className="pitch-checklist-panel__info-icon" />
                  </span>
                </Tooltip>
              </div>

              <span className="pitch-checklist-panel__summary">
                {`${progress}% (${stats.checked} / ${stats.total})`}
              </span>

              <div className="pitch-checklist-panel__progress-bar">
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color="primary"
                />
              </div>
            </div>

            <div className="pitch-checklist-panel__header-actions">
              <IconButton
                size="small"
                aria-label={getString('text.refresh')}
                onClick={() => refetch()}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label={getString('text.hidePitchChecklist')}
                onClick={() => onToggle(false)}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className="pitch-checklist-panel__content">
            <div className="pitch-checklist-panel__body">
              {isFetching && !pitchChecklist ? (
                <div className="pitch-checklist-panel__state">
                  {getString('text.loading')}
                </div>
              ) : null}

              {!isFetching && isError ? (
                <div className="pitch-checklist-panel__state">
                  {getString('text.pitchChecklistLoadFailed')}
                </div>
              ) : null}

              {!isFetching && !isError && !sections.length ? (
                <div className="pitch-checklist-panel__state">
                  {getString('text.noData')}
                </div>
              ) : null}

              {!isFetching && !isError && sections.length ? (
                <div className="pitch-checklist-panel__sections">
                  {sections.map((section, index) => {
                    const sectionStats = getSectionStats(section);
                    const isSectionComplete =
                      sectionStats.total > 0 &&
                      sectionStats.checked === sectionStats.total;

                    return (
                      <div
                        key={section.key}
                        className={clsx('pitch-checklist-panel__section', {
                          'pitch-checklist-panel__section--complete':
                            isSectionComplete,
                        })}
                      >
                        <div className="pitch-checklist-panel__section-header">
                          <span className="pitch-checklist-panel__section-title">
                            {`${index + 1}. ${pitchChecklistLabel(
                              section.labelTh,
                              section.labelEn
                            )}`}
                          </span>
                          <span className="pitch-checklist-panel__section-count">
                            {`${sectionStats.checked}/${sectionStats.total}`}
                          </span>
                        </div>

                        <div className="pitch-checklist-panel__section-items">
                          {section.items.map((item) => {
                            const isItemPending = pendingItemKeys.includes(
                              item.key
                            );
                            const isItemDisabled = !isEditable || isItemPending;

                            const checkboxId = `pitch-checklist-${section.key}-${item.key}`;

                            return (
                              <label
                                key={item.key}
                                htmlFor={checkboxId}
                                className={clsx('pitch-checklist-panel__item', {
                                  'pitch-checklist-panel__item--disabled':
                                    isItemDisabled,
                                })}
                              >
                                <Checkbox
                                  color="primary"
                                  checked={item.checked}
                                  disabled={isItemDisabled}
                                  inputProps={{
                                    id: checkboxId,
                                  }}
                                  onChange={(event) =>
                                    handleItemToggle(
                                      item.key,
                                      event.target.checked
                                    )
                                  }
                                />
                                <span className="pitch-checklist-panel__item-label">
                                  {pitchChecklistLabel(
                                    item.labelTh,
                                    item.labelEn
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {!isFetching && !isError && sections.length ? (
              <button
                type="button"
                className="pitch-checklist-panel__dock-toggle"
                onClick={() => onToggle(false)}
              >
                <KeyboardArrowDownIcon fontSize="small" />
                {getString('text.hidePitchChecklist')}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

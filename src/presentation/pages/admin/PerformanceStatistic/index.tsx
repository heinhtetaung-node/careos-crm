import { Collapse, Dialog, Grid, Tooltip } from '@material-ui/core';
import { KeyboardArrowUp } from '@material-ui/icons';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import { UserRoles } from 'config/constant';
import { PerformanceStat } from 'data/slices/performanceStatisticSlice';
import { useLazyGetTeamsQuery } from 'data/slices/teamSlice';
import Button from 'presentation/components/Button';
import RadioGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import Controls from 'presentation/components/controls/Control';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { getString } from 'presentation/theme/localization';

import clsx from 'clsx';
import PerformanceStatisticContent from './components/PerformanceStatisticContent';
import ShowReportModal from './components/ShowReportModal';
import {
  getStatusOptions,
  initialFilterValues,
  PerformanceStatFilters,
} from './helper';

const FilterContainer = styled.div`
  position: relative;
  background: white;
  margin-bottom: 16px;
`;

const BoldArrowUpIcon = styled(KeyboardArrowUp)`
  &&& {
    path {
      stroke-width: 0.6;
      stroke: currentColor;
      fill: currentColor;
    }
  }
`;

const CollapseButton = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  position: absolute;
  bottom: -15px;
  left: 50%;
  cursor: pointer;
  visibility: visible;
  outline: none;
  z-index: 10;
  transition: transform 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

function PerformanceStatistic() {
  const [getTeams, { data: teamsData }] = useLazyGetTeamsQuery();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [availableStats, setAvailableStats] = useState<PerformanceStat[]>([]);
  const user = useGetUserSelector();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const isSupervisor = user?.role === UserRoles.SUPERVISOR_ROLE;

  // Replace Formik with simple state
  const [filters, setFilters] =
    useState<PerformanceStatFilters>(initialFilterValues);

  const handleGetTeams = useCallback(async () => {
    // Build filter for productType if globalProduct is available
    let filter: string | undefined;
    if (globalProduct) {
      filter = `productType in ("${globalProduct}")`;
    }
    const result = await getTeams({ pageSize: 1000, filter });
    return result;
  }, [getTeams, globalProduct]);

  const fetchSupervisorTeams = useCallback(async () => {
    const supervisorFilterClauses = [`supervisor="${user?.name}"`];
    if (globalProduct) {
      supervisorFilterClauses.push(`productType in ("${globalProduct}")`);
    }
    return getTeams({
      pageSize: 1000,
      filter: supervisorFilterClauses.join(' '),
    });
  }, [getTeams, globalProduct, user?.name]);

  useEffect(() => {
    if (isSupervisor) {
      fetchSupervisorTeams();
      return;
    }
    handleGetTeams();
  }, [fetchSupervisorTeams, handleGetTeams, isSupervisor]);

  const teamsOptions = teamsData || [];
  const supervisorTeamNames = useMemo(
    () => teamsOptions.map((team) => team.name),
    [teamsOptions]
  );
  const canRenderPerformanceContent = !isSupervisor || teamsOptions.length > 0;

  const handleReset = useCallback(() => {
    setFilters({
      ...initialFilterValues,
    });
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleOpenReportModal = useCallback(() => {
    setIsReportModalOpen(true);
  }, []);

  const handleCloseReportModal = useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  // Watched list feature - persist to localStorage
  const WATCHED_LIST_STORAGE_KEY = 'performanceStatistic_watchedList';
  const [watchedUserIds, setWatchedUserIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(WATCHED_LIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load watched list from localStorage', error);
    }
    return new Set<string>();
  });

  // Toggle watched status for a user
  const handleToggleWatched = useCallback((userId: string) => {
    setWatchedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      // Persist to localStorage
      try {
        localStorage.setItem(
          WATCHED_LIST_STORAGE_KEY,
          JSON.stringify(Array.from(newSet))
        );
      } catch (error) {
        console.error('Failed to save watched list to localStorage', error);
      }
      return newSet;
    });
  }, []);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const isPastDate = Boolean(filters.date && filters.date < todayStr);
  const effectiveTeamFilter = useMemo(() => {
    const selectedTeams = filters.team || [];

    if (!isSupervisor) {
      return selectedTeams;
    }

    if (selectedTeams.length === 0) {
      return supervisorTeamNames;
    }

    const allowedTeams = new Set(supervisorTeamNames);
    return selectedTeams.filter((team) => allowedTeams.has(team));
  }, [filters.team, isSupervisor, supervisorTeamNames]);

  const agentCatalogScopeKey = useMemo(
    () =>
      JSON.stringify({
        team: effectiveTeamFilter
          ? [...effectiveTeamFilter].sort((a, b) => a.localeCompare(b))
          : [],
        status: filters.status
          ? [...filters.status].sort((a, b) => a.localeCompare(b))
          : [],
        product: globalProduct ?? null,
        date: filters.date ?? '',
        interval: filters.interval ?? '',
      }),
    [
      effectiveTeamFilter,
      filters.status,
      filters.date,
      filters.interval,
      globalProduct,
    ]
  );

  useEffect(() => {
    setAvailableStats([]);
  }, [agentCatalogScopeKey]);

  const handleStatsChange = useCallback(
    (stats: PerformanceStat[]) => {
      setAvailableStats((prev) => {
        if (stats.length === 0) {
          return prev;
        }
        const userFilterActive = (filters.user?.length ?? 0) > 0;
        if (!userFilterActive) {
          const byUser = new Map(
            stats
              .filter((stat) => stat.user)
              .map((stat) => [stat.user, stat] as const)
          );
          return Array.from(byUser.values());
        }
        const merged = new Map(prev.map((stat) => [stat.user, stat]));

        stats.forEach((stat) => {
          if (stat.user) {
            merged.set(stat.user, stat);
          }
        });
        return Array.from(merged.values());
      });
    },
    [filters.user]
  );

  const availableAgentOptions = useMemo(
    () =>
      Array.from(
        new Map(
          availableStats
            .filter((stat) => stat.user)
            .map((stat) => [
              stat.user,
              {
                name: stat.user,
                title: stat.userFullName || stat.user,
              },
            ])
        ).values()
      ).sort((left, right) => left.title.localeCompare(right.title)),
    [availableStats]
  );

  const selectedStatusOptions = useMemo(
    () =>
      (filters.status ?? [])
        .map((statusValue) => {
          if (typeof statusValue === 'string') {
            return getStatusOptions().find(
              (option: any) => option.value === statusValue
            );
          }
          return statusValue;
        })
        .filter(Boolean),
    [filters.status]
  );

  const selectedTeamOptions = useMemo(
    () =>
      (filters.team ?? [])
        .map((teamValue: any) => {
          if (typeof teamValue === 'string') {
            return teamsOptions.find((option) => option.name === teamValue);
          }
          return teamValue;
        })
        .filter(Boolean),
    [filters.team, teamsOptions]
  );

  const selectedUserOptions = useMemo(
    () =>
      (filters.user ?? [])
        .map((userValue: any) => {
          if (typeof userValue === 'string') {
            return availableAgentOptions.find(
              (option) => option.name === userValue
            );
          }
          return userValue;
        })
        .filter(Boolean),
    [availableAgentOptions, filters.user]
  );

  const appliedFilters = useMemo(
    () => ({
      status: isPastDate ? [] : filters.status || [],
      team: effectiveTeamFilter,
      user: filters.user || [],
      interval: filters.interval || '1h',
      date: filters.date || '',
    }),
    [
      filters.status,
      effectiveTeamFilter,
      filters.user,
      filters.interval,
      filters.date,
      isPastDate,
    ]
  );

  return (
    <div data-testid="performance-statistic-page">
      <Helmet title={getString('menu.performanceStatistic.root')} />
      <FilterContainer>
        <Collapse in={isExpanded} timeout="auto">
          <Grid
            container
            className="px-4 pt-5 pb-4"
            spacing={2}
            alignItems="flex-end"
          >
            {/* Period controls — "when" */}
            <Grid item xs={12} md={2}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-wide text-gray-400 uppercase font-medium pl-0.5">
                  {getString('performanceStatistic.filters.interval')}
                </span>
                <RadioGroup
                  row
                  name="interval"
                  value={filters.interval ?? '1h'}
                  options={[
                    {
                      value: '1h',
                      label: getString(
                        'performanceStatistic.filters.intervalOption1h'
                      ),
                    },
                    {
                      value: 'day',
                      label: getString(
                        'performanceStatistic.filters.intervalOptionDay'
                      ),
                    },
                  ]}
                  onChange={(_e: any, val: string) =>
                    setFilters((prev) => ({
                      ...prev,
                      interval: val as '1h' | 'day',
                      // Switching to 1h clears any past date — only makes sense for today
                      ...(val === '1h' ? { date: '' } : {}),
                    }))
                  }
                />
              </div>
            </Grid>
            <Grid item xs={12} md={2}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] tracking-wide text-gray-400 uppercase font-medium pl-0.5">
                  {getString('performanceStatistic.filters.informationDate')}
                </span>
                <KeyboardDatePicker
                  variant="inline"
                  inputVariant="outlined"
                  format="dd/MM/yyyy"
                  autoOk
                  disableFuture
                  disableToolbar
                  clearable
                  size="small"
                  placeholder={getString(
                    'performanceStatistic.filters.informationDatePlaceholder'
                  )}
                  value={
                    filters.date ? new Date(`${filters.date}T00:00:00`) : null
                  }
                  onChange={(date: Date | null) => {
                    const iso =
                      date && !Number.isNaN(date.getTime())
                        ? format(date, 'yyyy-MM-dd')
                        : '';
                    setFilters((prev) => ({
                      ...prev,
                      date: iso,
                      ...(iso && iso < todayStr ? { interval: 'day' } : {}),
                    }));
                  }}
                  invalidDateMessage=""
                  minDateMessage=""
                  maxDateMessage=""
                  InputProps={{ style: { height: 40, fontSize: 14 } }}
                />
              </div>
            </Grid>

            {/* Thin visual divider between "when" and "who" */}
            <Grid item className="!hidden md:!flex items-end pb-1">
              <div className="w-px h-9 bg-gray-200 mx-1" />
            </Grid>

            {/* Dimension controls — "who" */}
            {!isPastDate && (
              <Grid item xs={12} md={2}>
                <Controls.Autocomplete
                  name="status"
                  label={getString('text.status')}
                  placeholder={getString('text.select')}
                  options={getStatusOptions()}
                  labelField="title"
                  valueField="value"
                  multiple
                  hasSelectAll
                  fixedLabel
                  value={selectedStatusOptions}
                  onChange={(e: any) => {
                    const selectedValues = Array.isArray(e.target.value)
                      ? e.target.value.map((item: any) =>
                          typeof item === 'string' ? item : item?.value || item
                        )
                      : e.target.value;
                    setFilters((prev) => ({ ...prev, status: selectedValues }));
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={isPastDate ? 3 : 2}>
              <Controls.Autocomplete
                name="team"
                label={getString('text.team')}
                placeholder={getString('text.select')}
                options={teamsOptions}
                labelField="displayName"
                valueField="name"
                missingId
                fixedLabel
                multiple
                hasSelectAll
                limitTags={2}
                value={selectedTeamOptions}
                onChange={(e: any) => {
                  const selectedValues = Array.isArray(e.target.value)
                    ? e.target.value.map((item: any) =>
                        typeof item === 'string' ? item : item?.name || item
                      )
                    : e.target.value;
                  setFilters((prev) => ({ ...prev, team: selectedValues }));
                }}
                onFocusFn={isSupervisor ? fetchSupervisorTeams : handleGetTeams}
              />
            </Grid>
            <Grid item xs={12} md={isPastDate ? 3 : 2}>
              <Controls.Autocomplete
                name="agent"
                label={getString('performanceStatistic.filters.agent')}
                placeholder={getString('text.select')}
                options={availableAgentOptions}
                labelField="title"
                valueField="name"
                missingId
                fixedLabel
                multiple
                hasSelectAll
                limitTags={2}
                value={selectedUserOptions}
                onChange={(e: any) => {
                  const selectedValues = Array.isArray(e.target.value)
                    ? e.target.value.map((item: any) =>
                        typeof item === 'string' ? item : item?.name || item
                      )
                    : e.target.value;
                  setFilters((prev) => ({ ...prev, user: selectedValues }));
                }}
              />
            </Grid>

            {/* Actions */}
            <Grid
              item
              xs={12}
              md="auto"
              className="flex items-center gap-2 ml-auto"
            >
              <Button
                color="secondary"
                variant="contained"
                onClick={handleReset}
                data-testid="clear-all-btn"
              >
                {getString('text.clearAll')}
              </Button>
              <Button
                color="primary"
                variant="contained"
                data-testid="search-btn"
              >
                {getString('text.search')}
              </Button>
              <Tooltip title={getString('performanceStatistic.aboutReport')}>
                <button
                  type="button"
                  className="flex items-center text-primary cursor-pointer ml-1 bg-transparent border-0 p-0 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={handleOpenReportModal}
                  aria-label={getString('performanceStatistic.aboutReport')}
                >
                  <HelpOutlineIcon fontSize="small" />
                </button>
              </Tooltip>
            </Grid>
          </Grid>
        </Collapse>
        <CollapseButton
          type="button"
          onClick={handleToggleCollapse}
          data-testid="collapse-button"
          className={clsx([
            'shadow-md !w-10 !h-10 !left-1/2 !-translate-x-1/2',
            isExpanded ? '!rotate-0' : '!rotate-180',
          ])}
        >
          <BoldArrowUpIcon color="primary" />
        </CollapseButton>
      </FilterContainer>
      {canRenderPerformanceContent && (
        <PerformanceStatisticContent
          filters={appliedFilters}
          watchedUserIds={watchedUserIds}
          onToggleWatched={handleToggleWatched}
          onStatsChange={handleStatsChange}
        />
      )}
      <Dialog
        open={isReportModalOpen}
        onClose={handleCloseReportModal}
        maxWidth={false}
        PaperProps={{
          className: '!bg-transparent !shadow-none',
        }}
      >
        <ShowReportModal onClose={handleCloseReportModal} />
      </Dialog>
    </div>
  );
}

export default PerformanceStatistic;

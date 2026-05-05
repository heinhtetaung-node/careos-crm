import { PhoneOutlineIcon } from '@alphafounders/icons';
import { Box, CircularProgress } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { PhoneInTalk } from '@material-ui/icons';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';

import { shouldShowHangupButton } from 'presentation/components/CallButtonV2/helper';
import CallTimer from 'presentation/components/CallButtonV2/Timer';
import Controls from 'presentation/components/controls/Control';
import useCareosCall from 'presentation/hooks/useCareosCall';
import { getString } from 'presentation/theme/localization';
import { useLazyGetLeadByIDQuery } from 'data/slices/leadSlice';
import { PhoneNumber } from 'shared/types/customer';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import SimpleCallButton from 'presentation/components/CallButtonLiveKit/SimpleCallButton';

const insurerLead = {
  production: 'leads/b144bef6-aab0-4e5f-9e78-29d6effca586',
  staging: 'leads/e096de67-6b91-4cea-83f6-97f5edc81501',
};

interface Insurer {
  name: string;
  displayName: string;
  phoneIndex: Array<{ name: string; index: number }>;
  primaryPhoneIndex?: number;
}

const initialInsurers: Insurer[] = [
  {
    name: get(insurerLead, process.env.VITE_ENV as string, insurerLead.staging),
    displayName: 'Bangkok Insurance(BKI)',
    phoneIndex: [],
  },
];

export default function ContactInsurers() {
  const [currentPhoneIndex, setCurrentPhoneIndex] = useState<number>();
  const [insurers, setInsurers] = useState<Insurer[]>(initialInsurers);
  const [fetchLeadById] = useLazyGetLeadByIDQuery();

  const { status, startCall, endCall } = useCareosCall({
    onStatusChange: (callStatus) => {
      console.log(callStatus);
    },
  });

  const flags = useFlags([
    FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE,
  ]);

  const isCrmWideEnableCallButtonLiveKit =
    flags[FeatureFlags.BROK_4280_ENABLE_CALL_BUTTON_LIVEKIT_CRM_WIDE]
      ?.enabled ?? false;

  const agentUser = useGetUserSelector();

  // Call lead detail endpoint for each insurer and update phone numbers
  useEffect(() => {
    const fetchLeadDetails = async () => {
      const updatedInsurers = await Promise.all(
        insurers.map(async (insurer) => {
          try {
            // Extract lead ID from 'leads/xxx' format
            const leadId = insurer.name.includes('/')
              ? insurer.name.split('/')[1]
              : insurer.name;

            const leadData = await fetchLeadById(leadId).unwrap();
            const phoneNumbers: PhoneNumber[] =
              leadData?.data?.customerPhoneNumber ?? [];
            const primaryPhoneIndex: number =
              leadData?.data?.primaryPhoneIndex ?? 0;

            // Map phone numbers to phoneIndex format
            const phoneIndex = phoneNumbers.map((phone, index) => ({
              name: phone.phone || '',
              index,
            }));

            return {
              ...insurer,
              phoneIndex,
              primaryPhoneIndex,
            };
          } catch (error) {
            console.error(
              `Failed to fetch lead details for ${insurer.name}:`,
              error
            );
            return insurer;
          }
        })
      );

      setInsurers(updatedInsurers);
    };

    fetchLeadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white p-5 mx-10 h-full">
      {insurers.map((insurer) => {
        // Filter to show only the primary phone index
        const primaryPhone = insurer.phoneIndex.find(
          (ph) => ph.index === insurer.primaryPhoneIndex
        );

        if (!primaryPhone) {
          return (
            <div key={insurer.name}>
              <div className="font-bold">{insurer.displayName}</div>
              <div>No primary phone available</div>
            </div>
          );
        }

        return (
          <div key={insurer.name}>
            <div className="font-bold">{insurer.displayName}</div>
            <ul>
              <li className="flex items-center">
                {isCrmWideEnableCallButtonLiveKit ? (
                  <SimpleCallButton
                    agentName={agentUser.name}
                    leadName={insurer.name}
                    phoneIndex={primaryPhone.index}
                  />
                ) : (
                  <>
                    {/* {primaryPhone.name} */}
                    <Button
                      className=""
                      data-testid="start-call-button"
                      onClick={() => {
                        setCurrentPhoneIndex(primaryPhone.index);
                        startCall(insurer.name, primaryPhone.index);
                      }}
                      disabled={status !== 'idle' && status !== 'ended'}
                    >
                      <Box display="flex" mr={1}>
                        <PhoneOutlineIcon />
                      </Box>
                      {getString('text.call')}
                      {status === 'connecting' &&
                        currentPhoneIndex === primaryPhone.index && (
                          <CircularProgress size={20} className="loading" />
                        )}
                    </Button>
                    {shouldShowHangupButton(status) &&
                      currentPhoneIndex === primaryPhone.index && (
                        <Controls.Button
                          className="py-1"
                          variant="contained"
                          color="secondary"
                          startIcon={<PhoneInTalk />}
                          onClick={() => endCall()}
                        >
                          <div className="leading-[.4rem] flex flex-col gap-3">
                            <div>{getString('text.hangUp')}</div>
                            {status === 'incall' && <CallTimer />}
                          </div>
                        </Controls.Button>
                      )}
                  </>
                )}
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}

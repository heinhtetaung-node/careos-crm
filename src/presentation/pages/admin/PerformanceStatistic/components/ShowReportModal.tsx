import {
  AlertCircleIcon,
  ArrowUpWideIcon,
  CheckCircleIconAlt,
  CloseIcon,
  CoinsIcon,
  FileTextIcon,
  IdleIcon,
  MessageSquareOffIcon,
  MessagesSquareIcon,
  OrdersCreatedIcon,
  PhoneAltIcon,
  PhoneClockIcon,
  PhoneOfflineIcon,
  PhoneOutgoingIcon,
  PhoneSmallIcon,
  TrendingUpIcon,
  UploadArrowIcon,
} from '@alphafounders/icons';
import { getString } from 'presentation/theme/localization';
import React from 'react';

export interface ShowReportModalProps {
  onClose?: () => void;
}

export default function ShowReportModal({ onClose }: ShowReportModalProps) {
  return (
    <div className="flex items-start bg-white rounded-2xl justify-center p-4 w-[924px] max-h-[924px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="w-full max-w-[924px]  p-4 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-start gap-2 self-stretch">
          <div className="flex justify-between items-center flex-1">
            <h1 className="flex-1 text-[26px] font-bold text-black">
              {getString('performanceStatistic.aboutReport')}
            </h1>
          </div>
          <button
            type="button"
            className="flex items-center justify-center p-0 bg-transparent border-0 shadow-none outline-none cursor-pointer"
            aria-label={getString('performanceStatistic.close')}
            onClick={onClose}
          >
            <CloseIcon className="w-[18.5px] h-[18.5px]" fillColor="#005098" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200" />

        {/* Report Legend Section */}
        <div className="flex flex-col items-start gap-4 flex-1 self-stretch">
          <div className="flex items-start gap-2 w-full">
            {/* Status Indicators Column 1 */}
            <div className="flex flex-col gap-4 px-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded">
                  <PhoneAltIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.reportModal.statusOncall')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-[#a5aac0]">
                  <PhoneOfflineIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-normal text-[#a5aac0]">
                  {getString('performanceStatistic.reportModal.statusLogOut')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded">
                  <IdleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.reportModal.statusIdle')}
                </span>
              </div>
            </div>

            {/* Status Indicators Column 2 */}
            <div className="flex flex-col gap-4 px-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneSmallIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.callAttemptsLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneOutgoingIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.callsSucceededLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneClockIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.talkTimeLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <TrendingUpIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.averageTimePerSuccessCallLastHour'
                  )}
                </span>
              </div>
            </div>

            {/* Status Indicators Column 3 */}
            <div className="flex flex-col gap-4 px-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <CoinsIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.reportModal.inTank')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <FileTextIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.followUpAttemptsLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <ArrowUpWideIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.successfulFollowupAttemptsLastHour'
                  )}
                </span>
              </div>
            </div>

            {/* Status Indicators Column 4 */}
            <div className="flex flex-col gap-4 px-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <MessageSquareOffIcon
                    className="w-5 h-5"
                    fillColor="#005098"
                  />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.tooltips.noAnswer')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <AlertCircleIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.tooltips.rejected')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <MessagesSquareIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.tooltips.contacted')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <UploadArrowIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.tooltips.numberOfFollowUpsSet'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <CheckCircleIconAlt className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.tooltips.waitingForPayment')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <OrdersCreatedIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.tooltips.numberOfOrdersCreated'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Explanation Section */}
        <div className="flex flex-col items-start gap-1 flex-1 self-stretch">
          <div className="flex px-1 items-start gap-2 self-stretch">
            <h2 className="flex-1 text-lg font-bold text-black">
              {getString('performanceStatistic.reportModal.statusExplanation')}
            </h2>
          </div>

          <div className="w-full h-px bg-gray-200" />

          <div className="grid grid-cols-4 gap-2 py-1 flex-1 self-stretch w-full">
            {/* Column 1: Metrics Labels */}
            <div className="grid grid-rows-8 gap-2 px-2 self-stretch">
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <IdleIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString('performanceStatistic.reportModal.idleTime')}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneSmallIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.callAttemptsLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneOutgoingIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.callsSucceededLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <PhoneClockIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.talkTimeLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <TrendingUpIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.averageTimePerSuccessCallLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <CoinsIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.numberOfLeadsInTank'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <FileTextIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.followUpAttemptsLastHour'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-stretch">
                <div className="flex items-center justify-center w-6 h-6 rounded">
                  <ArrowUpWideIcon className="w-5 h-5" fillColor="#005098" />
                </div>
                <span className="text-sm font-normal text-black">
                  {getString(
                    'performanceStatistic.reportModal.successfulFollowupAttemptsLastHour'
                  )}
                </span>
              </div>
            </div>

            {/* Column 2: Green (Good) Values */}
            <div className="grid grid-rows-8 gap-2 px-1 self-stretch">
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  T &lt; 5 mins
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  15 &lt; A
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  7 &lt; S
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  40 min &lt; TT
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  7 &lt;= AT &lt;= 10 min
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  30 &lt;= LT &lt;= 40
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  100%
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#2fce82]">
                <span className="flex-1 text-sm font-bold text-white">
                  70% &lt; SFuA
                </span>
              </div>
            </div>

            {/* Column 3: Orange (Warning) Values */}
            <div className="grid grid-rows-8 gap-2 px-1 self-stretch">
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  5mins &lt;= T &lt;= 10 mins
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  10 &lt;= A &lt;=15
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  5 &lt;= S &lt;= 7
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  30 &lt;= TT &lt;= 40
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  5 &lt;= AT &lt; 7<br />
                  10 &lt; AT &lt;= 15
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  25 &lt;= LT &lt; 30
                  <br />
                  40 &lt; LT &lt;= 50
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  {getString(
                    'performanceStatistic.reportModal.noAttemptsScheduled'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#f78f1e]">
                <span className="flex-1 text-sm font-bold text-white">
                  50% &lt;= SFuA &lt;=70%
                </span>
              </div>
            </div>

            {/* Column 4: Red (Bad) Values */}
            <div className="grid grid-rows-8 gap-2 px-1 self-stretch">
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  10 mins &lt; T
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  A &lt; 10
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  S &lt; 5
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  TT &lt; 30 mins
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  AT &lt; 5 mins
                  <br />
                  15 mins &lt; AT
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  LT &lt; 25
                  <br />
                  50 &lt; AT
                </span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">FuA</span>
              </div>
              <div className="flex items-center gap-2.5 self-stretch px-2.5 py-2 bg-[#ea4548]">
                <span className="flex-1 text-sm font-bold text-white">
                  SFuA &lt; 50%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

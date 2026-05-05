import { PRODUCTS } from 'config/TypeFilter';
import LeadDetail from 'data/repository/leadDetail/cloud';
import {
  IGetAppointmentDetail,
  ILeadAppointment,
} from 'presentation/components/scheduleModal/scheduleModalHelper';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { formatLead } from 'presentation/redux/epics/leadDetail/getLeadDataEpic/helper';
import { getString } from 'presentation/theme/localization';
import { IDeleteAppointment } from 'shared/interfaces/common/lead/detail';

export const getAppointmentHelper: IGetAppointmentDetail = (
  payload,
  callback
) => {
  const { lead } = payload as ILeadAppointment;
  const leadId = lead.split('/')[1];
  LeadDetail.getLeadDetailById(leadId).subscribe((response: any) => {
    const res = formatLead(response);
    callback({
      humanId: {
        id: res.humanId,
        label: getString('timeSlotCallBack.leadID'),
      },
      name: `${res.data.customerFirstName} ${res.data.customerLastName}`,
      detailLink: `${res.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE ? '/health' : ''}/leads/${leadId}`,
    });
  });
};

export const handleDeleteAppointment = (
  data: IDeleteAppointment,
  dispatch: any,
  close: () => void
) => {
  LeadDetail.deleteAppointment(data).subscribe(() => {
    dispatch(
      showSnackBar({
        isOpen: true,
        message: getString('text.deleteAppointmentSuccess'),
        status: 'success',
      })
    );
    close();
  });
};

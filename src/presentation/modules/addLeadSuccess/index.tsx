import React from 'react';

import { getString } from 'presentation/theme/localization';
import './index.scss';

export interface IProps {
  leadId: string;
}

const AddLeadSuccess: React.FC<IProps> = ({ leadId }) => {
  return (
    <div className="lead-add-lead-success">
      <img
        className="placeholder-image"
        alt="placeholder-add-lead"
        src="/static/img/leads/add-lead-icon.svg"
      />
      <p className="alert">
        {`${getString('text.alertLeadId', {
          leadId,
        })} `}
      </p>
    </div>
  );
};
export default AddLeadSuccess;

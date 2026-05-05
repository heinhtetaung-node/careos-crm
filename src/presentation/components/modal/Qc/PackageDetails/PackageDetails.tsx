import { withStyles } from '@material-ui/styles';
import React from 'react';

import GenericDialog from 'presentation/components/common/Dialog';
import DetailViewTextField from 'presentation/components/common/FormikFields/DetailViewTextField';
import InputContainer from 'presentation/components/common/FormikFields/InputContainer/InputContainer';
import {
  Questions,
  questionFields,
  questions,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';
import { getString } from 'presentation/theme/localization';
import { MotoTypes } from 'shared/constants/orderType';

interface PackageDetailsProps {
  modalToggle: boolean;
  handleModalToggle: () => void;
  packageDetails: Record<string, string | number>;
}

const mergeQuestionConfig = questions.map(({ qId, label }) => ({
  fields: questionFields.find((q) => q.qId === qId)?.fields,
  section: label,
  qId,
}));

const questionIds = [
  Questions.COVERAGE_VOLUNTARY_SUM_INSURED,
  Questions.COVERAGE_VOLUNTARY_THIRD_PARTY_LIABILITY,
  Questions.COVERAGE_VOLUNTARY_ADDITIONAL_COVERAGE,
];

const questionSections = questionIds.map((id) =>
  mergeQuestionConfig.find(({ qId }) => qId === id)
);

const Dialog = withStyles({
  root: {
    '& .MuiDialogContent-root': {},
  },
})(GenericDialog);

export default function PackageDetails({
  modalToggle,
  handleModalToggle,
  packageDetails,
}: PackageDetailsProps) {
  const renderPackgeDetailFields = () => {
    if (packageDetails.motorItemType === MotoTypes.MOTOR_TYPE_COMPULSORY) {
      return (
        <>
          <DetailViewTextField
            isReadOnly
            title={getString('qc.insuranceType')}
            name="insuranceType"
            value={getString(packageDetails.insuranceType as string)}
          />
          <DetailViewTextField
            isReadOnly
            title={getString('qc.insurer')}
            name="insurer"
            value={packageDetails.insurer}
          />
          <DetailViewTextField
            isReadOnly
            title={getString('qc.premium')}
            name="premium"
            value={packageDetails.premium}
          />
          <DetailViewTextField
            isReadOnly
            title={getString('leadDetailFields.discount')}
            name="discount"
            value={packageDetails.discount}
          />
        </>
      );
    }
    return (
      <div>
        <DetailViewTextField
          isReadOnly
          title={getString('qc.insuranceType')}
          name="insuranceType"
          value={getString(packageDetails.insuranceType as string)}
        />
        <DetailViewTextField
          isReadOnly
          title={getString('qc.insurer')}
          name="insurer"
          value={packageDetails.insurer}
        />
        <DetailViewTextField
          isReadOnly
          title={getString('qc.packageType')}
          name="packageType"
          value={packageDetails.packageType}
        />
        <DetailViewTextField
          isReadOnly
          title={getString('qc.packageName')}
          name="packageName"
          value={packageDetails.packageName}
        />
        <DetailViewTextField
          isReadOnly
          title={getString('qc.premium')}
          name="premium"
          value={packageDetails.premium}
        />
        <DetailViewTextField
          isReadOnly
          title={getString('leadDetailFields.discount')}
          name="discount"
          value={packageDetails.discount}
        />
        {questionSections.map(({ fields, section }: any) => (
          <React.Fragment key={section}>
            <InputContainer title={section} isSectionTitle />
            {fields.map((field: any) => (
              <DetailViewTextField
                key={field.title}
                title={getString(field.title)}
                name={field.name}
                isReadOnly
                value={(packageDetails as any)[field.name]}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    );
  };
  if (!packageDetails) return null;
  return (
    <Dialog
      open={modalToggle}
      title={getString('qc.packageDetails')}
      handleToggle={handleModalToggle}
      content={renderPackgeDetailFields()}
      data-testid="package-details-dialog"
    />
  );
}

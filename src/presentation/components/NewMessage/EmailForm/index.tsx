import {
  Chip,
  createStyles,
  Grid,
  InputLabel,
  makeStyles,
} from '@material-ui/core';
import ChipInput from 'material-ui-chip-input';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { SelectElement } from 'shared/types/controls';

import AddQuoteURL from './AddQuoteURL';
import {
  AttachmentExtensions,
  isEmail,
  customToEmail,
  EmailTemplateOptions,
} from './email.helper';

import EmailMessageBox from '../../EmailMessageBox';
import { EmailTemplates as emailTemplateOptions } from '../newMessage.helper';
import './index.scss';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import { getLeadIdFromLeadName } from 'shared/helper/utilities';
import { satangToBaht } from 'utils/currency';

const KEY_CODE = {
  ENTER: 13,
  TAB: 9,
};

const FILE_CONFIG = {
  MAX_ONE_FILE_SIZE: 5e6,
  MAX_ALL_FILE_SIZE: 5e6,
};

interface IEmail {
  message: string;
  emailTemplate: string;
  to: string;
  cc: string[];
  subject: string;
  attachment: any[];
  packageUrl?: string;
}

interface EmailFormProps {
  changeForm: (formData: IEmail) => void;
  email: IEmail;
}

function EmailForm({ changeForm: handleChangeForm, email }: EmailFormProps) {
  const useStyles = makeStyles(() =>
    createStyles({
      previewChip: {
        minWidth: 100,
        maxWidth: 210,
        marginBottom: 5,
        marginRight: 5,
        float: 'left',
      },
      attachmentChip: {
        marginRight: 5,
        marginBottom: 5,
      },
      adornmentEnd: {
        paddingRight: 0,
        alignItems: 'stretch',
      },
    })
  );

  const dispatch = useDispatch();

  const listToEmail = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead.payload?.data?.customerEmail || []
  );

  const leadId = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead.payload?.humanId || '{{leadId}}'
  );

  const purchasePackage = useSelector(
    (state: any) =>
      state.leadsDetailReducer?.lead.payload?.data?.checkout?.package || ''
  );

  const leadData = useSelector(
    (state: any) => state.leadsDetailReducer?.lead.payload
  );

  const { data: selectedPackage } = useGetSelectedPackageQuery({
    leadId: getLeadIdFromLeadName(leadData.name),
    enableDiscountPricing: true,
  });

  const carDetails = selectedPackage?.carPackageWithPricing?.carDetails;
  const packageDetails = selectedPackage?.carPackageWithPricing?.package;

  const customListToEmail = customToEmail(listToEmail);

  const classes = useStyles();
  const [error, setError] = useState('');
  const [emailToError, setEmailToError] = useState('');

  const isInList = (_email: string) => {
    const isExist = email.cc.filter((val: string) => val === _email).length;
    return isExist;
  };

  useEffect(() => {
    const checkIsOneEmailLead = (toList: any[]) => {
      if (toList.length === 1) {
        handleChangeForm({
          ...email,
          to: toList[0].id,
        });
      }
    };

    checkIsOneEmailLead(customListToEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = (_email: string) => {
    let errorMsg = null;

    if (isInList(_email)) {
      errorMsg = getString('text.isExistedEmail', {
        email: _email,
      });
    }

    if (!isEmail(_email)) {
      errorMsg = getString('text.invalidEmail', {
        email: _email,
      });
    }

    if (errorMsg) {
      setError(errorMsg);

      return false;
    }

    return true;
  };

  const handleAddEmail = (emailChip: string) => {
    const value = emailChip.trim();

    if (value && isValid(value)) {
      email.cc.push(value);
      setError('');
    }
  };

  const handleDelete = (deletedEmail: string) => {
    const newCcList = email.cc.filter((val: string) => val !== deletedEmail);
    handleChangeForm({
      ...email,
      cc: [...newCcList],
    });
    setError('');
  };

  const checkTotalFileSize = (fileList: File[]): number => {
    let totalFileSize = 0;
    fileList.forEach((file) => {
      totalFileSize += file.size;
    });
    return totalFileSize;
  };

  const handleDropFile = (file: File) => {
    email.attachment.push(file);
    if (checkTotalFileSize(email.attachment) >= FILE_CONFIG.MAX_ALL_FILE_SIZE) {
      email.attachment.splice(-1, 1);
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.totalMaxFileSize', {
            fileName: file.name,
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      handleChangeForm({
        ...email,
        attachment: email.attachment,
      });
    }
  };

  const bindEmailTemplate = (e: React.ChangeEvent<SelectElement>) => {
    const title = getString(`emailTemplateOption.${e.target.value}.title`, {
      leadId,
    });
    const template = getString(
      `emailTemplateOption.${e.target.value}.content`,
      {
        leadId,
        purchasePackage: purchasePackage || '',
        customerName: `${leadData.data?.customerFirstName} ${leadData.data?.customerLastName}`,
        carInfo: `${carDetails?.brand ?? '[Car Brand]'} ${carDetails?.model ?? '[Car Model]'} (${carDetails?.year ?? '[Car Year]'})`,
        finalPrice: `${satangToBaht(packageDetails?.invoicePrice ?? 0)} THB`,
      }
    );

    handleChangeForm({
      ...email,
      emailTemplate: e.target.value as string,
      subject: title,
      message: template,
      to: '',
    });
  };

  const bindChange = (e: React.ChangeEvent<SelectElement>) => {
    const { name, value } = e.target;

    handleChangeForm({
      ...email,
      [name as string]: value,
    });
  };

  const checkEmailValidation = (e: React.ChangeEvent<SelectElement>) => {
    const { name, value } = e.target;
    if (name === 'to') {
      if (value && !isEmail(value as string)) {
        setEmailToError(
          getString('text.invalidEmail', {
            email: value,
          })
        );
      } else {
        setEmailToError('');
      }
    }
  };

  const handleRejectedFile = (
    rejectedFile: { name: string; type: string | undefined; size: number },
    acceptedFiles: string[],
    maxFileSize: number
  ) => {
    // INFO: Handle error when upload file type not supported or too big
    let msg = '';
    const fileType = rejectedFile.type || '';
    if (rejectedFile.size >= maxFileSize) {
      msg = getString('text.emailFileSizeLimit', {
        fileName: rejectedFile.name,
      });
    } else if (!acceptedFiles.includes(fileType)) {
      msg = getString('text.unsupportedFile', {
        fileName: rejectedFile.name,
      });
    }
    dispatch(
      showSnackBar({
        isOpen: true,
        message: msg,
        status: CONSTANTS.snackBarConfig.type.error,
      })
    );
  };

  const handleDeleteAttachment = (index: number) => {
    email.attachment.splice(index, 1);
    handleChangeForm({
      ...email,
      attachment: email.attachment,
    });
  };

  const handleMessageChange = (message?: string) => {
    if (!message) return;
    handleChangeForm({
      ...email,
      message,
    });
  };

  const renderAttachments = () => {
    if (email.attachment && email.attachment.length) {
      return email.attachment.map((file: File, index: number) => (
        <Chip
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          label={file.name}
          onDelete={() => {
            handleDeleteAttachment(index);
          }}
          className={classes.attachmentChip}
          color="default"
        />
      ));
    }
    return null;
  };
  const removeQuotationLink = false;

  return (
    <div className="email-form">
      <Grid container className="email-container">
        <Grid item xs={12}>
          <Controls.Select
            name="emailTemplate"
            label={getString('text.emailTemplate')}
            value={email.emailTemplate}
            onChange={bindEmailTemplate}
            options={emailTemplateOptions}
            selectField="value"
            fixedLabel
            placeholder={getString('text.select')}
          />
        </Grid>

        <Grid item xs={12}>
          {email?.emailTemplate === EmailTemplateOptions.other ? (
            <>
              <Controls.Input
                name="to"
                placeholder={getString('text.to')}
                label={getString('text.to')}
                value={email.to}
                onChange={bindChange}
                fixedLabel
                onBlur={checkEmailValidation}
              />
              {emailToError && <p className="invalid">{emailToError}</p>}
            </>
          ) : (
            <Controls.Select
              name="to"
              label={getString('text.to')}
              value={email.to}
              onChange={bindChange}
              selectField="id"
              options={customListToEmail}
              fixedLabel
              placeholder={getString('text.select')}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <ChipInput
            className="email-form__cc"
            value={email.cc || []}
            label={getString('text.cc')}
            newChipKeyCodes={[KEY_CODE.ENTER, KEY_CODE.TAB]}
            onAdd={(chip) => handleAddEmail(chip)}
            onDelete={(chip) => handleDelete(chip)}
            allowDuplicates
            alwaysShowPlaceholder
            clearInputValueOnChange
            placeholder={getString('text.enterCC')}
            InputLabelProps={{ shrink: true }}
            disableUnderline
          />
          {error && <p className="invalid">{error}</p>}
        </Grid>

        <Grid item xs={12}>
          <Controls.Input
            name="subject"
            placeholder={getString('text.enterSubject')}
            label={getString('text.subject')}
            value={email.subject}
            onChange={bindChange}
            fixedLabel
          />
        </Grid>

        {!removeQuotationLink &&
          email.emailTemplate === EmailTemplateOptions.quote && (
            <AddQuoteURL
              setEmailMessage={handleMessageChange}
              message={email.message}
            />
          )}

        <Grid item xs={12}>
          <InputLabel className="ql-input-label" htmlFor="package-url">
            {getString('text.message')}
          </InputLabel>
          <EmailMessageBox
            value={email.message}
            handleChange={handleMessageChange}
          />
        </Grid>
        <Grid item xs={12}>
          <p className="ql-input-label">{getString('text.addFile')}</p>
          <DropzoneArea
            dropzoneClass="email-form__attachment"
            acceptedFiles={AttachmentExtensions}
            filesLimit={100}
            dropzoneText={getString('text.dragOrChooseFile')}
            dropzoneParagraphClass="email-form__attachment__text"
            maxFileSize={FILE_CONFIG.MAX_ONE_FILE_SIZE}
            showPreviewsInDropzone={false}
            previewChipProps={{ classes: { root: classes.previewChip } }}
            useChipsForPreview
            showPreviews={false}
            onDrop={handleDropFile}
            showAlerts={false}
            getDropRejectMessage={(
              rejectedFile,
              acceptedFiles,
              maxFileSize
            ) => {
              handleRejectedFile(rejectedFile, acceptedFiles, maxFileSize);
              return '';
            }}
          />
          {renderAttachments()}
        </Grid>
      </Grid>
    </div>
  );
}

export default EmailForm;

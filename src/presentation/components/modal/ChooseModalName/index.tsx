import { withStyles } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import { green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';

import { getString } from '../../../theme/localization';
import { Color } from '../../../theme/variants';
import Controls from '../../controls/Control';
import VSIcon from '../../VSIcon';
import CommonModal from '../CommonModal';

export const GreenCheckbox = withStyles((theme) => ({
  root: {
    color: 'transparent',
    '& .MuiSvgIcon-root': {
      fontSize: '1.4rem',
    },
    '&:not($checked):not(.MuiCheckbox-indeterminate) .MuiIconButton-label:after':
      {
        content: `""`,
        height: 16,
        width: 16,
        position: 'absolute',
        backgroundColor: theme.palette.common.white,
        zIndex: 0,
        borderRadius: '4px',
      },
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
}))(Checkbox);

const style = makeStyles({
  chooseNameModal: {
    '& .choose-modal-content': {
      marginBottom: '20px',
      '& .customer-items': {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '30px 20px',
      },

      '& .item': {
        width: '47%',
        borderRadius: '10px',
        border: `1px solid ${Color.BLUE_MEDIUM}`,
        '&.active': {
          border: `1px solid ${Color.BLUE_BOLD}`,
        },
        '& .clearfix': {
          clear: 'both',
        },

        '& .MuiButtonBase-root': {
          float: 'right',
          marginRight: 0,
        },
      },
      '& .header': {
        background: Color.BLUE_MEDIUM,
        borderRadius: '10px 10px 0 0',
      },

      '& .title': {
        fontSize: '12px',
        color: Color.GREY_800,
        flex: 1,
      },

      '& .column-title': {
        fontWeight: 'bold',
        fontSize: '14px',
        color: Color.BLUE_BOLD,
        marginTop: '10px',
        marginLeft: '10px',
        float: 'left',
      },

      '& .name-rows': {
        listStyle: 'none',
        margin: 0,
        padding: 0,

        '& .row-item': {
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px',
          '&:last-child': {
            borderTop: `1px solid ${Color.BLUE_MEDIUM}`,
          },
        },
      },
    },
  },
});

const defaultChecked = {
  oldChecked: false,
  latestChecked: false,
};
const ChooseNameModal: React.FC = () => {
  const [isOpenChooseName, setIsOpenChooseName] = useState(false);
  const [checkedName, setCheckedName] = React.useState(defaultChecked);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedName({
      ...defaultChecked,
      [event.target.name]: event.target.checked,
    });
  };

  const styleModal = style();
  const isActive = useMemo(() => {
    return checkedName.oldChecked || checkedName.latestChecked;
  }, [checkedName]);

  return (
    <>
      {isOpenChooseName ? (
        <CommonModal
          title={getString('text.pleaseChooseCorrectCustomer')}
          open={isOpenChooseName}
          handleCloseModal={() => setIsOpenChooseName(false)}
          isShowCloseBtn={false}
          maxWidth="md"
          hasBorderRadius
          isHeaderCenter
        >
          <div className={styleModal.chooseNameModal}>
            <div className="choose-modal-content">
              <div className="customer-items container">
                <div
                  className={clsx('item', checkedName.oldChecked && 'active')}
                >
                  <div className="header">
                    <span className="column-title">
                      {getString('text.existingInformation')}
                    </span>
                    <GreenCheckbox
                      checked={checkedName.oldChecked}
                      onChange={handleChange}
                      name="oldChecked"
                    />
                    <div className="clearfix" />
                  </div>
                  <div>
                    <ul className="name-rows">
                      <li className="row-item">
                        <span className="title">
                          {getString('text.firstName')}
                        </span>
                        <span className="title">: Siriwan</span>
                      </li>
                      <li className="row-item">
                        <span className="title">
                          {getString('text.lastName')}
                        </span>
                        <span className="title">: Tongkleang</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <VSIcon />
                <div
                  className={clsx(
                    'item',
                    checkedName.latestChecked && 'active'
                  )}
                >
                  <div className="header">
                    <span className="column-title">
                      {getString('text.latestInformation')}
                    </span>
                    <GreenCheckbox
                      checked={checkedName.latestChecked}
                      onChange={handleChange}
                      name="latestChecked"
                    />
                    <div className="clearfix" />
                  </div>
                  <div>
                    <ul className="name-rows">
                      <li className="row-item">
                        <span className="title">
                          {getString('text.firstName')}
                        </span>
                        <span className="title">: Siriwan</span>
                      </li>
                      <li className="row-item">
                        <span className="title">
                          {getString('text.lastName')}
                        </span>
                        <span className="title">: Tongkleang</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <Controls.Button
                text={getString('text.confirmButton')}
                color="primary"
                style={{ textTransform: 'uppercase' }}
                disabled={!isActive}
              />
            </div>
          </div>
        </CommonModal>
      ) : null}
    </>
  );
};

export default ChooseNameModal;

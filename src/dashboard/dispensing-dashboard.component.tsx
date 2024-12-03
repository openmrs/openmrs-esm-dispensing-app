import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { type PharmacyConfig } from '../config-schema';
import { PharmacyHeader } from '../pharmacy-header/pharmacy-header.component';
import PrescriptionTabLists from '../prescriptions/prescription-tab-lists.component';
import Overlay from '../forms/overlay/overlay.component';

export default function DispensingDashboard() {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();

  if (config.dispenseBehavior.restrictTotalQuantityDispensed && config.dispenseBehavior.allowModifyingPrescription) {
    return (
      <div className={`omrs-main-content`}>
        <InlineNotification
          title={t('dispensingAppError', 'Dispensing App Error')}
          subtitle={t(
            'dispensingAppMisconfigurationMessage',
            "Please contact your system administration: Misconfiguration - 'restrictTotalQuantityDispensed' cannot be enabled if 'allowModifyingPrescription' is enabled.",
          )}
        />
      </div>
    );
  } else {
    return (
      <div className="omrs-main-content">
        <PharmacyHeader />
        {/* <DispensingTiles /> */}
        <PrescriptionTabLists />
        <Overlay />
      </div>
    );
  }
}

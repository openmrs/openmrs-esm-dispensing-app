import React from 'react';
import { InlineNotification } from '@carbon/react';
import { PharmacyHeader } from '../pharmacy-header/pharmacy-header.component';
import PrescriptionTabLists from '../prescriptions/prescription-tab-lists.component';
import { useConfig, WorkspaceContainer } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type PharmacyConfig } from '../config-schema';

export default function DispensingDashboard() {
  const config = useConfig<PharmacyConfig>();
  const { t } = useTranslation();
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
      <div className={`omrs-main-content`}>
        <PharmacyHeader />
        {/* <DispensingTiles /> */}
        <PrescriptionTabLists />
        <WorkspaceContainer key="dispensing" contextKey="dispensing" />
      </div>
    );
  }
}

import React from "react";
import { InlineNotification } from "@carbon/react";
import Overlay from "../forms/overlay/overlay.component";
import { PharmacyHeader } from "../pharmacy-header/pharmacy-header.component";
import PrescriptionTabLists from "../prescriptions/prescription-tab-lists.component";
import { PharmacyConfig } from "../config-schema";
import { useConfig } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

export default function DispensingDashboard() {
  const config = useConfig() as PharmacyConfig;
  const { t } = useTranslation();
  if (
    config.dispenseBehavior.restrictTotalQuantityDispensed &&
    config.dispenseBehavior.allowModifyingPrescription
  ) {
    return (
      <div className={`omrs-main-content`}>
        <InlineNotification
          title={t("dispensingAppError", "Dispensing App Error")}
          subtitle={t(
            "dispensingAppMisconfigurationMessage",
            "Please contact your system administration: Misconfiguration - 'restrictTotalQuantityDispensed' cannot be enabled if 'allowModifyingPrescription' is enabled."
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
        <Overlay />
      </div>
    );
  }
}

import React, { useEffect } from "react";
import {
  attach,
  detach,
  ExtensionSlot,
  PatientUuid,
  useConfig,
  usePatient,
} from "@openmrs/esm-framework";
import styles from "./patient-details.scss";
import { useTranslation } from "react-i18next";

const PatientDetails: React.FC<{
  patientUuid: PatientUuid;
}> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { patient } = usePatient(patientUuid);

  const patientName = patient;
  const patientPhotoSlotState = React.useMemo(
    () => ({ patientUuid, patientName }),
    [patientUuid, patientName]
  );

  const [showContactDetails, setShowContactDetails] = React.useState(false);
  const toggleContactDetails = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowContactDetails((value) => !value);
  }, []);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
    </div>
  );

  const getGender = (gender) => {
    switch (gender) {
      case "M":
        return t("male", "Male");
      case "F":
        return t("female", "Female");
      case "O":
        return t("other", "Other");
      case "U":
        return t("unknown", "Unknown");
      default:
        return gender;
    }
  };

  useEffect(() => {
    attach("dispensing-patient-banner-slot", "patient-banner");
    attach("dispensing-patient-vitals-slot", "vitals-overview-widget");
    attach("dispensing-patient-allergies-slot", "allergies-overview-widget");

    return () => {
      detach("dispensing-patient-banner-slot", "patient-banner");
      detach("dispensing-patient-vitals-slot", "vitals-overview-widget");
      detach("dispensing-patient-allergies-slot", "allergies-overview-widget");
    };
  }, []);

  return (
    <div>
      {patient && (
        <div className={styles.patientDetailsContainer}>
          <ExtensionSlot
            name="dispensing-patient-banner-slot"
            state={{
              patient,
              patientUuid: patientUuid,
            }}
          />

          <ExtensionSlot
            name="dispensing-patient-vitals-slot"
            state={{
              patient,
              patientUuid: patientUuid,
            }}
          />

          <ExtensionSlot
            name="dispensing-patient-allergies-slot"
            state={{
              patient,
              patientUuid: patientUuid,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PatientDetails;

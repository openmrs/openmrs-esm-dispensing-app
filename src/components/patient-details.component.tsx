import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { attach, detach, ExtensionSlot, type PatientUuid, usePatient } from '@openmrs/esm-framework';
import styles from './patient-details.scss';

const PatientDetails: React.FC<{
  patientUuid: PatientUuid;
}> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);

  const patientName = patient;
  const patientPhotoSlotState = useMemo(() => ({ patientUuid, patientName }), [patientUuid, patientName]);

  const [showContactDetails, setShowContactDetails] = useState(false);
  const toggleContactDetails = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowContactDetails((value) => !value);
  }, []);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
    </div>
  );

  useEffect(() => {
    attach('dispensing-patient-banner-slot', 'patient-banner');
    attach('dispensing-patient-vitals-slot', 'vitals-overview-widget');
    attach('dispensing-patient-allergies-slot', 'allergies-overview-widget');

    return () => {
      detach('dispensing-patient-banner-slot', 'patient-banner');
      detach('dispensing-patient-vitals-slot', 'vitals-overview-widget');
      detach('dispensing-patient-allergies-slot', 'allergies-overview-widget');
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

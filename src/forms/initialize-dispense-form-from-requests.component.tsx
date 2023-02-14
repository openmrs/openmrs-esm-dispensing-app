import React, { useEffect, useState } from "react";
import { usePrescriptionDetails } from "../medication-request/medication-request.resource";
import { useConfig, useSession } from "@openmrs/esm-framework";
import { initiateMedicationDispenseBody } from "../medication-dispense/medication-dispense.resource";
import { MedicationDispense } from "../types";
import { PharmacyConfig } from "../config-schema";
import DispenseForm from "./dispense-form.component";

interface NewDispenseFormProps {
  encounterUuid: string;
  mutate: Function;
}

/**
 * Generates the form adding *new* medication requests based on existing medication requests
 * @param encounterUuid
 * @param mutatePrescriptionTableRows
 * @constructor
 */
const InitializeDispenseFormFromRequests: React.FC<NewDispenseFormProps> = ({
  encounterUuid,
  mutate,
}) => {
  const {
    requests,
    mutate: mutatePrescriptionDetails,
    isLoading,
  } = usePrescriptionDetails(encounterUuid);
  const session = useSession();
  const config = useConfig() as PharmacyConfig;

  const [medicationDispenses, setMedicationDispenses] = useState(
    Array<MedicationDispense>
  );

  useEffect(() => {
    if (requests) {
      let dispenseMedications = initiateMedicationDispenseBody(
        requests,
        session,
        config.medicationRequestExpirationPeriodInDays
      );
      setMedicationDispenses(dispenseMedications);
    }
  }, [requests, session, config.medicationRequestExpirationPeriodInDays]);

  return (
    <DispenseForm
      isLoading={isLoading}
      medicationDispenses={medicationDispenses}
      mode="enter"
      mutate={() => {
        mutate();
        mutatePrescriptionDetails();
      }}
    />
  );
};
export default InitializeDispenseFormFromRequests;

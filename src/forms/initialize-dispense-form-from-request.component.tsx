import React, { useEffect, useState } from "react";
import { useConfig, useSession } from "@openmrs/esm-framework";
import { initiateMedicationDispenseBody } from "../medication-dispense/medication-dispense.resource";
import { MedicationDispense, MedicationRequest } from "../types";
import { PharmacyConfig } from "../config-schema";
import DispenseForm from "./dispense-form.component";

interface NewDispenseFormProps {
  medicationRequest: MedicationRequest;
  mutate: Function;
}

/**
 * Generates the form adding *new* medication requests based on existing medication requests
 * @param encounterUuid
 * @param mutatePrescriptionTableRows
 * @constructor
 */
const InitializeDispenseFormFromRequest: React.FC<NewDispenseFormProps> = ({
  medicationRequest,
  mutate,
}) => {
  const session = useSession();
  const config = useConfig() as PharmacyConfig;

  const [medicationDispense, setMedicationDispense] =
    useState<MedicationDispense>();
  useEffect(() => {
    if (medicationRequest) {
      let medicationDispense = initiateMedicationDispenseBody(
        medicationRequest,
        session,
        config.medicationRequestExpirationPeriodInDays
      );
      setMedicationDispense(medicationDispense);
    }
  }, [
    medicationRequest,
    session,
    config.medicationRequestExpirationPeriodInDays,
  ]);

  return (
    <DispenseForm
      medicationDispense={medicationDispense}
      mode="enter"
      mutate={mutate}
    />
  );
};
export default InitializeDispenseFormFromRequest;

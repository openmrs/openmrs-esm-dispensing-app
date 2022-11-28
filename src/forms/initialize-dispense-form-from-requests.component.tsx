import React, { useEffect, useState } from "react";
import { usePrescriptionDetails } from "../medication-request/medication-request.resource";
import { useSession } from "@openmrs/esm-framework";
import { initiateMedicationDispenseBody } from "../medication-dispense/medication-dispense.resource";
import { MedicationDispense } from "../types";
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

  const [medicationDispenses, setMedicationDispenses] = useState(
    Array<MedicationDispense>
  );

  useEffect(() => {
    if (requests) {
      let dispenseMedications = initiateMedicationDispenseBody(
        requests,
        session
      );
      setMedicationDispenses(dispenseMedications);
    }
  }, []);

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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useSession,
  showToast,
  showNotification,
  useLayoutType,
  useConfig,
  usePatient,
} from "@openmrs/esm-framework";
import { useSWRConfig } from "swr";
import { Button, TextArea, FormLabel, DataTableSkeleton } from "@carbon/react";
import styles from "./dispense-form.scss";
import { closeOverlay } from "../hooks/useOverlay";
import { MedicationDispense } from "../types";
import {
  initiateMedicationDispenseBody,
  saveMedicationDispense,
  useOrderConfig,
} from "../medication-dispense/medication-dispense.resource";
import { useOrderDetails } from "../medication-request/medication-request.resource";
import MedicationDispenseReview from "../components/medication-dispense-review.component";

interface DispenseFormProps {
  patientUuid: string;
  encounterUuid: string;
}

const DispenseForm: React.FC<DispenseFormProps> = ({
  patientUuid,
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const { mutate } = useSWRConfig();
  const session = useSession();
  const [internalComments, setInternalComments] = useState("");
  const { medications, isError, isLoading } = useOrderDetails(encounterUuid);
  const { orderConfigObject } = useOrderConfig();

  // Keep track of medication dispense payload
  const [medicationDispenseRequests, setMedicationDispenseRequests] = useState(
    Array<MedicationDispense>
  );

  // Dosing Unit eg Tablets
  const [drugDosingUnits, setDrugDosingUnits] = useState([]);
  // Route eg Oral
  const [drugRoutes, setDrugRoutes] = useState([]);
  // Frequency eg Twice daily
  const [orderFrequencies, setOrderFrequencies] = useState([]);

  // Submit medication dispense form
  const handleSubmit = () => {
    const abortController = new AbortController();
    medicationDispenseRequests.map((dispenseRequest) => {
      saveMedicationDispense(dispenseRequest, abortController).then(
        ({ status }) => {
          if (status === 201 || status === 200) {
            closeOverlay;
            showToast({
              critical: true,
              kind: "success",
              description: t(
                "medicationListUpdated",
                "Medication dispense list has been updated."
              ),
              title: t(
                "medicationDispensed",
                "Medication successfully dispensed."
              ),
            });
          }
        },
        (error) => {
          showNotification({
            title: t("medicationDispenseError", "Error dispensing medication."),
            kind: "error",
            critical: true,
            description: error?.message,
          });
        }
      );
    });
  };

  useEffect(() => {
    if (medications) {
      let dispenseMedications = initiateMedicationDispenseBody(
        medications,
        session
      );
      setMedicationDispenseRequests(dispenseMedications);
    }
  }, []);

  useEffect(() => {
    if (orderConfigObject) {
      // sync drug route options order config
      const availableRoutes = drugRoutes.map((x) => x.id);
      const otherRouteOptions = [];
      orderConfigObject.drugRoutes.forEach(
        (x) =>
          availableRoutes.includes(x.uuid) ||
          otherRouteOptions.push({ id: x.uuid, text: x.display })
      );
      setDrugRoutes([...drugRoutes, ...otherRouteOptions]);

      // sync dosage.unit options with what's defined in the order config
      const availableDosingUnits = drugDosingUnits.map((x) => x.id);
      const otherDosingUnits = [];
      orderConfigObject.drugDosingUnits.forEach(
        (x) =>
          availableDosingUnits.includes(x.uuid) ||
          otherDosingUnits.push({ id: x.uuid, text: x.display })
      );
      setDrugDosingUnits([...drugDosingUnits, ...otherDosingUnits]);

      // sync order frequency options with order config
      const availableFrequencies = orderFrequencies.map((x) => x.id);
      const otherFrequencyOptions = [];
      orderConfigObject.orderFrequencies.forEach(
        (x) =>
          availableFrequencies.includes(x.uuid) ||
          otherFrequencyOptions.push({ id: x.uuid, text: x.display })
      );
      setOrderFrequencies([...orderFrequencies, ...otherFrequencyOptions]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderConfigObject]);

  return (
    <div className="">
      {isLoading && <DataTableSkeleton role="progressbar" />}
      <div className={styles.formWrapper}>
        <section className={styles.formGroup}>
          <span style={{ marginTop: "1rem" }}>1. {t("drug", "Drug")}</span>
          <FormLabel>
            {t(
              "drugHelpText",
              "You may edit the formulation and quantity dispensed here"
            )}
          </FormLabel>
          {medicationDispenseRequests &&
            medicationDispenseRequests.map((medicationDispense) => (
              <MedicationDispenseReview
                medicationDispense={medicationDispense}
                drugDosingUnits={drugDosingUnits}
                drugRoutes={drugRoutes}
                orderFrequencies={orderFrequencies}
              />
            ))}
        </section>
        <section className={styles.formGroup}>
          <span>2. {t("internalComments", "Internal comments")}</span>
          <TextArea
            id="dispensingNote"
            light={isTablet}
            labelText={t(
              "dispensingNoteText",
              "Add a note to the prescription history"
            )}
            placeholder={t(
              "dispensingNotePlaceholder",
              "Write any additional dispensing notes here"
            )}
            value={internalComments}
            onChange={(e) => setInternalComments(e.target.value)}
          />
        </section>
        <section className={styles.buttonGroup}>
          <Button onClick={() => closeOverlay} kind="secondary">
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={!medications} onClick={handleSubmit}>
            {t("dispensePrescription", "Dispense prescription")}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default DispenseForm;

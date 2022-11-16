import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useSession,
  showToast,
  showNotification,
  useLayoutType,
} from "@openmrs/esm-framework";
import { useSWRConfig } from "swr";
import { Button, FormLabel, DataTableSkeleton } from "@carbon/react";
import styles from "./dispense-form.scss";
import { closeOverlay } from "../hooks/useOverlay";
import { MedicationDispense } from "../types";
import {
  initiateMedicationDispenseBody,
  saveMedicationDispense,
  useOrderConfig,
} from "../medication-dispense/medication-dispense.resource";
import { usePrescriptionDetails } from "../medication-request/medication-request.resource";
import MedicationDispenseReview from "../components/medication-dispense-review.component";
import { getPrescriptionDetailsEndpoint } from "../utils";

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
  const session = useSession();
  const { requests, isError, isLoading } =
    usePrescriptionDetails(encounterUuid);
  const { orderConfigObject } = useOrderConfig();
  const { mutate } = useSWRConfig();

  // Keep track of medication dispense payload
  const [medicationDispenseRequests, setMedicationDispenseRequests] = useState(
    Array<MedicationDispense>
  );

  // Dosing Unit eg Tablets
  const [drugDosingUnits, setDrugDosingUnits] = useState([]);
  // Dispensing Unit eg Tablets
  const [drugDispensingUnits, setDrugDispensingUnits] = useState([]);
  // Route eg Oral
  const [drugRoutes, setDrugRoutes] = useState([]);
  // Frequency eg Twice daily
  const [orderFrequencies, setOrderFrequencies] = useState([]);

  // whether or note the form is valid and ready to submit
  const [isValid, setIsValid] = useState(false);

  // Submit medication dispense form
  const handleSubmit = () => {
    const abortController = new AbortController();
    medicationDispenseRequests.map((dispenseRequest) => {
      saveMedicationDispense(dispenseRequest, abortController).then(
        ({ status }) => {
          if (status === 201 || status === 200) {
            closeOverlay();
            mutate(getPrescriptionDetailsEndpoint(encounterUuid));
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

  // updates the medication dispense referenced by the specified index, this function passed on to the card to allow updating a specific element
  const updateMedicationDispenseRequest = (
    medicationDispenseRequest: MedicationDispense,
    index: number
  ) => {
    setMedicationDispenseRequests(
      medicationDispenseRequests.map((element: MedicationDispense, i) => {
        if (index === i) {
          return medicationDispenseRequest;
        } else {
          return element;
        }
      })
    );
  };

  const checkIsValid = () => {
    if (medicationDispenseRequests) {
      setIsValid(
        medicationDispenseRequests.every((request) => {
          return (
            request.quantity?.value &&
            request.quantity?.code &&
            request.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity.value &&
            request.dosageInstruction[0]?.doseAndRate[0]?.doseQuantity.code &&
            request.dosageInstruction[0]?.route.coding[0].code &&
            request.dosageInstruction[0]?.timing.code.coding[0].code
          );
        })
      );
    } else {
      setIsValid(false);
    }
  };

  useEffect(checkIsValid, [medicationDispenseRequests]);

  useEffect(() => {
    if (requests) {
      let dispenseMedications = initiateMedicationDispenseBody(
        requests,
        session
      );
      setMedicationDispenseRequests(dispenseMedications);
      checkIsValid();
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

      // sync dispensing unit options with what's defined in the order config
      const availableDispensingUnits = drugDispensingUnits.map((x) => x.id);
      const otherDispensingUnits = [];
      orderConfigObject.drugDispensingUnits.forEach(
        (x) =>
          availableDispensingUnits.includes(x.uuid) ||
          otherDispensingUnits.push({ id: x.uuid, text: x.display })
      );
      setDrugDispensingUnits([...drugDispensingUnits, ...otherDispensingUnits]);

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
            medicationDispenseRequests.map((medicationDispense, index) => (
              <MedicationDispenseReview
                medicationDispense={medicationDispense}
                updateMedicationDispense={updateMedicationDispenseRequest}
                index={index}
                drugDosingUnits={drugDosingUnits}
                drugDispensingUnits={drugDispensingUnits}
                drugRoutes={drugRoutes}
                orderFrequencies={orderFrequencies}
              />
            ))}
        </section>
        {/*    <section className={styles.formGroup}>
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
        </section>*/}
        <section className={styles.buttonGroup}>
          <Button onClick={() => closeOverlay()} kind="secondary">
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            {t("dispensePrescription", "Dispense prescription")}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default DispenseForm;

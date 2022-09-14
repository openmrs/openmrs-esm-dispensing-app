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
import {
  Button,
  Select,
  SelectItem,
  TextArea,
  TimePickerSelect,
  TimePicker,
  ContentSwitcher,
  FormGroup,
  RadioButton,
  Toggle,
  DataTableSkeleton,
} from "@carbon/react";

import styles from "./dispense-form.scss";
import { closeOverlay } from "../hooks/useOverlay";
import { DispensePayload } from "../types";
import { saveMedicationDispense } from "../medication-dispense/medication-dispense.resource";
import { useOrderDetails } from "../medication-request/medication-request.resource";
import MedicationCard from "../components/medication-card.component";

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
  const [drugs, setDrugs] = useState([]);
  const [dispensingNotes, setDispensingNotes] = useState("");
  const { medications, isError, isLoading } = useOrderDetails(encounterUuid);

  const [medicationRequests, setMedicationRequests] = useState();
  const [medicationRequest, setMedicationRequest] = useState({});

  const [quantity, setQuantity] = useState(0);
  const [dose, setDose] = useState(0);
  const [doseUnit, setDoseUnit] = useState("");
  const [route, setRoute] = useState("");
  const [frequency, setFrequency] = useState("");
  const [patientInstructions, setPatientInstructions] = useState("");

  const handleSubmit = () => {
    const medicationDispensePayload: DispensePayload = {
      drugs,
      encounterUuid: encounterUuid,
      patientUuid: patientUuid,
      comments: dispensingNotes,
    };

    const abortController = new AbortController();
    saveMedicationDispense(medicationDispensePayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          closeOverlay();
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
  };

  useEffect(() => {
    if (medications) {
      setMedicationRequests(medications);
    }
  }, [medications]);

  return (
    <div className="">
      {isLoading && <DataTableSkeleton role="progressbar" />}
      <div className={styles.formWrapper}>
        <section className={styles.formGroup}>
          <span style={{ marginTop: "1rem" }}>1. {t("drug", "Drug")}</span>
          {medications &&
            medications.map((medication) => (
              <div className="reviewContainer">
                <MedicationCard medication={medication} />
                Quantity - number Dose - dose unit - route (dropdown) frequency
                - dropdown patient instructions - text area
                {/* <Select
                  id="provider"
                  labelText={t('provider', 'Provider')}
                  light={isTablet}
                  // onChange={(event) => setSelectedProvider(event.target.value)}
                  value={selectedProvider}>
                  {!selectedProvider ? <SelectItem text={t('chooseProvider', 'Choose provider')} value="" /> : null}
                  {providers?.length > 0 &&
                    providers.map((provider) => (
                      <SelectItem key={provider.uuid} text={provider.display} value={provider.uuid}>
                        {provider.display}
                      </SelectItem>
                    ))}
                </Select> */}
                <TextArea
                  labelText={t("patientInstructions", "Patient instructions")}
                  value={medication.dosageInstructions}
                  maxLength={65535}
                  onChange={(e) =>
                    setMedicationRequest({
                      ...medicationRequest,
                      freeTextDosage: e.target.value,
                    })
                  }
                />
              </div>
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
            onChange={(event) => setDispensingNotes(event.target.value)}
          />
        </section>
        <section className={styles.buttonGroup}>
          <Button onClick={() => closeOverlay()} kind="secondary">
            {t("cancel", "Cancel")}
          </Button>
          <Button disabled={!drugs} onClick={handleSubmit}>
            {t("dispensePrescription", "Dispense prescription")}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default DispenseForm;

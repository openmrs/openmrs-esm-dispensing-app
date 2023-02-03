import React, { useEffect, useState } from "react";
import { CommonConfigProps, Medication, MedicationDispense } from "../types";
import MedicationCard from "./medication-card.component";
import { TextArea, ComboBox, Dropdown, NumberInput } from "@carbon/react";
import { useLayoutType } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import {
  getConceptCodingUuid,
  getMedicationReferenceOrCodeableConcept,
  getOpenMRSMedicineDrugName,
} from "../utils";
import styles from "./medication-dispense-review.scss";
import {
  useMedicationCodeableConcept,
  useMedicationFormulations,
} from "../medication/medication.resource";
import { useMedicationRequest } from "../medication-request/medication-request.resource";

interface MedicationDispenseReviewProps {
  medicationDispense: MedicationDispense;
  index: number;
  updateMedicationDispense: Function;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  drugRoutes: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
  substitutionReasons: Array<CommonConfigProps>;
  substitutionTypes: Array<CommonConfigProps>;
}

const MedicationDispenseReview: React.FC<MedicationDispenseReviewProps> = ({
  medicationDispense,
  index,
  updateMedicationDispense,
  drugDosingUnits,
  drugDispensingUnits,
  drugRoutes,
  orderFrequencies,
  substitutionReasons,
  substitutionTypes,
}) => {
  const { t } = useTranslation();
  const [isEditingFormulation, setIsEditingFormulation] = useState(false);
  const [isSubstitution, setIsSubstitution] = useState(false);
  const isTablet = useLayoutType() === "tablet";

  // if this an order for a drug by concept, but not a particular formulation, we already have access to concept uuid
  const existingMedicationCodeableConceptUuid = getConceptCodingUuid(
    getMedicationReferenceOrCodeableConcept(medicationDispense)
      ?.medicationCodeableConcept?.coding
  );
  // otherwise we need to fetch the medication details to get the codeable concept
  // (note that React Hooks should not be called conditionally, so we *always* call this hook, but it will return null if existingMedicationCodeableConcept is defined
  const { medicationCodeableConceptUuid } = useMedicationCodeableConcept(
    existingMedicationCodeableConceptUuid,
    getMedicationReferenceOrCodeableConcept(medicationDispense)
      .medicationReference?.reference
  );
  // get the formulations
  const { medicationFormulations } = useMedicationFormulations(
    existingMedicationCodeableConceptUuid
      ? existingMedicationCodeableConceptUuid
      : medicationCodeableConceptUuid
      ? medicationCodeableConceptUuid
      : null
  );

  // get the medication request associated with this dispense event
  // (we fetch this so that we can use it below to determine if the formulation dispensed varies from what was
  // ordered; it's slightly inefficient/awkward to fetch it from the server here because we *have* fetched it earlier,
  // it just seems cleaner to fetch it here rather than to make sure we pass it down through various components; and
  // SWR should handle caching properly)
  const { medicationRequest } = useMedicationRequest(
    medicationDispense.authorizingPrescription
      ? medicationDispense.authorizingPrescription[0].reference
      : null
  );

  // check to see if the current dispense would be a substitution, and update accordingly
  useEffect(() => {
    if (
      medicationRequest?.medicationReference?.reference &&
      medicationDispense?.medicationReference?.reference &&
      medicationRequest.medicationReference.reference !=
        medicationDispense.medicationReference.reference
    ) {
      setIsSubstitution(true);
      updateMedicationDispense(
        {
          ...medicationDispense,
          substitution: {
            ...medicationDispense.substitution,
            wasSubstituted: true,
          },
        },
        index
      );
    } else {
      setIsSubstitution(false);
      updateMedicationDispense(
        {
          ...medicationDispense,
          substitution: {
            wasSubstituted: false,
            reason: [
              {
                coding: [{ code: null }],
              },
            ],
            type: { coding: [{ code: null }] },
          },
        },
        index
      );
    }
  }, [
    medicationDispense.medicationReference,
    medicationRequest?.medicationReference,
  ]);

  return (
    <div className={styles.medicationDispenseReviewContainer}>
      {!isEditingFormulation ? (
        <MedicationCard
          medication={getMedicationReferenceOrCodeableConcept(
            medicationDispense
          )}
          editAction={() => setIsEditingFormulation(true)}
        />
      ) : (
        <Dropdown
          id="medicationFormulation"
          light={isTablet}
          items={medicationFormulations}
          itemToString={(item: Medication) => getOpenMRSMedicineDrugName(item)}
          initialSelectedItem={{
            ...medicationFormulations?.find(
              (formulation) =>
                formulation.id ===
                medicationDispense.medicationReference?.reference.split("/")[1]
            ),
          }}
          onChange={({ selectedItem }) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                medicationCodeableConcept: undefined,
                medicationReference: {
                  reference: "Medication/" + selectedItem?.id,
                  display: getOpenMRSMedicineDrugName(selectedItem),
                },
              },
              index
            );
            setIsEditingFormulation(false);
          }}
          required
        />
      )}

      {isSubstitution && (
        <div className={styles.dispenseDetailsContainer}>
          <ComboBox
            className={styles.substitutionType}
            id="substitutionType"
            light={isTablet}
            items={substitutionTypes}
            titleText={t("substitutionType", "Type of substitution")}
            itemToString={(item) => item?.text}
            initialSelectedItem={{
              id: medicationDispense.substitution.type?.coding[0]?.code,
              text: medicationDispense.substitution.type?.text,
            }}
            onChange={({ selectedItem }) => {
              updateMedicationDispense(
                {
                  ...medicationDispense,
                  substitution: {
                    ...medicationDispense.substitution,
                    type: {
                      coding: [
                        {
                          code: selectedItem?.id,
                        },
                      ],
                    },
                  },
                },
                index
              );
            }}
          />
        </div>
      )}

      {isSubstitution && (
        <div className={styles.dispenseDetailsContainer}>
          <ComboBox
            className={styles.substitutionReason}
            id="substitutionReason"
            light={isTablet}
            items={substitutionReasons}
            titleText={t("substitutionReason", "Reason for substitution")}
            itemToString={(item) => item?.text}
            initialSelectedItem={{
              id: medicationDispense.substitution.reason[0]?.coding[0]?.code,
              text: medicationDispense.substitution.reason[0]?.text,
            }}
            onChange={({ selectedItem }) => {
              updateMedicationDispense(
                {
                  ...medicationDispense,
                  substitution: {
                    ...medicationDispense.substitution,
                    reason: [
                      {
                        coding: [
                          {
                            code: selectedItem?.id,
                          },
                        ],
                      },
                    ],
                  },
                },
                index
              );
            }}
          />
        </div>
      )}

      <div className={styles.dispenseDetailsContainer}>
        <NumberInput
          allowEmpty={false}
          hideSteppers={true}
          id="quantity"
          invalidText={t("numberIsNotValid", "Number is not valid")}
          label={t("quantity", "Quantity")}
          min={0}
          value={medicationDispense.quantity.value}
          onChange={(e) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                quantity: {
                  ...medicationDispense.quantity,
                  value: e.target.value,
                },
              },
              index
            );
          }}
        />

        <ComboBox
          id="quantityUnits"
          light={isTablet}
          items={drugDispensingUnits}
          titleText={t("drugDispensingUnit", "Dispensing unit")}
          itemToString={(item) => item?.text}
          initialSelectedItem={{
            id: medicationDispense.quantity.code,
            text: medicationDispense.quantity.unit,
          }}
          onChange={({ selectedItem }) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                // note that we specifically recreate doesQuantity to overwrite any unit or system properties that may have been set
                quantity: {
                  value: medicationDispense.quantity.value,
                  code: selectedItem?.id,
                },
              },
              index
            );
          }}
          required
        />
      </div>

      <div className={styles.dispenseDetailsContainer}>
        <NumberInput
          allowEmpty={false}
          hideSteppers={true}
          id="dosingQuanity"
          light={isTablet}
          invalidText={t("numberIsNotValid", "Number is not valid")}
          min={0}
          label={t("dose", "Dose")}
          value={
            medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity
              .value
          }
          onChange={(e) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                dosageInstruction: [
                  {
                    ...medicationDispense.dosageInstruction[0],
                    doseAndRate: [
                      {
                        ...medicationDispense.dosageInstruction[0]
                          .doseAndRate[0],
                        doseQuantity: {
                          ...medicationDispense.dosageInstruction[0]
                            .doseAndRate[0].doseQuantity,
                          value: e.target.value,
                        },
                      },
                    ],
                  },
                ],
              },
              index
            );
          }}
        />

        <ComboBox
          id="dosingUnits"
          light={isTablet}
          items={drugDosingUnits}
          titleText={t("doseUnit", "Dose unit")}
          itemToString={(item) => item?.text}
          initialSelectedItem={{
            id: medicationDispense.dosageInstruction[0].doseAndRate[0]
              .doseQuantity?.code,
            text: medicationDispense.dosageInstruction[0].doseAndRate[0]
              .doseQuantity?.unit,
          }}
          onChange={({ selectedItem }) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                dosageInstruction: [
                  {
                    ...medicationDispense.dosageInstruction[0],
                    doseAndRate: [
                      {
                        doseQuantity: {
                          // note that we specifically recreate doesQuantity to overwrite any unit or system properties that may have been set
                          value:
                            medicationDispense.dosageInstruction[0]
                              .doseAndRate[0].doseQuantity?.value,
                          code: selectedItem?.id,
                        },
                      },
                    ],
                  },
                ],
              },
              index
            );
          }}
          required
        />

        <ComboBox
          id="editRoute"
          light={isTablet}
          items={drugRoutes}
          initialSelectedItem={{
            id: medicationDispense.dosageInstruction[0].route?.coding[0]?.code,
            text: medicationDispense.dosageInstruction[0].route?.text,
          }}
          titleText={t("route", "Route")}
          itemToString={(item) => item?.text}
          onChange={({ selectedItem }) => {
            updateMedicationDispense(
              {
                ...medicationDispense,
                dosageInstruction: [
                  {
                    ...medicationDispense.dosageInstruction[0],
                    route: {
                      coding: [
                        {
                          code: selectedItem?.id,
                        },
                      ],
                    },
                  },
                ],
              },
              index
            );
          }}
          required
        />
      </div>

      <ComboBox
        id="frequency"
        light={isTablet}
        items={orderFrequencies}
        initialSelectedItem={{
          id: medicationDispense.dosageInstruction[0].timing?.code?.coding[0]
            ?.code,
          text: medicationDispense.dosageInstruction[0].timing?.code?.text,
        }}
        titleText={t("frequency", "Frequency")}
        itemToString={(item) => item?.text}
        onChange={({ selectedItem }) => {
          updateMedicationDispense(
            {
              ...medicationDispense,
              dosageInstruction: [
                {
                  ...medicationDispense.dosageInstruction[0],
                  timing: {
                    ...medicationDispense.dosageInstruction[0].timing,
                    code: {
                      coding: [
                        {
                          code: selectedItem?.id,
                        },
                      ],
                    },
                  },
                },
              ],
            },
            index
          );
        }}
        required
      />

      <TextArea
        labelText={t("patientInstructions", "Patient instructions")}
        value={medicationDispense.dosageInstruction[0].text}
        maxLength={65535}
        onChange={(e) => {
          updateMedicationDispense(
            {
              ...medicationDispense,
              dosageInstruction: [
                {
                  ...medicationDispense.dosageInstruction[0],
                  text: e.target.value,
                },
              ],
            },
            index
          );
        }}
      />
    </div>
  );
};

export default MedicationDispenseReview;

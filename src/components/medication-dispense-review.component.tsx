import React from "react";
import { CommonConfigProps, MedicationDispense } from "../types";
import MedicationCard from "./medication-card-component";
import { TextArea, Column, ComboBox, Grid, NumberInput } from "@carbon/react";
import { useLayoutType } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { getMedication } from "../utils";
import styles from "./medication-dispense-review.scss";

interface MedicationDispenseReviewProps {
  medicationDispense: MedicationDispense;
  index: number;
  updateMedicationDispense: Function;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  drugRoutes: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

const MedicationDispenseReview: React.FC<MedicationDispenseReviewProps> = ({
  medicationDispense,
  index,
  updateMedicationDispense,
  drugDosingUnits,
  drugDispensingUnits,
  drugRoutes,
  orderFrequencies,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  return (
    <div className={styles.medicationDispenseReviewContainer}>
      <MedicationCard medication={getMedication(medicationDispense)} />

      <Grid className={styles.noPadding}>
        <Column lg={5}>
          <NumberInput
            allowEmpty={false}
            hideSteppers={true}
            id="quantity"
            invalidText="Number is not valid"
            label="Quantity"
            min={0}
            value={medicationDispense.quantity.value}
            onChange={(e) => {
              updateMedicationDispense(
                {
                  ...medicationDispense,
                  quantity: {
                    value: e.target.value,
                    unit: medicationDispense.quantity.unit,
                    code: medicationDispense.quantity.code,
                  },
                },
                index
              );
            }}
          />
        </Column>
        <Column lg={11}>
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
        </Column>
      </Grid>

      <Grid>
        <Column lg={5}>
          <NumberInput
            allowEmpty={false}
            hideSteppers={true}
            id="dosingQuanity"
            light={isTablet}
            invalidText="Number is not valid"
            min={0}
            label="Dose"
            value={
              medicationDispense.dosageInstruction[0].doseAndRate[0]
                .doseQuantity.value
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
                            value: e.target.value,
                            unit: medicationDispense.dosageInstruction[0]
                              .doseAndRate[0].doseQuantity.unit,
                            code: medicationDispense.dosageInstruction[0]
                              .doseAndRate[0].doseQuantity.code,
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
        </Column>
        <Column lg={6}>
          <ComboBox
            id="dosingUnits"
            light={isTablet}
            items={drugDosingUnits}
            titleText={t("doseUnit", "Dose unit")}
            itemToString={(item) => item?.text}
            initialSelectedItem={{
              id: medicationDispense.dosageInstruction[0].doseAndRate
                ? medicationDispense.dosageInstruction[0].doseAndRate[0]
                    .doseQuantity?.code
                : null,
              text: medicationDispense.dosageInstruction[0].doseAndRate
                ? medicationDispense.dosageInstruction[0].doseAndRate[0]
                    .doseQuantity?.unit
                : null,
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
        </Column>
        <Column lg={5}>
          <ComboBox
            id="editRoute"
            light={isTablet}
            items={drugRoutes}
            initialSelectedItem={{
              id: medicationDispense.dosageInstruction[0].route?.coding[0]
                ?.code,
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
        </Column>
      </Grid>

      <Grid>
        <Column lg={16}>
          <ComboBox
            id="frequency"
            light={isTablet}
            items={orderFrequencies}
            initialSelectedItem={{
              id: medicationDispense.dosageInstruction[0].timing.code?.coding[0]
                ?.code,
              text: medicationDispense.dosageInstruction[0].timing.code?.text,
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
        </Column>
      </Grid>

      <Grid>
        <Column lg={16}>
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
        </Column>
      </Grid>
    </div>
  );
};

export default MedicationDispenseReview;

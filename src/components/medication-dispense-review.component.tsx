import React, { useState } from "react";
import { CommonConfigProps, MedicationDispense } from "../types";
import DispenseCard from "../components/dispense-card.component";
import {
  Select,
  SelectItem,
  TextArea,
  FormGroup,
  RadioButton,
  Toggle,
  FormLabel,
  DataTableSkeleton,
  Column,
  ComboBox,
  Grid,
  NumberInput,
} from "@carbon/react";
import styles from "./medication-dispense-review.scss";
import { useLayoutType } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

interface MedicationDispenseReviewProps {
  medicationDispense: MedicationDispense;
  drugDosingUnits: Array<CommonConfigProps>;
  drugRoutes: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

const MedicationDispenseReview: React.FC<MedicationDispenseReviewProps> = ({
  medicationDispense,
  drugDosingUnits,
  drugRoutes,
  orderFrequencies,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const [dispenseRequest, setDispenseRequest] = useState(medicationDispense);

  return (
    <div className={styles.reviewContainer}>
      <DispenseCard medication={medicationDispense} />

      <NumberInput
        className="some-class"
        id="tj-input"
        invalidText="Number is not valid"
        label="Quantity"
        max={100}
        min={0}
        value={dispenseRequest.quantity.value}
        onChange={(e) => {
          setDispenseRequest({
            ...dispenseRequest,
            quantity: {
              value: e.target.value,
              unit: dispenseRequest.quantity.unit,
              code: dispenseRequest.quantity.code,
            },
          });
        }}
        size="md"
        step={1}
        warnText="A high threshold may impact performance"
      />

      <Grid className={styles.gridRow}>
        <Column md={4}>
          <ComboBox
            id="dosingUnits"
            light={isTablet}
            items={drugDosingUnits}
            titleText={t("doseUnit", "Dose unit")}
            itemToString={(item) => item?.text}
            selectedItem={{
              id: dispenseRequest.dosageInstruction[0].doseAndRate
                ? dispenseRequest.dosageInstruction[0].doseAndRate[0]
                    .doseQuantity?.code
                : null,
              text: dispenseRequest.dosageInstruction[0].doseAndRate
                ? dispenseRequest.dosageInstruction[0].doseAndRate[0]
                    .doseQuantity?.unit
                : null,
            }}
            onChange={({ selectedItem }) => {
              setDispenseRequest({
                ...dispenseRequest,
                dosageInstruction: [
                  {
                    ...dispenseRequest.dosageInstruction[0],
                    doseAndRate: [
                      {
                        ...dispenseRequest.dosageInstruction[0].doseAndRate[0],
                        doseQuantity: {
                          value:
                            dispenseRequest.dosageInstruction[0].doseAndRate[0]
                              .doseQuantity?.value,
                          unit: selectedItem.text,
                          code: selectedItem.id,
                        },
                      },
                    ],
                  },
                ],
              });
            }}
            required
          />
        </Column>
        <Column md={8} className={styles.lastGridCell}>
          <ComboBox
            id="editRoute"
            light={isTablet}
            items={drugRoutes}
            selectedItem={{
              id: dispenseRequest.dosageInstruction[0].route?.coding[0]?.code,
              text: dispenseRequest.dosageInstruction[0].route?.text,
            }}
            titleText={t("route", "Route")}
            itemToString={(item) => item?.text}
            onChange={({ selectedItem }) => {
              setDispenseRequest({
                ...dispenseRequest,
                dosageInstruction: [
                  {
                    ...dispenseRequest.dosageInstruction[0],
                    route: {
                      ...dispenseRequest.dosageInstruction[0].route,
                      coding: [
                        {
                          code: selectedItem.id,
                          display: selectedItem.text,
                        },
                      ],
                    },
                  },
                ],
              });
            }}
            required
          />
        </Column>
      </Grid>

      <div className={styles.row}>
        <Column md={8}>
          <ComboBox
            id="frequency"
            light={isTablet}
            items={orderFrequencies}
            selectedItem={{
              id: dispenseRequest.dosageInstruction[0].timing.code?.coding[0]
                ?.code,
              text: dispenseRequest.dosageInstruction[0].timing.code?.text,
            }}
            titleText={t("frequency", "Frequency")}
            itemToString={(item) => item?.text}
            onChange={({ selectedItem }) => {
              setDispenseRequest({
                ...dispenseRequest,
                dosageInstruction: [
                  {
                    ...dispenseRequest.dosageInstruction[0],
                    timing: {
                      ...dispenseRequest.dosageInstruction[0].timing,
                      code: {
                        ...dispenseRequest.dosageInstruction[0].timing.code,
                        coding: [
                          {
                            code: selectedItem.id,
                            display: selectedItem.text,
                          },
                        ],
                      },
                    },
                  },
                ],
              });
            }}
            required
          />
        </Column>
      </div>

      <TextArea
        labelText={t("patientInstructions", "Patient instructions")}
        value={dispenseRequest.dosageInstruction[0].text}
        maxLength={65535}
        onChange={(e) => {
          setDispenseRequest({
            ...dispenseRequest,
            dosageInstruction: [
              {
                ...dispenseRequest.dosageInstruction[0],
                text: e.target.value,
              },
            ],
          });
        }}
      />
    </div>
  );
};

export default MedicationDispenseReview;

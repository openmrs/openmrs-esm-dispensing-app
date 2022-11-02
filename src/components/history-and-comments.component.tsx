import React from "react";
import { DataTableSkeleton, Button, Form, TextInput } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { parseDate, formatDatetime } from "@openmrs/esm-framework";
import styles from "./history-and-comments.scss";
import { useOrderDetails } from "../medication-request/medication-request.resource";
import MedicationCard from "./medication-card.component";

const HistoryAndComments: React.FC<{ encounterUuid: string }> = ({
  encounterUuid,
}) => {
  const { t } = useTranslation();
  const { requests, dispenses, prescriptionDate, isError, isLoading } =
    useOrderDetails(encounterUuid);

  // TODO: assumption is dispenses always are after requqests?
  return (
    <div className={styles.historyAndCommentsContainer}>
      {isLoading && <DataTableSkeleton role="progressbar" />}
      {isError && <p>Error</p>}
      {dispenses &&
        dispenses.map((medication) => {
          return (
            <div>
              <h5
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                tbd {t("dispensedMedication", "dispensed medication")}{" "}
                {formatDatetime(parseDate(medication.whenHandedOver))}
              </h5>
              <MedicationCard medication={medication} />
            </div>
          );
        })}
      {requests &&
        requests.map((medication) => {
          return (
            <div>
              <h5
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {medication.requester.display}{" "}
                {t("orderedMedication ", "ordered medication")} -{" "}
                {formatDatetime(prescriptionDate)}
              </h5>
              <MedicationCard medication={medication} />
            </div>
          );
        })}

      {/* <Form>
        <TextInput
          id="test2"
          invalidText="Invalid error message."
          placeholder="Add note"
          labelText={""}
        />
        <Button kind="primary" tabIndex={0} type="submit">
          {t("post", "Post")}
        </Button>
        <Button
          kind="ghost"
          renderIcon={(props) => <OverflowMenuVertical size={16} />}
        >
          {t("addItem", "Add item")}
        </Button>
      </Form>*/}
    </div>
  );
};

export default HistoryAndComments;

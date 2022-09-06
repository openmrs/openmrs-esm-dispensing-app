import React from "react";
import { useTranslation } from "react-i18next";
import { useLayoutType } from "@openmrs/esm-framework";
import { useSWRConfig } from "swr";
import { Form } from "@carbon/react";
import styles from "./dispense-form.scss";

interface DispenseFormProps {
  patientUuid: string;
  encounterUuid?: string;
}

// DefaultWorkspaceProps

const DispenseForm: React.FC<DispenseFormProps> = ({
  patientUuid,
  // closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const { mutate } = useSWRConfig();

  return (
    <Form className={styles.formContainer}>
      <p>Form content</p>
    </Form>
  );
};

export default DispenseForm;

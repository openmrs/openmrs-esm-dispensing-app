import React from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { dispensingBasePath } from "./constants";

export default function DispensingLink() {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to={dispensingBasePath}>
      {t("dispensing", "Dispensing")}
    </ConfigurableLink>
  );
}

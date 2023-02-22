export const spaRoot = window["getOpenmrsSpaBase"];
export const basePath = "/dispensing";
export const spaBasePath = `${window.spaBase}${basePath}`;

// defined in FHIR 2 module
export const OPENMRS_FHIR_PREFIX = "http://fhir.openmrs.org";
export const OPENMRS_FHIR_EXT_PREFIX = OPENMRS_FHIR_PREFIX + "/ext";
export const OPENMRS_FHIR_EXT_MEDICINE = OPENMRS_FHIR_EXT_PREFIX + "/medicine";

export const PRIVILEGE_CREATE_DISPENSE = "o3.dispensing-app.dispense.create";
export const PRIVILEGE_CREATE_DISPENSE_MODIFY_DETAILS =
  "o3.dispense-app.dispense.create.modifyDetails";
export const PRIVILEGE_EDIT_DISPENSE = "o3.dispensing-app.dispense.edit";
export const PRIVILEGE_DELETE_DISPENSE = "o3.dispensing-app.dispense.delete";
export const PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY =
  "o3.dispensing.delete.thisProviderOnly";

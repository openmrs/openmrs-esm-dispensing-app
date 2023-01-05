export const spaRoot = window["getOpenmrsSpaBase"];
export const basePath = "/dispensing";
export const spaBasePath = `${window.spaBase}${basePath}`;

// defined in FHIR 2 module
export const OPENMRS_FHIR_PREFIX = "http://fhir.openmrs.org";
export const OPENMRS_FHIR_EXT_PREFIX = OPENMRS_FHIR_PREFIX + "/ext";
export const OPENMRS_FHIR_EXT_MEDICINE = OPENMRS_FHIR_EXT_PREFIX + "/medicine";

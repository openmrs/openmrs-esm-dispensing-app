export const spaRoot = window['getOpenmrsSpaBase'];
export const basePath = '/dispensing';
export const spaBasePath = `${window.spaBase}${basePath}`;

// defined in FHIR 2 module
export const OPENMRS_FHIR_PREFIX = 'http://fhir.openmrs.org';
export const OPENMRS_FHIR_EXT_PREFIX = OPENMRS_FHIR_PREFIX + '/ext';
export const OPENMRS_FHIR_EXT_MEDICINE = OPENMRS_FHIR_EXT_PREFIX + '/medicine';
export const OPENMRS_FHIR_EXT_DISPENSE_RECORDED = OPENMRS_FHIR_EXT_PREFIX + '/medicationdispense/recorded';
export const OPENMRS_FHIR_EXT_REQUEST_FULFILLER_STATUS = OPENMRS_FHIR_EXT_PREFIX + '/medicationrequest/fulfillerstatus';

export const PRIVILEGE_CREATE_DISPENSE = 'Task: dispensing.create.dispense';
export const PRIVILEGE_CREATE_DISPENSE_MODIFY_DETAILS = 'Task: dispensing.create.dispense.allowSubstitutions';
export const PRIVILEGE_EDIT_DISPENSE = 'Task: dispensing.edit.dispense';
export const PRIVILEGE_DELETE_DISPENSE = 'Task: dispensing.delete.dispense';
export const PRIVILEGE_DELETE_DISPENSE_THIS_PROVIDER_ONLY = 'Task: dispensing.delete.dispense.ifCreator';

export const JSON_MERGE_PATH_MIME_TYPE = 'application/merge-patch+json';

export const PRESCRIPTIONS_TABLE_ENDPOINT = 'Encounter?_query=encountersWithMedicationRequests';

export const PRESCRIPTION_DETAILS_ENDPOINT = 'MedicationRequest';

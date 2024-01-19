import { OpenmrsResource } from "@openmrs/esm-framework";

export interface AllergyIntolerance {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  clinicalStatus: {
    coding: [
      {
        system: string;
        code: string;
        display: string;
      }
    ];
    text: string;
  };
  verificationStatus: {
    coding: [
      {
        system: string;
        code: string;
        display: string;
      }
    ];
    text: string;
  };
  type: string;
  category: Array<string>;
  criticality: string;
  code: {
    coding: [
      {
        code: string;
        display: string;
      }
    ];
    text: string;
  };
  patient: {
    reference: string;
    type: string;
    display: string;
  };
  recordedDate: string;
  recorder: {
    reference: string;
    type: string;
    display: string;
  };
  reaction: [
    {
      substance: {
        coding: [
          {
            code: string;
            display: string;
          }
        ];
        text: string;
      };
      manifestation: [
        {
          coding: [
            {
              code: string;
              display: string;
            }
          ];
          text: string;
        }
      ];
      severity: string;
    }
  ];
}

export interface AllergyIntoleranceResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: AllergyIntolerance;
  }>;
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}

export interface CodeableConcept {
  coding: Coding[];
  text?: string;
}

export interface Coding {
  system?: string;
  code: string;
  display?: string;
}
export interface CommonConfigProps {
  uuid: string;
  display: string;
}

export interface DosageInstruction {
  text?: string;
  timing: {
    repeat?: {
      duration: number;
      durationUnit: string;
    };
    code: {
      coding: Array<Coding>;
      text?: string;
    };
  };
  asNeededBoolean: boolean;
  route: {
    coding: Array<Coding>;
    text?: string;
  };
  doseAndRate: Array<{
    doseQuantity: Quantity;
  }>;
}

export interface Drug {
  uuid: string;
  name: string;
  strength: string;
  concept: OpenmrsResource;
  dosageForm: OpenmrsResource;
}

// add more properties, or fine just to keep the ones we are using? is there a global definition of this resource?
export interface Encounter {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  period?: {
    start: string;
  };
  subject?: {
    reference: string;
    display: string;
  };
  location?: [{ location: Reference }];
}

export interface EncounterResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: Encounter | MedicationRequest | MedicationDispense;
  }>;
}

export interface Extension {
  url: string;
  valueDateTime?: string;
  valueCode?: MedicationRequestFulfillerStatus; // add other possibilties once we start using other extensions
}

export interface LocationResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<any>; // TODO: type this out better?
}

export interface Medication {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  extension: [
    {
      url: string;
      extension: [
        {
          url: string;
          valueString: string;
        }
      ];
    }
  ];
  code: {
    coding: Coding[];
    text: string;
  };
  status: string;
}

export interface MedicationDispense {
  resourceType: string;
  id?: string;
  meta?: {
    lastUpdated: string;
  };
  extension?: Array<Extension>;
  status: MedicationDispenseStatus;
  statusReasonCodeableConcept?: CodeableConcept;
  authorizingPrescription?: [
    {
      reference: string;
      type: string;
    }
  ];
  medicationReference: {
    reference: string;
    type?: string;
    display?: string;
  };
  medicationCodeableConcept?: {
    coding: Coding[];
    text: string;
  };
  subject: {
    reference: string;
    type?: string;
    display?: string;
  };
  performer: Array<{
    actor: {
      reference: string;
      type?: string;
      identifier?: {
        value?: string;
      };
      display?: string;
    };
  }>;
  location: Reference;
  type?: CodeableConcept;
  quantity?: Quantity;
  whenPrepared?: any;
  whenHandedOver?: any;
  dosageInstruction?: Array<DosageInstruction>;
  substitution?: {
    wasSubstituted: boolean;
    reason?: CodeableConcept[];
    type?: CodeableConcept;
  };
}

export enum MedicationDispenseStatus {
  //in_progress = "in-progress",  NOT YET IMPLEMENTED
  on_hold = "on-hold",
  completed = "completed",
  declined = "declined",
}

export interface MedicationFormulationsResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: Medication;
  }>;
}

export interface MedicationRequest {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  extension?: Array<Extension>;
  status: MedicationRequestStatus;
  intent: string;
  priority: string;
  medicationReference: {
    reference: string;
    type?: string;
    display?: string;
  };
  medicationCodeableConcept?: {
    coding: Coding[];
    text: string;
  };
  subject: {
    reference: string;
    type?: string;
    display?: string;
  };
  encounter: {
    reference: string;
    type: string;
  };
  requester: {
    reference: string;
    type: string;
    identifier: {
      value: string;
    };
    display: string;
  };
  dosageInstruction: Array<DosageInstruction>;
  dispenseRequest: {
    numberOfRepeatsAllowed: number;
    quantity: Quantity;
    validityPeriod: {
      start: string;
    };
  };
}

export interface MedicationRequestResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: MedicationRequest | MedicationDispense;
  }>;
}

export enum MedicationRequestStatus {
  active = "active",
  cancelled = "cancelled",
  completed = "completed",
  expired = "expired",
}

/**
 * These fulfiller statuses are an OpenMRS defined status (as opposed to FHIR) that we define as upper-case,
 * hence the case difference from the other statuses
 */
export enum MedicationRequestFulfillerStatus {
  on_hold = "ON_HOLD",
  declined = "DECLINED",
  completed = "COMPLETED",
}

/**
 * Within the UI, the "status" of a request we want to display to the pharmacist is
 * a combination of the status and fulfiller status; this is the actual status we want to display to the pharmacist (see util method
 * computeMedicationRequestCombinedStatus)
 */
export enum MedicationRequestCombinedStatus {
  active = "active",
  cancelled = "cancelled",
  completed = "completed",
  expired = "expired",
  on_hold = "on-hold",
  declined = "declined",
  unknown = "unknown",
}

/**
 * Convenience object to group a medication request with all it's related medication dispenses
 * Invalid if any of the dispenses point to a different request than the one referenced
 */
export interface MedicationRequestBundle {
  request: MedicationRequest;
  dispenses: Array<MedicationDispense>;
}

export interface MedicationReferenceOrCodeableConcept {
  medicationReference?: {
    reference: string;
    type?: string;
    display?: string;
  };
  medicationCodeableConcept?: {
    coding: Coding[];
    text: string;
  };
}

export interface OrderConfig {
  drugRoutes: Array<CommonConfigProps>;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  durationUnits: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<any>;
  person: Person;
}

export interface Person {
  age: number;
  attributes: Array<Attribute>;
  birthDate: string;
  gender: string;
  display: string;
  preferredAddress: OpenmrsResource;
  uuid: string;
}

// represents a row in the main table
export interface PrescriptionsTableRow {
  id: string;
  created: string;
  patient: {
    name: string;
    uuid: string;
  };
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
  location: string;
}

export interface Quantity {
  value: number;
  unit: string;
  code: string;
  system?: string;
}

export interface Reference {
  reference: string;
  type?: string;
  display?: string;
}

// simple representation of a location
export interface SimpleLocation {
  id: string;
  name: string;
}

export interface ValueSet {
  id: string;
  title: string;
  status: string;
  date: string;
  description: string;
  compose: {
    include: [
      {
        system: string;
        concept: [
          {
            code: string;
            display: string;
          }
        ];
      }
    ];
  };
}

export interface StockDispenseRequest {
  locationUuid: string;
  patientUuid: string;
  orderUuid: string;
  encounterUuid: string;
  stockItemUuid: string;
  stockBatchUuid: string;
  quantity: number;
  stockItemPackagingUOMUuid: string;
}

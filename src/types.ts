import { OpenmrsResource } from "@openmrs/esm-api";

export interface DrugOrders {
  id: string;
  display: string;
  description: string;
}

export interface Order {
  uuid: string;
  action: string;
  asNeeded: boolean;
  asNeededCondition?: string;
  autoExpireDate: Date;
  brandName?: string;
  careSetting: OpenmrsResource;
  commentToFulfiller: string;
  dateActivated: Date;
  dateStopped?: Date | null;
  dispenseAsWritten: boolean;
  dose: number;
  doseUnits: OpenmrsResource;
  dosingInstructions: string | null;
  dosingType?:
    | "org.openmrs.FreeTextDosingInstructions"
    | "org.openmrs.SimpleDosingInstructions";
  drug: Drug;
  duration: number;
  durationUnits: OpenmrsResource;
  encounter: OpenmrsResource;
  frequency: OpenmrsResource;
  instructions?: string | null;
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderType: {
    conceptClasses: Array<any>;
    description: string;
    display: string;
    name: string;
    parent: string | null;
    retired: boolean;
    uuid: string;
  };
  orderer: {
    display: string;
    person: {
      display: string;
    };
    uuid: string;
  };
  patient: OpenmrsResource;
  previousOrder: { uuid: string; type: string; display: string } | null;
  quantity: number;
  quantityUnits: OpenmrsResource;
  route: OpenmrsResource;
  scheduleDate: null;
  urgency: string;
}

export interface Drug {
  uuid: string;
  name: string;
  strength: string;
  concept: OpenmrsResource;
  dosageForm: OpenmrsResource;
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

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
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
    resource: MedicationRequest;
  }>;
}

export interface Coding {
  system?: string;
  code: string;
  display: string;
}

export interface CodingArray {
  [index: number]: Coding;
}

export interface MedicationRequest {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  status: string;
  intent: string;
  priority: string;
  medicationReference: {
    reference: string;
    type: string;
    display: string;
  };
  medicationCodeableConcept?: {
    coding: CodingArray;
    text: string;
  };
  subject: {
    reference: string;
    type: string;
    display: string;
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
    quantity: {
      value: number;
      unit: string;
      code: string;
    };
  };
}

export interface DosageInstruction {
  text: string;
  timing: {
    repeat: {
      duration: number;
      durationUnit: string;
    };
    code: {
      coding: [
        {
          code: string;
          display: string;
        }
      ];
      text: string;
    };
  };
  asNeededBoolean: boolean;
  route: {
    coding: [
      {
        code: string;
        display: string;
      }
    ];
    text: string;
  };
  doseAndRate: [
    {
      doseQuantity: {
        value: number;
        unit: string;
        code: string;
      };
    }
  ];
}

export interface EncountersWithMedicationRequestsResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: EncounterWithMedicationRequests;
  }>;
}

export interface EncounterWithMedicationRequests {
  type: string;
  id: string;
  resourceType: string;
  period?: {
    start: string;
  };
  encounter: {
    reference: string;
  };
  subject: {
    type: string;
    display: string;
    reference: string;
  };
  medicationReference?: {
    reference: string;
    type: string;
    display: string;
  };
  medicationCodeableConcept?: {
    coding: CodingArray;
    text: string;
  };
  requester: {
    type: string;
    display: string;
    reference: string;
  };
  status: string;
}

// represents a "Prescription" as understood by the UI, derived from a EncounterWithMedicationRequest
export interface Prescription {
  id: string;
  created: string;
  patientName: string;
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
  patientUuid: string;
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

export interface DispensePayload {
  drugs: Array<Drug>;
  encounterUuid: string;
  patientUuid: string;
  comments: string;
}

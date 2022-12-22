import { OpenmrsResource } from "@openmrs/esm-api";

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

export interface Coding {
  system?: string;
  code: string;
  display: string;
}

export interface CodingArray {
  [index: number]: Coding;
}

export interface CommonConfigProps {
  uuid: string;
  display: string;
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

// add more properties, or fine just to keep the ones we are using
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

export interface Medication {
  medicationReference: {
    reference: string;
    type: string;
    display: string;
  };
  medicationCodeableConcept?: {
    coding: CodingArray;
    text: string;
  };
}

export interface MedicationDispense {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  status: string;
  intent: string;
  priority: string;
  authorizingPrescription?: [
    {
      reference: string;
    }
  ];
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
  performer: Array<{
    actor: {
      reference: string;
      type: string;
      identifier: {
        value: string;
      };
      display: string;
    };
  }>;
  location: {
    reference: string;
    type: string;
    display: string;
  };
  type: {
    coding: [
      Array<{
        code: string;
        display: string;
      }>
    ];
    text: string;
  };
  quantity: Quantity;
  whenPrepared: string;
  whenHandedOver: string;
  dosageInstruction: Array<DosageInstruction>;
  substitution: {
    wasSubstituted: boolean;
  };
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
    quantity: Quantity;
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
  patientName: string;
  prescriber: string;
  drugs: string;
  lastDispenser: string;
  status: string;
  patientUuid: string;
}

export interface Quantity {
  value: number;
  unit: string;
  code: string;
  system: string;
}

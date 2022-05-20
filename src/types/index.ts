export interface FHIRMedicationRequestResponse {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  entry: Array<{
    resource: FHIREncounterOrder;
  }>;
}

export interface FHIREncounterOrder {
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
  requester: {
    type: string;
    display: string;
    reference: string;
  };
  status: string;
}

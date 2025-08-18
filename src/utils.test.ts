import {
  type Coding,
  type DosageInstruction,
  type Medication,
  type MedicationDispense,
  MedicationDispenseStatus,
  type MedicationReferenceOrCodeableConcept,
  type MedicationRequest,
  type MedicationRequestBundle,
  MedicationRequestCombinedStatus,
  MedicationRequestFulfillerStatus,
  MedicationRequestStatus,
} from './types';
import {
  computeMedicationRequestCombinedStatus,
  computeMedicationRequestStatus,
  computeNewFulfillerStatusAfterDelete,
  computeNewFulfillerStatusAfterDispenseEvent,
  computePrescriptionStatus,
  computeQuantityRemaining,
  computeTotalQuantityDispensed,
  computeTotalQuantityOrdered,
  getAssociatedMedicationDispenses,
  getAssociatedMedicationRequest,
  getConceptCoding,
  getConceptCodingDisplay,
  getConceptCodingUuid,
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getMedicationsByConceptEndpoint,
  getMostRecentMedicationDispenseStatus,
  getNextMostRecentMedicationDispenseStatus,
  getOpenMRSMedicineDrugName,
  getPrescriptionDetailsEndpoint,
  getPrescriptionTableActiveMedicationRequestsEndpoint,
  getPrescriptionTableAllMedicationRequestsEndpoint,
  getQuantity,
  getQuantityUnitsMatch,
  getRefillsAllowed,
  isMostRecentMedicationDispense,
} from './utils';
import dayjs from 'dayjs';

describe('Util Tests', () => {
  describe('test computeMedicationRequestCombinedStatus', () => {
    test('should return on-hold if status active and fulfiller status on-hold', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.active,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.on_hold,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.on_hold,
      );
    });
    test('should return declined if status active and fulfiller status declined', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.active,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.declined,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.declined,
      );
    });
    test('should return completed if status completed and fulfiller status completed', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.completed,
      );
    });
    test('should return cancelled if status cancelled and no fulfiller status', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.cancelled,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.cancelled,
      );
    });
    test('should return cancelled if status cancelled and fulfiller on-hold', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.cancelled,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.on_hold,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.cancelled,
      );
    });
    test('should return cancelled if status cancelled and fulfiller declined', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.cancelled,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.declined,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.cancelled,
      );
    });
    test('should return expired if validity period over 90 days ago and no fulfiller status', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '2020-04-04' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.active,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.expired,
      );
    });
    test('should return expired if validity period over 90 days and fulfiller status on-hold', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '2020-04-04' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.active,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.on_hold,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.expired,
      );
    });
    test('should return expired if validity period over 90 days and fulfiller status declined', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '2020-04-04' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.active,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.declined,
          },
        ],
      };
      expect(computeMedicationRequestCombinedStatus(medicationRequest, 90)).toBe(
        MedicationRequestCombinedStatus.expired,
      );
    });
  });

  describe('test computeMedicationRequestStatus', () => {
    test('should return Cancelled if Medication Request has status cancelled', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.cancelled,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 0)).toBe(MedicationRequestStatus.cancelled);
    });
    test('should return Completed if Medication Request has status completed', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 0)).toBe(MedicationRequestStatus.completed);
    });
    test('should return Expired if Medication Request older than expired timeframe', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: dayjs().subtract(91, 'days').toString() },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(MedicationRequestStatus.expired);
    });
    test('should return Expired if Medication Request age is passed expired timeframe', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: dayjs().subtract(91, 'days').toString() },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(MedicationRequestStatus.expired);
    });
    test('should return Active if Medication Request age is equal to expired timeframe (even if status is expired)', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: {
            start: dayjs().startOf('day').subtract(90, 'days').toString(),
          },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.expired,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(MedicationRequestStatus.active);
    });
    test('should return Active if Medication Request is age is less than expired timeframe (even if status is expired)', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: {
            start: dayjs().startOf('day').subtract(90, 'days').toString(),
          },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: MedicationRequestStatus.expired,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(MedicationRequestStatus.active);
    });
    test('should return Active as default', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(MedicationRequestStatus.active);
    });
  });

  describe('test computeNewFulfillerStatusAfterDelete', () => {
    const medicationRequest: MedicationRequest = {
      id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
      dispenseRequest: {
        numberOfRepeatsAllowed: undefined,
        quantity: {
          value: 30,
          unit: 'mg',
          code: '123abc',
        },
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: 'MedicationRequest',
      status: MedicationRequestStatus.completed,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.declined,
        },
      ],
    };

    const medicationDispenseCompleteMostRecent: MedicationDispense = {
      dosageInstruction: undefined,
      id: 'ab663520-8b5f-4afe-a333-5196f69ccea7',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-05T14:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-05T14:00:00-05:00',
      whenPrepared: '2023-01-05T14:00:00-05:00',
    };

    const medicationDispenseDeclined: MedicationDispense = {
      dosageInstruction: undefined,
      id: '9f7987e8-95c6-42f3-96e6-fd2eaa3134a5',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-04T14:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.declined,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-04T14:00:00-05:00',
      whenPrepared: '2023-01-04T14:00:00-05:00',
    };

    const medicationDispenseOnHold: MedicationDispense = {
      dosageInstruction: undefined,
      id: 'e2bf7117-aa87-4a92-9e61-f985f29a82aa',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-03T14:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.on_hold,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-03T14:00:00-05:00',
      whenPrepared: '2023-01-03T14:00:00-05:00',
    };

    const medicationDispenseCompleteOldest: MedicationDispense = {
      dosageInstruction: undefined,
      id: '7fd2dcd2-6621-444d-9054-fe1d36acf498',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-01T14:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-01T14:00:00-05:00',
      whenPrepared: '2023-01-01T14:00:00-05:00',
    };

    test('should return declined if deleting most recent medication dispense and next most recent status declined', () => {
      const medicationRequestBundle: MedicationRequestBundle = {
        request: medicationRequest,
        dispenses: [
          medicationDispenseCompleteMostRecent,
          medicationDispenseDeclined,
          medicationDispenseOnHold,
          medicationDispenseCompleteOldest,
        ],
      };

      expect(
        computeNewFulfillerStatusAfterDelete(medicationDispenseCompleteMostRecent, medicationRequestBundle, false),
      ).toBe(MedicationRequestFulfillerStatus.declined);
    }),
      test('should return on-hold if deleting most recent medication dispense next most recent status on-hold', () => {
        const medicationRequestBundle: MedicationRequestBundle = {
          request: medicationRequest,
          dispenses: [medicationDispenseCompleteMostRecent, medicationDispenseOnHold, medicationDispenseCompleteOldest],
        };

        expect(
          computeNewFulfillerStatusAfterDelete(medicationDispenseCompleteMostRecent, medicationRequestBundle, false),
        ).toBe(MedicationRequestFulfillerStatus.on_hold);
      }),
      test('should return null if deleting only medication dispense', () => {
        const medicationRequestBundle: MedicationRequestBundle = {
          request: medicationRequest,
          dispenses: [medicationDispenseCompleteMostRecent],
        };

        expect(
          computeNewFulfillerStatusAfterDelete(medicationDispenseCompleteMostRecent, medicationRequestBundle, false),
        ).toBeNull();
      }),
      test('should return current fulfiller status if not most recent medication dispense and deleted dispense does not have status of completed', () => {
        const medicationRequestBundle: MedicationRequestBundle = {
          request: medicationRequest,
          dispenses: [medicationDispenseDeclined, medicationDispenseOnHold],
        };

        expect(computeNewFulfillerStatusAfterDelete(medicationDispenseOnHold, medicationRequestBundle, false)).toBe(
          MedicationRequestFulfillerStatus.declined,
        );
      });
  });

  describe('test computeNewFulfillerStatusAfterDispenseEvent', () => {
    const medicationRequest: MedicationRequest = {
      id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
      dispenseRequest: {
        numberOfRepeatsAllowed: undefined,
        quantity: {
          value: 30,
          unit: 'mg',
          code: '123abc',
        },
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: 'MedicationRequest',
      status: null,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.completed,
        },
      ],
    };

    const newMedicationDispense: MedicationDispense = {
      // ie quantity dispense = quantity ordered
      dosageInstruction: undefined,
      id: '',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: null,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: null,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    const existingMedicationDispense: MedicationDispense = {
      // ie quantity dispense = quantity ordered
      dosageInstruction: undefined,
      id: 'ab663520-8b5f-4afe-a333-5196f69ccea7',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: null,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: null,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    test('when adding new dispense should return null even if dispense meets or exceeds quantity if restrict total quantity dispensed config is false', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.whenHandedOver = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.whenPrepared = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.completed;
      newMedicationDispense.quantity.value = 30;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          { request: medicationRequest, dispenses: [] },
          false,
        ),
      ).toBeNull();
    });

    test('when adding new dispense should return on-hold if status of new dispense is on-hold and if restrict total quantity dispensed config is false', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.on_hold;
      newMedicationDispense.quantity.value = 0;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          { request: medicationRequest, dispenses: [] },
          false,
        ),
      ).toBe(MedicationRequestFulfillerStatus.on_hold);
    });

    test('when adding new dispense should return complete if total dispensed equals total ordered and restrict total quantity dispensed config is true', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.completed;
      newMedicationDispense.quantity.value = 30;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          { request: medicationRequest, dispenses: [] },
          true,
        ),
      ).toBe(MedicationRequestFulfillerStatus.completed);
    });

    test('when adding new dispense should return null if total dispensed less than total ordered and restrict total quantity dispensed config is true', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.completed;
      newMedicationDispense.quantity.value = 20;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          { request: medicationRequest, dispenses: [] },
          true,
        ),
      ).toBeNull();
    });

    test('when adding new on-hold dispense should return on-hold if restrict total quantity dispensed config is true', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.on_hold;
      newMedicationDispense.quantity.value = 0;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          { request: medicationRequest, dispenses: [] },
          true,
        ),
      ).toBe(MedicationRequestFulfillerStatus.on_hold);
    });

    test('when adding new dispense to request with existing dispense should return complete if meets total quantity ordered and restrict total quantity dispensed config is true', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.on_hold;
      newMedicationDispense.quantity.value = 20;
      existingMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      existingMedicationDispense.status = MedicationDispenseStatus.on_hold;
      existingMedicationDispense.quantity.value = 10;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          {
            request: medicationRequest,
            dispenses: [existingMedicationDispense],
          },
          true,
        ),
      ).toBe(MedicationRequestFulfillerStatus.completed);
    });

    test('when adding new dispense to request with existing dispense should return null if does not meet total quantiy order and  restrict total quantity dispensed config is true', () => {
      newMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      newMedicationDispense.status = MedicationDispenseStatus.completed;
      newMedicationDispense.quantity.value = 10;
      existingMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      existingMedicationDispense.status = MedicationDispenseStatus.completed;
      existingMedicationDispense.quantity.value = 10;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          newMedicationDispense,
          {
            request: medicationRequest,
            dispenses: [existingMedicationDispense],
          },
          true,
        ),
      ).toBeNull();
    });

    test('when editing existing dispense should return null if does not meet total quantity order and  restrict total quantity dispensed config is true', () => {
      existingMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      existingMedicationDispense.status = MedicationDispenseStatus.completed;
      existingMedicationDispense.quantity.value = 30;
      const editedExistingMedicationDispense = {
        ...existingMedicationDispense,
      };
      editedExistingMedicationDispense.quantity.value = 20;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          editedExistingMedicationDispense,
          {
            request: medicationRequest,
            dispenses: [existingMedicationDispense],
          },
          true,
        ),
      ).toBeNull();
    });

    test('when editing existing dispense should return complete if meets total quantity order and  restrict total quantity dispensed config is true', () => {
      existingMedicationDispense.extension[0].valueDateTime = '2023-01-03T14:00:00-05:00';
      existingMedicationDispense.status = MedicationDispenseStatus.completed;
      existingMedicationDispense.quantity.value = 20;
      const editedExistingMedicationDispense = {
        ...existingMedicationDispense,
      };
      editedExistingMedicationDispense.quantity.value = 30;
      expect(
        computeNewFulfillerStatusAfterDispenseEvent(
          editedExistingMedicationDispense,
          {
            request: medicationRequest,
            dispenses: [existingMedicationDispense],
          },
          true,
        ),
      ).toBe(MedicationRequestFulfillerStatus.completed);
    });
  });

  describe('test computePrescriptionStatus', () => {
    const activeMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.active,
      subject: { display: '', reference: '', type: '' },
    };
    // sanity check
    expect(computeMedicationRequestCombinedStatus(activeMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.active,
    );
    const cancelledMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.cancelled,
      subject: { display: '', reference: '', type: '' },
    };
    // sanity check
    expect(computeMedicationRequestCombinedStatus(cancelledMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.cancelled,
    );
    const expiredMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '2020-04-04' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.active,
      subject: { display: '', reference: '', type: '' },
    };
    // sanity check
    expect(computeMedicationRequestCombinedStatus(expiredMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.expired,
    );
    const onHoldMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.active,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.on_hold,
        },
      ],
    };
    // sanity check
    expect(computeMedicationRequestCombinedStatus(onHoldMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.on_hold,
    );
    const declinedMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.active,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.declined,
        },
      ],
    };
    // santity check
    expect(computeMedicationRequestCombinedStatus(declinedMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.declined,
    );
    const completedMedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: '',
      status: MedicationRequestStatus.completed,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.completed,
        },
      ],
    };
    // santiy-check
    expect(computeMedicationRequestCombinedStatus(completedMedicationRequest, 90)).toBe(
      MedicationRequestCombinedStatus.completed,
    );
    test('should return active if any medication request combined status active', () => {
      expect(
        computePrescriptionStatus(
          [
            activeMedicationRequest,
            cancelledMedicationRequest,
            expiredMedicationRequest,
            onHoldMedicationRequest,
            declinedMedicationRequest,
            completedMedicationRequest,
          ],
          90,
        ),
      ).toBe(MedicationRequestCombinedStatus.active);
    });
    test('should return on-hold if any medication request combined status on-hold, and none active', () => {
      expect(
        computePrescriptionStatus(
          [
            cancelledMedicationRequest,
            expiredMedicationRequest,
            onHoldMedicationRequest,
            declinedMedicationRequest,
            completedMedicationRequest,
          ],
          90,
        ),
      ).toBe(MedicationRequestCombinedStatus.on_hold);
    });
    test('should return completed if any medication request combined status completed, and none active or on hold', () => {
      expect(
        computePrescriptionStatus(
          [cancelledMedicationRequest, expiredMedicationRequest, declinedMedicationRequest, completedMedicationRequest],
          90,
        ),
      ).toBe(MedicationRequestCombinedStatus.completed);
    });
    test('should return declined if any medication request combined status declined, and none active or on hold or completed', () => {
      expect(
        computePrescriptionStatus(
          [cancelledMedicationRequest, expiredMedicationRequest, declinedMedicationRequest],
          90,
        ),
      ).toBe(MedicationRequestCombinedStatus.declined);
    });
    test('should return cancelled if any medication request combined status cancelled, and none active or on hold or completed or declined', () => {
      expect(computePrescriptionStatus([cancelledMedicationRequest, expiredMedicationRequest], 90)).toBe(
        MedicationRequestCombinedStatus.cancelled,
      );
    });
    test('should return expired if any medication request combined status expired, and none active or on hold or completed or declined or cancelled', () => {
      expect(computePrescriptionStatus([expiredMedicationRequest], 90)).toBe(MedicationRequestCombinedStatus.expired);
    });
    test('should return null for empty array', () => {
      expect(computePrescriptionStatus([], 90)).toBe(null);
    });
    test('should return null for null input', () => {
      expect(computePrescriptionStatus(null, 90)).toBe(null);
    });
  });

  describe('test computeRemainingQuantity', () => {
    const medicationRequest: MedicationRequest = {
      id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
      dispenseRequest: {
        numberOfRepeatsAllowed: undefined,
        quantity: {
          value: 30,
          unit: 'mg',
          code: '123abc',
        },
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: 'MedicationRequest',
      status: MedicationRequestStatus.completed,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.completed,
        },
      ],
    };
    const medicationDispense1: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    const medicationDispense2: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 10,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    const medicationDispenseNoQuantity: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: undefined,
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    const medicationRequestDifferentUnits: MedicationRequest = {
      id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
      dispenseRequest: {
        numberOfRepeatsAllowed: undefined,
        quantity: {
          value: 30,
          unit: 'kg',
          code: '456def',
        },
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: 'MedicationRequest',
      status: MedicationRequestStatus.completed,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.completed,
        },
      ],
    };

    test('should return quantity remaining', () => {
      expect(
        computeQuantityRemaining({
          request: medicationRequest,
          dispenses: [medicationDispense1, medicationDispense2, medicationDispenseNoQuantity],
        }),
      ).toBe(15);
    });
    test('should return quantity ordered if no dispense has happened', () => {
      expect(
        computeQuantityRemaining({
          request: medicationRequest,
          dispenses: [medicationDispenseNoQuantity],
        }),
      ).toBe(30);
    });
    test('should return amount orders if no dispenses', () => {
      expect(computeQuantityRemaining({ request: medicationRequest, dispenses: [] })).toBe(30);
    });
    test('should return zero for null input', () => {
      expect(computeQuantityRemaining(null)).toBe(0);
    });
    /*  // TODO: figure out how to get this to work
    test("should throw Error if unit mismatch", () => {
      expect(
        computeQuantityRemaining(medicationRequestDifferentUnits, [
          medicationDispense1,
          medicationDispenseNoQuantity,
          medicationDispense2,
        ])
      ).toThrow(Error);
    });*/
  });

  describe('test computeTotalQuantityDispensed', () => {
    const medicationDispense1: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    const medicationDispense2: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 15,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    const medicationDispenseNoQuantity: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: undefined,
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    const medicationDispenseDifferentUnits: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 1,
        unit: 'kg',
        code: '456ddef',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };

    test('should return 0 for null input', () => {
      expect(computeTotalQuantityDispensed(null)).toBe(0);
    });
    test('should return 0 if no dispense events have quantity', () =>
      expect(computeTotalQuantityDispensed([medicationDispenseNoQuantity])).toBe(0));
    test('should return total quantity dispensed', () => {
      expect(
        computeTotalQuantityDispensed([medicationDispense1, medicationDispenseNoQuantity, medicationDispense2]),
      ).toBe(20);
    });
    // TODO: figure out how to get this to work
    /*test("should throw Error if unit mismatch", () => {
      expect(
        computeTotalQuantityDispensed([
          medicationDispense1,
          medicationDispenseNoQuantity,
          medicationDispense2,
          medicationDispenseDifferentUnits,
        ])
      ).toThrow("Can't calculate quantity dispensed if units don't match");
    });*/
  });

  describe('test computeTotalQuantityOrdered', () => {
    test('should calculate total quantity ordered when refills set', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 3,
          quantity: {
            value: 30,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };
      expect(computeTotalQuantityOrdered(medicationRequest)).toBe(120);
    });
    test('should calculate total quantity ordered when refills not set', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: undefined,
          quantity: {
            value: 30,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };
      expect(computeTotalQuantityOrdered(medicationRequest)).toBe(30);
    });
    test('should return null when no quantity', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: undefined,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };
      expect(computeTotalQuantityOrdered(medicationRequest)).toBe(null);
    });
  });

  describe('test getAssociatedMedicationDispense', () => {
    test('should return medication dispenses associated with request', () => {
      const medicationRequest: MedicationRequest = {
        id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };

      const medicationDispenses: Array<MedicationDispense> = [
        {
          dosageInstruction: undefined,
          id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '',
          whenPrepared: '',
        },
        {
          dosageInstruction: undefined,
          id: 'f7b5585d-6867-4f3a-8151-da9ee1f70fab',
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '',
          whenPrepared: '',
        },
        {
          dosageInstruction: undefined,
          id: 'a2121f8e-1bcc-4cf9-b1e8-1edace155e7f',
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '',
          whenPrepared: '',
        },
        {
          dosageInstruction: undefined,
          id: 'b59a6c54-c178-4972-a33b-dfe9f968e71a',
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '',
          whenPrepared: '',
        },
      ];
      const results: Array<MedicationDispense> = getAssociatedMedicationDispenses(
        medicationRequest,
        medicationDispenses,
      );
      expect(results.length).toBe(2);
      expect(results).toContain(medicationDispenses[1]);
      expect(results).toContain(medicationDispenses[3]);
    });
    test('should return empty list if no associated requests', () => {
      const medicationRequest: MedicationRequest = {
        id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
        dispenseRequest: {
          numberOfRepeatsAllowed: 0,
          quantity: undefined,
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: '',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };

      const medicationDispenses: Array<MedicationDispense> = [
        {
          dosageInstruction: undefined,
          id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '',
          whenPrepared: '',
        },
      ];
      const results: Array<MedicationDispense> = getAssociatedMedicationDispenses(
        medicationRequest,
        medicationDispenses,
      );
      expect(results.length).toBe(0);
    });
  });

  describe('test getAssociatedRequest', () => {
    test('should return medication request associated with dispense', () => {
      const medicationRequest1: MedicationRequest = {
        id: '0c26097a-e856-4c01-a6b4-7c8e6c636618',
        dispenseRequest: {
          numberOfRepeatsAllowed: undefined,
          quantity: {
            value: 30,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };

      const medicationRequest2: MedicationRequest = {
        id: '1c1ad91e-8653-453a-9f59-8d5c36249aff',
        dispenseRequest: {
          numberOfRepeatsAllowed: undefined,
          quantity: {
            value: 30,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: MedicationRequestStatus.completed,
        subject: { display: '', reference: '', type: '' },
        extension: [
          {
            url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
            valueCode: MedicationRequestFulfillerStatus.completed,
          },
        ],
      };

      const medicationDispense: MedicationDispense = {
        dosageInstruction: undefined,
        id: '998f4111-96e8-4cd6-aebd-7f55716621a0',
        authorizingPrescription: [
          {
            reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
            type: 'MedicationRequest',
          },
        ],
        location: { display: '', reference: '', type: '' },
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        quantity: {
          value: 5,
          unit: 'mg',
          code: '123abc',
        },
        performer: undefined,
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        subject: { display: '', reference: '', type: '' },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: '',
        whenPrepared: '',
      };

      expect(getAssociatedMedicationRequest(medicationDispense, [medicationRequest1, medicationRequest2])).toBe(
        medicationRequest2,
      );
    });
  });

  describe('test getConceptCoding', () => {
    test('should find the concept coding without a system', () => {
      const codings: Array<Coding> = [
        {
          system: 'SNOMED',
          code: '123456',
          display: 'Weight',
        },
        {
          code: '123abc',
          display: 'Weight',
        },
        {
          system: 'CIEL',
          code: 'abcdef',
          display: 'Weight',
        },
      ];

      expect(getConceptCoding(codings).code).toBe('123abc');
    });
    test('should find the concept coding undefined system', () => {
      const codings: Array<Coding> = [
        {
          system: 'SNOMED',
          code: '123456',
          display: 'Weight',
        },
        {
          system: undefined,
          code: '123abc',
          display: 'Weight',
        },
        {
          system: 'CIEL',
          code: 'abcdef',
          display: 'Weight',
        },
      ];

      expect(getConceptCoding(codings).code).toBe('123abc');
    });
  });

  describe('test getConceptCodingUuid', () => {
    test('should find the concept coding uuid without a system', () => {
      const codings: Array<Coding> = [
        {
          system: 'SNOMED',
          code: '123456',
          display: 'Weight',
        },
        {
          code: '123abc',
          display: 'Weight',
        },
        {
          system: 'CIEL',
          code: 'abcdef',
          display: 'Weight',
        },
      ];

      expect(getConceptCodingUuid(codings)).toBe('123abc');
    });
    test('should find the concept coding uuid without a system', () => {
      const codings: Array<Coding> = [
        {
          system: 'SNOMED',
          code: '123456',
          display: 'Weight',
        },
        {
          code: '123abc',
          display: 'Weight',
        },
        {
          system: 'CIEL',
          code: 'abcdef',
          display: 'Weight',
        },
      ];
      expect(getConceptCodingDisplay(codings)).toBe('Weight');
    });
  });

  describe('test getDosageInstructions', () => {
    test('should return first element of dosage instructions array', () => {
      const dosageInstructions: Array<DosageInstruction> = [
        {
          asNeededBoolean: false,
          doseAndRate: undefined,
          route: { coding: undefined },
          text: 'first',
          timing: {
            code: { coding: undefined },
            repeat: { duration: 0, durationUnit: '' },
          },
        },
        {
          asNeededBoolean: false,
          doseAndRate: undefined,
          route: { coding: undefined },
          text: 'second',
          timing: {
            code: { coding: undefined },
            repeat: { duration: 0, durationUnit: '' },
          },
        },
      ];

      expect(getDosageInstruction(dosageInstructions).text).toBe('first');
    });
  });

  describe('test getMedicationsByConceptEndpoint', () => {
    test('should return medications by concept endpoint', () => {
      expect(getMedicationsByConceptEndpoint('123abc')).toBe('/ws/fhir2/R4/Medication?code=123abc');
    });
  });

  describe('test getMedicationDisplay', () => {
    test('should return medication reference display when present', () => {
      const medication: MedicationReferenceOrCodeableConcept = {
        medicationReference: {
          reference: 'Medication/123abc',
          display: 'Aspirin',
        },
        medicationCodeableConcept: {
          coding: [
            {
              code: 'def687',
              display: 'Aspirin',
            },
          ],
          text: 'Aspirin',
        },
      };
      expect(getMedicationDisplay(medication)).toBe('Aspirin');
    });
    test('should return medication codeable concept when reference not present', () => {
      const medication: MedicationReferenceOrCodeableConcept = {
        medicationCodeableConcept: {
          coding: [
            {
              code: 'def687',
              display: 'Aspirin',
            },
          ],
          text: 'Aspirin',
        },
      };
      expect(getMedicationDisplay(medication)).toBe('Aspirin: Aspirin');
    });
  });

  describe('test getMedicationReferenceOrCodeableConcept', () => {
    test('should return medication reference or codeable concept from Medication Request', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 3,
          quantity: {
            value: 5,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: {
          display: '',
          reference: 'Medication/123abc',
          type: '',
        },
        medicationCodeableConcept: {
          coding: undefined,
          text: 'Some concept',
        },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(getMedicationReferenceOrCodeableConcept(medicationRequest).medicationReference.reference).toBe(
        'Medication/123abc',
      );
      expect(getMedicationReferenceOrCodeableConcept(medicationRequest).medicationCodeableConcept.text).toBe(
        'Some concept',
      );
    });
    test('should return medication reference or codeable concept from Medication Dispense', () => {
      const medicationDispense: MedicationDispense = {
        dosageInstruction: undefined,
        id: '',
        location: { display: '', reference: '', type: '' },
        medicationReference: {
          display: '',
          reference: 'Medication/123abc',
          type: '',
        },
        medicationCodeableConcept: {
          coding: undefined,
          text: 'Some concept',
        },
        meta: { lastUpdated: '' },
        quantity: {
          value: 5,
          unit: 'mg',
          code: '123abc',
        },
        performer: undefined,
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        subject: { display: '', reference: '', type: '' },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: '',
        whenPrepared: '',
      };
      expect(getMedicationReferenceOrCodeableConcept(medicationDispense).medicationReference.reference).toBe(
        'Medication/123abc',
      );
      expect(getMedicationReferenceOrCodeableConcept(medicationDispense).medicationCodeableConcept.text).toBe(
        'Some concept',
      );
    });
  });

  describe('test getMostRecentMedicationDispenseStatus', () => {
    test('should return most recent status', () => {
      const medicationDispenses: Array<MedicationDispense> = [
        {
          dosageInstruction: undefined,
          id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T14:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.on_hold,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T14:00:00-05:00',
          whenPrepared: '2023-01-05T14:00:00-05:00',
        },
        {
          dosageInstruction: undefined,
          id: 'f7b5585d-6867-4f3a-8151-da9ee1f70fab',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T20:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T20:00:00-05:00',
          whenPrepared: '2023-01-05T20:00:00-05:00',
        },
        {
          dosageInstruction: undefined,
          id: 'a2121f8e-1bcc-4cf9-b1e8-1edace155e7f',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T17:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.declined,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T17:00:00-05:00',
          whenPrepared: '2023-01-05T17:00:00-05:00',
        },
      ];

      expect(getMostRecentMedicationDispenseStatus(medicationDispenses)).toBe(MedicationDispenseStatus.completed);
    });
    test('should return null for null input', () => {
      expect(getMostRecentMedicationDispenseStatus(null)).toBeNull();
    });
    test('should return null for empty list', () => {
      expect(getMostRecentMedicationDispenseStatus([])).toBeNull();
    });
  });

  describe('test getNextMostRecentMedicationDispenseStatus', () => {
    test('should return next most recent status', () => {
      const medicationDispenses: Array<MedicationDispense> = [
        {
          dosageInstruction: undefined,
          id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T14:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.on_hold,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T14:00:00-05:00',
          whenPrepared: '2023-01-05T14:00:00-05:00',
        },
        {
          dosageInstruction: undefined,
          id: 'f7b5585d-6867-4f3a-8151-da9ee1f70fab',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T20:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.completed,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T20:00:00-05:00',
          whenPrepared: '2023-01-05T20:00:00-05:00',
        },
        {
          dosageInstruction: undefined,
          id: 'a2121f8e-1bcc-4cf9-b1e8-1edace155e7f',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T17:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.declined,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T17:00:00-05:00',
          whenPrepared: '2023-01-05T17:00:00-05:00',
        },
      ];

      expect(getNextMostRecentMedicationDispenseStatus(medicationDispenses)).toBe(MedicationDispenseStatus.declined);
    });
    test('should return null if only one dispense', () => {
      const medicationDispenses: Array<MedicationDispense> = [
        {
          dosageInstruction: undefined,
          id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
          extension: [
            {
              url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
              valueDateTime: '2023-01-05T14:00:00-05:00',
            },
          ],
          authorizingPrescription: [
            {
              reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
              type: 'MedicationRequest',
            },
          ],
          location: { display: '', reference: '', type: '' },
          medicationReference: { display: '', reference: '', type: '' },
          meta: { lastUpdated: '' },
          quantity: {
            value: 1,
            unit: '',
            code: '',
          },
          performer: undefined,
          resourceType: 'MedicationDispense',
          status: MedicationDispenseStatus.on_hold,
          subject: { display: '', reference: '', type: '' },
          substitution: { reason: [], type: undefined, wasSubstituted: false },
          type: undefined,
          whenHandedOver: '2023-01-05T14:00:00-05:00',
          whenPrepared: '2023-01-05T14:00:00-05:00',
        },
      ];
      expect(getNextMostRecentMedicationDispenseStatus(medicationDispenses)).toBeNull();
    });
    test('should return null for null input', () => {
      expect(getNextMostRecentMedicationDispenseStatus(null)).toBeNull();
    });
    test('should return null for empty list', () => {
      expect(getMostRecentMedicationDispenseStatus([])).toBeNull();
    });
  });

  describe('test getOpenMRSMedicineDrugName', () => {
    test('getOpenMRSMedicineDrugName should get drug name stored in FHIR extension', () => {
      const medication: Medication = {
        code: { coding: [], text: '' },
        extension: [
          {
            extension: [
              {
                url: 'http://fhir.openmrs.org/ext/medicine#drugName',
                valueString: 'Aspirin',
              },
            ],
            url: 'http://fhir.openmrs.org/ext/medicine',
          },
        ],
        id: '',
        meta: { lastUpdated: '' },
        resourceType: 'Medication',
        status: '',
      };

      expect(getOpenMRSMedicineDrugName(medication)).toBe('Aspirin');
    });
  });

  describe('test getPrescriptionTableActiveMedicationRequestsEndpoint', () => {
    test('should return endpoint with date parameter', () => {
      expect(getPrescriptionTableActiveMedicationRequestsEndpoint(1, 10, '2020-01-01', null, null)).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active',
      );
    });
    test('should return endpoint with date and search term parameters', () => {
      expect(getPrescriptionTableActiveMedicationRequestsEndpoint(1, 10, '2020-01-01', 'bob', null)).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&patientSearchTerm=bob',
      );
    });
    test('should return endpoint with date and location parameters', () => {
      expect(getPrescriptionTableActiveMedicationRequestsEndpoint(1, 10, '2020-01-01', null, '123abc')).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&location=123abc',
      );
    });
    test('should return endpoint with date, location, and search term parameters', () => {
      expect(getPrescriptionTableActiveMedicationRequestsEndpoint(1, 10, '2020-01-01', 'bob', '123abc')).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&patientSearchTerm=bob&location=123abc',
      );
    });
  });

  describe('test getPrescriptionTableAllMedicationRequestsEndpoint', () => {
    test('should return endpoint', () => {
      expect(getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, null, null)).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10',
      );
    });
    test('should return endpoint with search term parameter', () => {
      expect(getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, 'bob', null)).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob',
      );
    });
    test('should return endpoint with location parameter', () => {
      expect(getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, null, '123abc')).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&location=123abc',
      );
    });
    test('should return endpoint with search term and location parameters', () => {
      expect(getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, 'bob', '123abc')).toBe(
        '/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob&location=123abc',
      );
    });
  });

  describe('test getPrescriptionDetailsEndpoint', () => {
    test('should return endpoint with encounter uuid', () => {
      expect(getPrescriptionDetailsEndpoint('123abc')).toBe(
        '/ws/fhir2/R4/MedicationRequest?encounter=123abc&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter',
      );
    });
  });

  describe('test getQuantity', () => {
    test('should return quantity from Medication Request', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 3,
          quantity: {
            value: 5,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(getQuantity(medicationRequest).value).toBe(5);
    });
    test('should return quantity from Medication Dispense', () => {
      const medicationDispense: MedicationDispense = {
        dosageInstruction: undefined,
        id: '',
        location: { display: '', reference: '', type: '' },
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        quantity: {
          value: 5,
          unit: 'mg',
          code: '123abc',
        },
        performer: undefined,
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        subject: { display: '', reference: '', type: '' },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: '',
        whenPrepared: '',
      };
      expect(getQuantity(medicationDispense).value).toBe(5);
    });
  });

  describe('test getQuantityUnitsMatch', () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: undefined,
        quantity: {
          value: 30,
          unit: 'mg',
          code: '123abc',
        },
        validityPeriod: { start: '' },
      },
      dosageInstruction: undefined,
      encounter: { reference: '', type: '' },
      id: '',
      intent: '',
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      priority: '',
      requester: {
        display: '',
        identifier: { value: '' },
        reference: '',
        type: '',
      },
      resourceType: 'MedicationRequest',
      status: MedicationRequestStatus.completed,
      subject: { display: '', reference: '', type: '' },
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationrequest/fulfillerstatus',
          valueCode: MedicationRequestFulfillerStatus.completed,
        },
      ],
    };
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 5,
        unit: 'mg',
        code: '123abc',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    const medicationDispenseNoQuantity: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: undefined,
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    const medicationDispenseDifferentUnits: MedicationDispense = {
      dosageInstruction: undefined,
      id: '',
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 1,
        unit: 'kg',
        code: '456ddef',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',
    };
    test('should return true if all quantity units match or are undefined', () => {
      expect(getQuantityUnitsMatch([medicationDispense, medicationRequest, medicationDispenseNoQuantity])).toBe(true);
    });
    test("should return false if all quantity units don't match", () => {
      expect(
        getQuantityUnitsMatch([
          medicationDispense,
          medicationRequest,
          medicationDispenseNoQuantity,
          medicationDispenseDifferentUnits,
        ]),
      ).toBe(false);
    });
    test('should return true for null input', () => {
      expect(getQuantityUnitsMatch(null)).toBe(true);
    });
    test('should return true for empty input', () => {
      expect(getQuantityUnitsMatch([])).toBe(true);
    });
    test('should return true if all quantity units undefined', () => {
      expect(getQuantityUnitsMatch([medicationDispenseNoQuantity])).toBe(true);
    });
  });

  describe('test getRefillsAllowed', () => {
    test('should return refills allowed from Medication Request', () => {
      const medicationRequest: MedicationRequest = {
        dispenseRequest: {
          numberOfRepeatsAllowed: 3,
          quantity: {
            value: 5,
            unit: 'mg',
            code: '123abc',
          },
          validityPeriod: { start: '' },
        },
        dosageInstruction: undefined,
        encounter: { reference: '', type: '' },
        id: '',
        intent: '',
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        priority: '',
        requester: {
          display: '',
          identifier: { value: '' },
          reference: '',
          type: '',
        },
        resourceType: 'MedicationRequest',
        status: null,
        subject: { display: '', reference: '', type: '' },
      };
      expect(getRefillsAllowed(medicationRequest)).toBe(3);
    });
    test('should return null from Medication Dispense', () => {
      const medicationDispense: MedicationDispense = {
        dosageInstruction: undefined,
        id: '',
        location: { display: '', reference: '', type: '' },
        medicationReference: { display: '', reference: '', type: '' },
        meta: { lastUpdated: '' },
        quantity: {
          value: 5,
          unit: 'mg',
          code: '123abc',
        },
        performer: undefined,
        resourceType: 'MedicationDispense',
        status: MedicationDispenseStatus.completed,
        subject: { display: '', reference: '', type: '' },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: '',
        whenPrepared: '',
      };
      expect(getRefillsAllowed(medicationDispense)).toBeNull();
    });
  });

  describe('test isMostRecentMedicationDispenseStatus', () => {
    const medicationDispense1: MedicationDispense = {
      dosageInstruction: undefined,
      id: 'e74e74a1-6b70-40fd-8c44-485178c71721',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-05T14:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 1,
        unit: '',
        code: '',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.on_hold,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-05T14:00:00-05:00',
      whenPrepared: '2023-01-05T14:00:00-05:00',
    };

    const medicationDispense2: MedicationDispense = {
      dosageInstruction: undefined,
      id: 'f7b5585d-6867-4f3a-8151-da9ee1f70fab',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-05T20:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 1,
        unit: '',
        code: '',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-05T20:00:00-05:00',
      whenPrepared: '2023-01-05T20:00:00-05:00',
    };

    const medicationDispense3: MedicationDispense = {
      dosageInstruction: undefined,
      id: 'a2121f8e-1bcc-4cf9-b1e8-1edace155e7f',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/medicationdispense/recorded',
          valueDateTime: '2023-01-05T17:00:00-05:00',
        },
      ],
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974',
          type: 'MedicationRequest',
        },
      ],
      location: { display: '', reference: '', type: '' },
      medicationReference: { display: '', reference: '', type: '' },
      meta: { lastUpdated: '' },
      quantity: {
        value: 1,
        unit: '',
        code: '',
      },
      performer: undefined,
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.declined,
      subject: { display: '', reference: '', type: '' },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '2023-01-05T17:00:00-05:0',
      whenPrepared: '2023-01-05T17:00:00-05:0',
    };

    const medicationDispenses: Array<MedicationDispense> = [
      medicationDispense1,
      medicationDispense2,
      medicationDispense3,
    ];

    test('should return true if most recent medication request', () => {
      expect(isMostRecentMedicationDispense(medicationDispense2, medicationDispenses)).toBe(true);
    });
    test('should return false if not most recent medication requst', () => {
      expect(isMostRecentMedicationDispense(medicationDispense1, medicationDispenses)).toBe(false);
    });
    test('should return false if null', () => {
      expect(isMostRecentMedicationDispense(null, medicationDispenses)).toBe(false);
    });
  });
});

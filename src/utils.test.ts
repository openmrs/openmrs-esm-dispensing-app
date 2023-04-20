import {
  Coding,
  DosageInstruction,
  Medication,
  MedicationDispense,
  MedicationDispenseStatus,
  MedicationReferenceOrCodeableConcept,
  MedicationRequest,
  MedicationRequestStatus,
} from "./types";
import {
  computeMedicationRequestStatus,
  getAssociatedMedicationDispenses,
  getConceptCoding,
  getConceptCodingDisplay,
  getConceptCodingUuid,
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getMedicationsByConceptEndpoint,
  getMostRecentMedicationDispenseStatus,
  getOpenMRSMedicineDrugName,
  getPrescriptionDetailsEndpoint,
  getPrescriptionTableActiveMedicationRequestsEndpoint,
  getPrescriptionTableAllMedicationRequestsEndpoint,
  getQuantity,
  getRefillsAllowed,
} from "./utils";
import dayjs from "dayjs";

describe("Util Tests", () => {
  test("getDosageInstructions should return first element of dosage instructions array", () => {
    const dosageInstructions: Array<DosageInstruction> = [
      {
        asNeededBoolean: false,
        doseAndRate: undefined,
        route: { coding: undefined },
        text: "first",
        timing: {
          code: { coding: undefined },
          repeat: { duration: 0, durationUnit: "" },
        },
      },
      {
        asNeededBoolean: false,
        doseAndRate: undefined,
        route: { coding: undefined },
        text: "second",
        timing: {
          code: { coding: undefined },
          repeat: { duration: 0, durationUnit: "" },
        },
      },
    ];

    expect(getDosageInstruction(dosageInstructions).text).toBe("first");
  });

  test("getQuantity should return quantity from Medication Request", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 3,
        quantity: {
          value: 5,
          unit: "mg",
          code: "123abc",
        },
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "MedicationRequest",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(getQuantity(medicationRequest).value).toBe(5);
  });

  test("getQuantity should return quantity from Medication Dispense", () => {
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: "",
      location: { display: "", reference: "", type: "" },
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      quantity: {
        value: 5,
        unit: "mg",
        code: "123abc",
      },
      performer: undefined,
      resourceType: "MedicationDispense",
      status: MedicationDispenseStatus.completed,
      subject: { display: "", reference: "", type: "" },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: "",
      whenPrepared: "",
    };
    expect(getQuantity(medicationDispense).value).toBe(5);
  });

  test("getRefillsAllowed should return refills allowed from Medication Request", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 3,
        quantity: {
          value: 5,
          unit: "mg",
          code: "123abc",
        },
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "MedicationRequest",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(getRefillsAllowed(medicationRequest)).toBe(3);
  });

  test("getRefillsAllowed should return null from Medication Dispense", () => {
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: "",
      location: { display: "", reference: "", type: "" },
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      quantity: {
        value: 5,
        unit: "mg",
        code: "123abc",
      },
      performer: undefined,
      resourceType: "MedicationDispense",
      status: MedicationDispenseStatus.completed,
      subject: { display: "", reference: "", type: "" },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: "",
      whenPrepared: "",
    };
    expect(getRefillsAllowed(medicationDispense)).toBeNull();
  });

  test("getMedicationReferenceOrCodeableConcept should return medication reference or codeable concept from Medication Request", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 3,
        quantity: {
          value: 5,
          unit: "mg",
          code: "123abc",
        },
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: {
        display: "",
        reference: "Medication/123abc",
        type: "",
      },
      medicationCodeableConcept: {
        coding: undefined,
        text: "Some concept",
      },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "MedicationRequest",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(
      getMedicationReferenceOrCodeableConcept(medicationRequest)
        .medicationReference.reference
    ).toBe("Medication/123abc");
    expect(
      getMedicationReferenceOrCodeableConcept(medicationRequest)
        .medicationCodeableConcept.text
    ).toBe("Some concept");
  });

  test("getMedicationReferenceOrCodeableConcept should return medication reference or codeable concept from Medication Dispense", () => {
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: "",
      location: { display: "", reference: "", type: "" },
      medicationReference: {
        display: "",
        reference: "Medication/123abc",
        type: "",
      },
      medicationCodeableConcept: {
        coding: undefined,
        text: "Some concept",
      },
      meta: { lastUpdated: "" },
      quantity: {
        value: 5,
        unit: "mg",
        code: "123abc",
      },
      performer: undefined,
      resourceType: "MedicationDispense",
      status: MedicationDispenseStatus.completed,
      subject: { display: "", reference: "", type: "" },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: "",
      whenPrepared: "",
    };
    expect(
      getMedicationReferenceOrCodeableConcept(medicationDispense)
        .medicationReference.reference
    ).toBe("Medication/123abc");
    expect(
      getMedicationReferenceOrCodeableConcept(medicationDispense)
        .medicationCodeableConcept.text
    ).toBe("Some concept");
  });

  test("getPrescriptionDetailsEndpoint should return endpoint witn encounter uuid", () => {
    expect(getPrescriptionDetailsEndpoint("123abc")).toBe(
      "/ws/fhir2/R4/MedicationRequest?encounter=123abc&_revinclude=MedicationDispense:prescription&_include=MedicationRequest:encounter"
    );
  });

  test("getPrescriptionTableActiveMedicationRequestsEndpoint should return endpoint with date parameter", () => {
    expect(
      getPrescriptionTableActiveMedicationRequestsEndpoint(
        1,
        10,
        "2020-01-01",
        null,
        null
      )
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active"
    );
  });

  test("getPrescriptionTableActiveMedicationRequestsEndpoint should return endpoint with date and search term parameters", () => {
    expect(
      getPrescriptionTableActiveMedicationRequestsEndpoint(
        1,
        10,
        "2020-01-01",
        "bob",
        null
      )
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&patientSearchTerm=bob"
    );
  });

  test("getPrescriptionTableActiveMedicationRequestsEndpoint should return endpoint with date and location parameters", () => {
    expect(
      getPrescriptionTableActiveMedicationRequestsEndpoint(
        1,
        10,
        "2020-01-01",
        null,
        "123abc"
      )
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&location=123abc"
    );
  });

  test("getPrescriptionTableActiveMedicationRequestsEndpoint should return endpoint with date, location, and search term parameters", () => {
    expect(
      getPrescriptionTableActiveMedicationRequestsEndpoint(
        1,
        10,
        "2020-01-01",
        "bob",
        "123abc"
      )
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&date=ge2020-01-01&status=active&patientSearchTerm=bob&location=123abc"
    );
  });

  test("getPrescriptionTableAllMedicationRequestsEndpoint should return endpoint", () => {
    expect(
      getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, null, null)
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10"
    );
  });

  test("getPrescriptionTableAllMedicationRequestsEndpoint should return endpoint with search term parameter", () => {
    expect(
      getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, "bob", null)
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob"
    );
  });

  test("getPrescriptionTableAllMedicationRequestsEndpoint should return endpoint with location parameter", () => {
    expect(
      getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, null, "123abc")
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&location=123abc"
    );
  });

  test("getPrescriptionTableAllMedicationRequestsEndpoint should return endpoint with search term and location parameters", () => {
    expect(
      getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, "bob", "123abc")
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob&location=123abc"
    );
  });

  test("getMedicationsByConceptEndpoint should return medications by concept endpoint", () => {
    expect(getMedicationsByConceptEndpoint("123abc")).toBe(
      "/ws/fhir2/R4/Medication?code=123abc"
    );
  });

  test("getConceptCoding should find the concept coding without a system", () => {
    const codings: Array<Coding> = [
      {
        system: "SNOMED",
        code: "123456",
        display: "Weight",
      },
      {
        code: "123abc",
        display: "Weight",
      },
      {
        system: "CIEL",
        code: "abcdef",
        display: "Weight",
      },
    ];

    expect(getConceptCoding(codings).code).toBe("123abc");
  });

  test("getConceptCoding should find the concept coding undefined system", () => {
    const codings: Array<Coding> = [
      {
        system: "SNOMED",
        code: "123456",
        display: "Weight",
      },
      {
        system: undefined,
        code: "123abc",
        display: "Weight",
      },
      {
        system: "CIEL",
        code: "abcdef",
        display: "Weight",
      },
    ];

    expect(getConceptCoding(codings).code).toBe("123abc");
  });

  test("getConceptCodingUuid should find the concept coding uuid without a system", () => {
    const codings: Array<Coding> = [
      {
        system: "SNOMED",
        code: "123456",
        display: "Weight",
      },
      {
        code: "123abc",
        display: "Weight",
      },
      {
        system: "CIEL",
        code: "abcdef",
        display: "Weight",
      },
    ];

    expect(getConceptCodingUuid(codings)).toBe("123abc");
  });

  test("getConceptCodingDisplay should find the concept coding uuid without a system", () => {
    const codings: Array<Coding> = [
      {
        system: "SNOMED",
        code: "123456",
        display: "Weight",
      },
      {
        code: "123abc",
        display: "Weight",
      },
      {
        system: "CIEL",
        code: "abcdef",
        display: "Weight",
      },
    ];
    expect(getConceptCodingDisplay(codings)).toBe("Weight");
  });

  test("getMedicationDisplay should return medication reference display when present", () => {
    const medication: MedicationReferenceOrCodeableConcept = {
      medicationReference: {
        reference: "Medication/123abc",
        display: "Aspirin",
      },
      medicationCodeableConcept: {
        coding: [
          {
            code: "def687",
            display: "Aspirin",
          },
        ],
        text: "Aspirin",
      },
    };
    expect(getMedicationDisplay(medication)).toBe("Aspirin");
  });

  test("getMedicationDisplay should return medication codeable concept when reference not present", () => {
    const medication: MedicationReferenceOrCodeableConcept = {
      medicationCodeableConcept: {
        coding: [
          {
            code: "def687",
            display: "Aspirin",
          },
        ],
        text: "Aspirin",
      },
    };
    expect(getMedicationDisplay(medication)).toBe("Aspirin: Aspirin");
  });

  test("getOpenMRSMedicineDrugName should get drug name stored in FHIR extension", () => {
    const medication: Medication = {
      code: { coding: [], text: "" },
      extension: [
        {
          extension: [
            {
              url: "http://fhir.openmrs.org/ext/medicine#drugName",
              valueString: "Aspirin",
            },
          ],
          url: "http://fhir.openmrs.org/ext/medicine",
        },
      ],
      id: "",
      meta: { lastUpdated: "" },
      resourceType: "Medication",
      status: "",
    };

    expect(getOpenMRSMedicineDrugName(medication)).toBe("Aspirin");
  });

  test("computeStatus should return Cancelled if Medication Request has status cancelled", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: MedicationRequestStatus.cancelled,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 0)).toBe(
      MedicationRequestStatus.cancelled
    );
  });

  test("computeStatus should return Completed if Medication Request has status completed", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: MedicationRequestStatus.completed,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 0)).toBe(
      MedicationRequestStatus.completed
    );
  });

  test("computeStatus should return Expired if Medication Request older than expired timeframe", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: dayjs().subtract(91, "days").toString() },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(
      MedicationRequestStatus.expired
    );
  });

  test("computeStatus should return Expired if Medication Request age is passed expired timeframe", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: dayjs().subtract(91, "days").toString() },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(
      MedicationRequestStatus.expired
    );
  });

  test("computeStatus should return Active if Medication Request age is equal to expired timeframe (even if status is expired)", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: {
          start: dayjs().startOf("day").subtract(90, "days").toString(),
        },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: MedicationRequestStatus.expired,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(
      MedicationRequestStatus.active
    );
  });

  test("computeStatus should return Active if Medication Request is age is less than expired timeframe (even if status is expired)", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: {
          start: dayjs().startOf("day").subtract(90, "days").toString(),
        },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: MedicationRequestStatus.expired,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(
      MedicationRequestStatus.active
    );
  });

  test("computeStatus should return Active as default", () => {
    const medicationRequest: MedicationRequest = {
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      id: "",
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeMedicationRequestStatus(medicationRequest, 90)).toBe(
      MedicationRequestStatus.active
    );
  });

  test("getAssociatedMedicationDispense should return medication dispenses associated with request", () => {
    const medicationRequest: MedicationRequest = {
      id: "1c1ad91e-8653-453a-9f59-8d5c36249aff",
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };

    const medicationDispenses: Array<MedicationDispense> = [
      {
        dosageInstruction: undefined,
        id: "e74e74a1-6b70-40fd-8c44-485178c71721",
        authorizingPrescription: [
          {
            reference: "MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
      {
        dosageInstruction: undefined,
        id: "f7b5585d-6867-4f3a-8151-da9ee1f70fab",
        authorizingPrescription: [
          {
            reference: "MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
      {
        dosageInstruction: undefined,
        id: "a2121f8e-1bcc-4cf9-b1e8-1edace155e7f",
        authorizingPrescription: [
          {
            reference: "MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
      {
        dosageInstruction: undefined,
        id: "b59a6c54-c178-4972-a33b-dfe9f968e71a",
        authorizingPrescription: [
          {
            reference: "MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
    ];
    const results: Array<MedicationDispense> = getAssociatedMedicationDispenses(
      medicationRequest,
      medicationDispenses
    );
    expect(results.length).toBe(2);
    expect(results).toContain(medicationDispenses[1]);
    expect(results).toContain(medicationDispenses[3]);
  });

  test("getAssociatedMedicationDispense should return empty list if no associated requests", () => {
    const medicationRequest: MedicationRequest = {
      id: "1c1ad91e-8653-453a-9f59-8d5c36249aff",
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: undefined,
        validityPeriod: { start: "" },
      },
      dosageInstruction: undefined,
      encounter: { reference: "", type: "" },
      intent: "",
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      priority: "",
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      resourceType: "",
      status: null,
      subject: { display: "", reference: "", type: "" },
    };

    const medicationDispenses: Array<MedicationDispense> = [
      {
        dosageInstruction: undefined,
        id: "e74e74a1-6b70-40fd-8c44-485178c71721",
        authorizingPrescription: [
          {
            reference: "MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
    ];
    const results: Array<MedicationDispense> = getAssociatedMedicationDispenses(
      medicationRequest,
      medicationDispenses
    );
    expect(results.length).toBe(0);
  });

  test("getMostRecentMedicationDispenseStatus should return most recent status", () => {
    const medicationDispenses: Array<MedicationDispense> = [
      {
        dosageInstruction: undefined,
        id: "e74e74a1-6b70-40fd-8c44-485178c71721",
        extension: [
          {
            url: "http://fhir.openmrs.org/ext/dispense/recorded",
            valueDateTime: "2023-01-05T14:00:00-05:00",
          },
        ],
        authorizingPrescription: [
          {
            reference: "MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.on_hold,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
      {
        dosageInstruction: undefined,
        id: "f7b5585d-6867-4f3a-8151-da9ee1f70fab",
        extension: [
          {
            url: "http://fhir.openmrs.org/ext/dispense/recorded",
            valueDateTime: "2023-01-05T20:00:00-05:00",
          },
        ],
        authorizingPrescription: [
          {
            reference: "MedicationRequest/1c1ad91e-8653-453a-9f59-8d5c36249aff",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.completed,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
      {
        dosageInstruction: undefined,
        id: "a2121f8e-1bcc-4cf9-b1e8-1edace155e7f",
        extension: [
          {
            url: "http://fhir.openmrs.org/ext/dispense/recorded",
            valueDateTime: "2023-01-05T17:00:00-05:00",
          },
        ],
        authorizingPrescription: [
          {
            reference: "MedicationRequest/075318da-ce26-4de5-9700-e49820f9d974",
            type: "MedicationRequest",
          },
        ],
        location: { display: "", reference: "", type: "" },
        medicationReference: { display: "", reference: "", type: "" },
        meta: { lastUpdated: "" },
        quantity: {
          value: 1,
          unit: "",
          code: "",
        },
        performer: undefined,
        resourceType: "MedicationDispense",
        status: MedicationDispenseStatus.declined,
        subject: { display: "", reference: "", type: "" },
        substitution: { reason: [], type: undefined, wasSubstituted: false },
        type: undefined,
        whenHandedOver: "",
        whenPrepared: "",
      },
    ];

    expect(getMostRecentMedicationDispenseStatus(medicationDispenses)).toBe(
      MedicationDispenseStatus.completed
    );
  });

  test("getMostRecentMedicationDispenseStatus should return null for null input", () => {
    expect(getMostRecentMedicationDispenseStatus(null)).toBeNull();
  });

  test("getMostRecentMedicationDispenseStatus should return null for empty list", () => {
    expect(getMostRecentMedicationDispenseStatus([])).toBeNull();
  });
});

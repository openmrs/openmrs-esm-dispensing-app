import {
  Coding,
  DosageInstruction,
  Medication,
  MedicationDispense,
  MedicationReferenceOrCodeableConcept,
  MedicationRequest,
} from "./types";
import {
  computeStatus,
  getConceptCoding,
  getConceptCodingDisplay,
  getConceptCodingUuid,
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getMedicationsByConceptEndpoint,
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
      status: "",
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
      status: "active",
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
      status: "",
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
      status: "active",
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
      status: "",
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
      status: "active",
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

  test("getPrescriptionTableActiveMedicationRequestsEndpoint should return endpoint with proper parameters", () => {
    expect(
      getPrescriptionTableActiveMedicationRequestsEndpoint(
        1,
        10,
        "bob",
        "2020-01-01"
      )
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob&date=ge2020-01-01&status=active"
    );
  });

  test("getPrescriptionTableAllMedicationRequestsEndpoint should return endpoint with proper parameters", () => {
    expect(
      getPrescriptionTableAllMedicationRequestsEndpoint(1, 10, "bob")
    ).toBe(
      "/ws/fhir2/R4/Encounter?_query=encountersWithMedicationRequests&_getpagesoffset=1&_count=10&patientSearchTerm=bob"
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
      status: "cancelled",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 0)).toBe("cancelled");
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
      status: "completed",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 0)).toBe("completed");
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
      status: "",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 90)).toBe("expired");
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
      status: "",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 90)).toBe("expired");
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
      status: "expired",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 90)).toBe("active");
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
      status: "expired",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 90)).toBe("active");
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
      status: "",
      subject: { display: "", reference: "", type: "" },
    };
    expect(computeStatus(medicationRequest, 90)).toBe("active");
  });
});

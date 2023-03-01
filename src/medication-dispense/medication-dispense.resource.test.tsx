import React from "react";
import useSWR from "swr";
import { openmrsFetch, Session } from "@openmrs/esm-framework";
import {
  deleteMedicationDispense,
  initiateMedicationDispenseBody,
  saveMedicationDispense,
  useOrderConfig,
  useSubstitutionReasonValueSet,
  useSubstitutionTypeValueSet,
} from "./medication-dispense.resource";
import { MedicationDispense, MedicationRequest } from "../types";
import dayjs from "dayjs";

jest.mock("@openmrs/esm-framework", () => {
  const originalModule = jest.requireActual("@openmrs/esm-framework");
  return {
    __esModule: true,
    ...originalModule,
    openmrsFetch: jest.fn(() => "mocked fetch"),
  };
});

jest.mock("swr");

describe("Medication Dispense Resource tests", () => {
  test("saveMedicationDispense should call medication dispense FHIR endpoint with appropriate data and method POST", () => {
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: "",
      location: { display: "", reference: "", type: "" },
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      quantity: undefined,
      performer: undefined,
      resourceType: "MedicationDispense",
      status: "active",
      subject: { display: "", reference: "", type: "" },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: "",
      whenPrepared: "",
    };
    const abortController: AbortController = {
      signal: undefined,
      abort(reason?: any): void {},
    };

    saveMedicationDispense(medicationDispense, abortController);
    expect(openmrsFetch).toHaveBeenCalledWith(
      "/ws/fhir2/R4/MedicationDispense",
      {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: medicationDispense,
      }
    );
  });

  test("saveMedicationDispense should call medication dispense FHIR endpoint with appropriate data and method PUT", () => {
    const medicationDispense: MedicationDispense = {
      dosageInstruction: undefined,
      id: "123abc",
      location: { display: "", reference: "", type: "" },
      medicationReference: { display: "", reference: "", type: "" },
      meta: { lastUpdated: "" },
      performer: undefined,
      quantity: undefined,
      resourceType: "",
      status: "",
      subject: { display: "", reference: "", type: "" },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: "",
      whenPrepared: "",
    };
    const abortController: AbortController = {
      signal: undefined,
      abort(reason?: any): void {},
    };

    saveMedicationDispense(medicationDispense, abortController);
    expect(openmrsFetch).toHaveBeenCalledWith(
      "/ws/fhir2/R4/MedicationDispense/123abc",
      {
        method: "PUT",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: medicationDispense,
      }
    );
  });

  test("deleteMedicationDispense should call medication request FHIR endpoint with appropriate uuid and method DELETE", () => {
    deleteMedicationDispense("123abc");
    expect(openmrsFetch).toHaveBeenCalledWith(
      "/ws/fhir2/R4/MedicationDispense/123abc",
      { method: "DELETE" }
    );
  });

  test("useOrderConfig should fetch order config via SWR", () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: "mockedOrderConfig" } }));
    const orderConfig = useOrderConfig();
    expect(useSWR).toHaveBeenCalledWith(
      "/ws/rest/v1/orderentryconfig",
      openmrsFetch
    );
    expect(orderConfig.orderConfigObject).toBe("mockedOrderConfig");
  });

  test("useSubstitutionTypeValueSet should call fetch substitution type value set via SWR", () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: "mockedSubstitutionTypeValueSet" },
    }));
    const result = useSubstitutionTypeValueSet("123");
    expect(useSWR).toHaveBeenCalledWith(
      "/ws/fhir2/R4/ValueSet/123",
      openmrsFetch
    );
    expect(result.substitutionTypeValueSet).toBe(
      "mockedSubstitutionTypeValueSet"
    );
  });

  test("useSubstitutionReasonValueSet should call fetch substitution reason value set via SWR", () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: "mockedSubstitutionReasonValueSet" },
    }));
    const result = useSubstitutionReasonValueSet("123");
    expect(useSWR).toHaveBeenCalledWith(
      "/ws/fhir2/R4/ValueSet/123",
      openmrsFetch
    );
    expect(result.substitutionReasonValueSet).toBe(
      "mockedSubstitutionReasonValueSet"
    );
  });

  test("initiateMedicationDispenseBody should initialize medication dispense body from set of requests order", () => {
    const activeMedicationRequest: MedicationRequest = {
      intent: "",
      medicationReference: { reference: "Medication/123abc" },
      meta: { lastUpdated: "" },
      priority: "",
      resourceType: "MedicationDispense",
      status: "active",
      subject: { reference: "Patient/765432" },
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: {
          value: 20.0,
          system: "http://snomed.info/sct",
          code: "123456789",
          unit: "Tablet",
        },
        validityPeriod: { start: "" },
      },
      encounter: { reference: "", type: "" },
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      dosageInstruction: [
        {
          text: "Take with food",
          timing: {
            repeat: {
              duration: 30.0,
              durationUnit: "d",
            },
            code: {
              coding: [
                {
                  code: "",
                },
              ],
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [
              {
                code: "545767",
              },
            ],
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 5.0,
                unit: "Tablet",
                system: "http://snomed.info/sct",
                code: "385055001",
              },
            },
          ],
        },
      ],
      id: "456def",
    };
    const cancelledMedicationRequest: MedicationRequest = {
      intent: "",
      medicationReference: { reference: "Medication/123abc" },
      meta: { lastUpdated: "" },
      priority: "",
      resourceType: "MedicationDispense",
      status: "cancelled",
      subject: { reference: "Patient/765432" },
      dispenseRequest: {
        numberOfRepeatsAllowed: 0,
        quantity: {
          value: 20.0,
          system: "http://snomed.info/sct",
          code: "123456789",
          unit: "Tablet",
        },
        validityPeriod: { start: "" },
      },
      encounter: { reference: "", type: "" },
      requester: {
        display: "",
        identifier: { value: "" },
        reference: "",
        type: "",
      },
      dosageInstruction: [
        {
          text: "Take with food",
          timing: {
            repeat: {
              duration: 30.0,
              durationUnit: "d",
            },
            code: {
              coding: [
                {
                  code: "",
                },
              ],
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [
              {
                code: "545767",
              },
            ],
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 5.0,
                unit: "Tablet",
                system: "http://snomed.info/sct",
                code: "385055001",
              },
            },
          ],
        },
      ],
      id: "456def",
    };
    const session: Session = {
      authenticated: true,
      sessionId: "",
      user: undefined,
      currentProvider: {
        uuid: "ghi789",
        identifier: undefined,
      },
      sessionLocation: {
        uuid: "987654",
        display: undefined,
        links: undefined,
      },
    };
    const medicationRequestExpirationPeriodInDay = 30;

    const dispenseBody: Array<MedicationDispense> =
      initiateMedicationDispenseBody(
        [cancelledMedicationRequest, activeMedicationRequest],
        session,
        medicationRequestExpirationPeriodInDay
      );
    expect(dispenseBody.length).toBe(1); // the cancelled one should be filtered out (we test the computeStatus method more fully in util.ts

    const medicationDispense = dispenseBody[0];
    expect(medicationDispense.id).toBeUndefined();
    expect(medicationDispense.resourceType).toBe("MedicationDispense");
    expect(medicationDispense.medicationReference.reference).toBe(
      "Medication/123abc"
    );
    expect(medicationDispense.status).toBe("completed");
    expect(medicationDispense.authorizingPrescription[0].reference).toBe(
      "MedicationRequest/456def"
    );
    expect(medicationDispense.authorizingPrescription[0].type).toBe(
      "MedicationRequest"
    );
    expect(medicationDispense.medicationCodeableConcept).toBeUndefined();
    expect(medicationDispense.subject.reference).toBe("Patient/765432");
    expect(medicationDispense.performer[0].actor.reference).toBe(
      "Practitioner/ghi789"
    );
    expect(medicationDispense.location.reference).toBe("Location/987654");
    expect(medicationDispense.type.coding[0].code).toBe(
      "04affd1a-49ab-44e5-a6d1-c0a3fffceb7d"
    );
    expect(medicationDispense.quantity.value).toBe(20.0);
    expect(medicationDispense.quantity.system).toBe("http://snomed.info/sct");
    expect(medicationDispense.quantity.unit).toBe("Tablet");
    expect(medicationDispense.quantity.code).toBe("123456789");
    expect(
      dayjs().isSame(dayjs(medicationDispense.whenPrepared), "second")
    ).toBe(true);
    expect(
      dayjs().isSame(dayjs(medicationDispense.whenHandedOver), "second")
    ).toBe(true);
    expect(medicationDispense.dosageInstruction[0].text).toBe("Take with food");
    expect(medicationDispense.dosageInstruction[0].timing.repeat.duration).toBe(
      30.0
    );
    expect(
      medicationDispense.dosageInstruction[0].timing.repeat.durationUnit
    ).toBe("d");
    expect(medicationDispense.dosageInstruction[0].asNeededBoolean).toBe(false);
    expect(medicationDispense.dosageInstruction[0].route.coding[0].code).toBe(
      "545767"
    );
    expect(
      medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity.value
    ).toBe(5);
    expect(
      medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity.system
    ).toBe("http://snomed.info/sct");
    expect(
      medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity.code
    ).toBe("385055001");
    expect(
      medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity.unit
    ).toBe("Tablet");
    expect(medicationDispense.substitution.wasSubstituted).toBe(false);
  });
});

import { render } from "@testing-library/react";
import React from "react";
import ActionButtons from "./action-buttons.component";
import { MedicationRequest, MedicationRequestStatus } from "../types";
import { useConfig } from "@openmrs/esm-framework";

const mockedUseConfig = useConfig as jest.Mock;
const mockPatientUuid = "558494fe-5850-4b34-a3bf-06550334ba4a";
const mockEncounterUuid = "7aee7123-9e50-4f72-a636-895d77a63e98";

describe("Action Buttons Component tests", () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      medicationRequestExpirationPeriodInDays: 90,
      actionButtons: {
        pauseButton: {
          enabled: true,
        },
        closeButton: {
          enabled: true,
        },
      },
    });
  });

  test("component should render dispense button if active medication", () => {
    // status = active, and validity period start set to current datetime
    const medicationRequest: MedicationRequest = {
      resourceType: "MedicationRequest",
      id: "d4f69a68-1171-4e47-8693-478df18daf40",
      meta: {
        lastUpdated: "2023-01-24T19:02:04.000-05:00",
      },
      status: MedicationRequestStatus.active,
      intent: "order",
      priority: "routine",
      medicationReference: {
        reference: "Medication/c8d3444c-41a4-48d3-9ec1-811fe7b27d99",
        type: "Medication",
        display: "Ascorbic acid (Vitamin C), 250mg tablet",
      },
      subject: {
        reference: "Patient/558494fe-5850-4b34-a3bf-06550334ba4a",
        type: "Patient",
        display: "Dylan, Bob (ZL EMR ID: Y2CK2G)",
      },
      encounter: {
        reference: "Encounter/7aee7123-9e50-4f72-a636-895d77a63e98",
        type: "Encounter",
      },
      requester: {
        reference: "Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487",
        type: "Practitioner",
        identifier: {
          value: "MAADH",
        },
        display: "Goodrich, Mark (Identifier: MAADH)",
      },
      dosageInstruction: [
        {
          text: "test",
          timing: {
            repeat: {
              duration: 6,
              durationUnit: "d",
            },
            code: {
              coding: [
                {
                  code: "37328251-6759-4270-8a2e-8cab2c0b315b",
                  display: "OD (once daily)",
                },
                {
                  system: "http://snomed.info/sct",
                  code: "229797004",
                  display: "OD (once daily)",
                },
              ],
              text: "OD (once daily)",
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [
              {
                code: "46aaaca8-1f21-410a-aac9-67bfcc1fd577",
                display: "Oral",
              },
              {
                system: "http://snomed.info/sct",
                code: "26643006",
                display: "Oral",
              },
            ],
            text: "Oral",
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 5.0,
                unit: "Ampule(s)",
                system: "http://snomed.info/sct",
                code: "413516001",
              },
            },
          ],
        },
      ],
      dispenseRequest: {
        validityPeriod: {
          start: new Date().toISOString(),
        },
        numberOfRepeatsAllowed: 8,
        quantity: {
          value: 7.0,
          unit: "Application",
          system: "http://snomed.info/sct",
          code: "413568008",
        },
      },
    };

    const { getByText, container } = render(
      <ActionButtons
        patientUuid={mockPatientUuid}
        encounterUuid={mockEncounterUuid}
        medicationRequest={medicationRequest}
        associatedMedicationDispenses={[]}
      />
    );
    expect(getByText("Dispense")).toBeInTheDocument();
  });

  // status = active, but validity period start time years in the past
  test("component should not render dispense button if expired medication", () => {
    // status = active, and validity period start set to current datetime
    const medicationRequest: MedicationRequest = {
      resourceType: "MedicationRequest",
      id: "d4f69a68-1171-4e47-8693-478df18daf40",
      meta: {
        lastUpdated: "2023-01-24T19:02:04.000-05:00",
      },
      status: MedicationRequestStatus.active,
      intent: "order",
      priority: "routine",
      medicationReference: {
        reference: "Medication/c8d3444c-41a4-48d3-9ec1-811fe7b27d99",
        type: "Medication",
        display: "Ascorbic acid (Vitamin C), 250mg tablet",
      },
      subject: {
        reference: "Patient/558494fe-5850-4b34-a3bf-06550334ba4a",
        type: "Patient",
        display: "Dylan, Bob (ZL EMR ID: Y2CK2G)",
      },
      encounter: {
        reference: "Encounter/7aee7123-9e50-4f72-a636-895d77a63e98",
        type: "Encounter",
      },
      requester: {
        reference: "Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487",
        type: "Practitioner",
        identifier: {
          value: "MAADH",
        },
        display: "Goodrich, Mark (Identifier: MAADH)",
      },
      dosageInstruction: [
        {
          text: "test",
          timing: {
            repeat: {
              duration: 6,
              durationUnit: "d",
            },
            code: {
              coding: [
                {
                  code: "37328251-6759-4270-8a2e-8cab2c0b315b",
                  display: "OD (once daily)",
                },
                {
                  system: "http://snomed.info/sct",
                  code: "229797004",
                  display: "OD (once daily)",
                },
              ],
              text: "OD (once daily)",
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [
              {
                code: "46aaaca8-1f21-410a-aac9-67bfcc1fd577",
                display: "Oral",
              },
              {
                system: "http://snomed.info/sct",
                code: "26643006",
                display: "Oral",
              },
            ],
            text: "Oral",
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 5.0,
                unit: "Ampule(s)",
                system: "http://snomed.info/sct",
                code: "413516001",
              },
            },
          ],
        },
      ],
      dispenseRequest: {
        validityPeriod: {
          start: "2019-01-24T19:02:04.000-05:00",
        },
        numberOfRepeatsAllowed: 8,
        quantity: {
          value: 7.0,
          unit: "Application",
          system: "http://snomed.info/sct",
          code: "413568008",
        },
      },
    };

    const { queryByText, container } = render(
      <ActionButtons
        patientUuid={mockPatientUuid}
        encounterUuid={mockEncounterUuid}
        medicationRequest={medicationRequest}
        associatedMedicationDispenses={[]}
      />
    );
    expect(queryByText("Dispense")).not.toBeInTheDocument();
  });
});

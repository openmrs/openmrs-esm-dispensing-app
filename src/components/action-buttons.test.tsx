import React from 'react';
import { render } from '@testing-library/react';
import { useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import { computeMedicationRequestStatus, getMostRecentMedicationDispenseStatus } from '../utils';
import { MedicationDispenseStatus, type MedicationRequest, MedicationRequestStatus } from '../types';
import ActionButtons from './action-buttons.component';
import CloseActionButton from './prescription-actions/close-action-button.component';
import DispenseActionButton from './prescription-actions/dispense-action-button.component';
import PauseActionButton from './prescription-actions/pause-action-button.component';

const mockedUseConfig = jest.mocked(useConfig);
const mockedExtensionSlot = jest.mocked(ExtensionSlot);
const mockPatientUuid = '558494fe-5850-4b34-a3bf-06550334ba4a';
const mockEncounterUuid = '7aee7123-9e50-4f72-a636-895d77a63e98';

const medicationRequest: MedicationRequest = {
  resourceType: 'MedicationRequest',
  id: 'd4f69a68-1171-4e47-8693-478df18daf40',
  meta: {
    lastUpdated: '2023-01-24T19:02:04.000-05:00',
  },
  status: MedicationRequestStatus.active,
  intent: 'order',
  priority: 'routine',
  medicationReference: {
    reference: 'Medication/c8d3444c-41a4-48d3-9ec1-811fe7b27d99',
    type: 'Medication',
    display: 'Ascorbic acid (Vitamin C), 250mg tablet',
  },
  subject: {
    reference: 'Patient/558494fe-5850-4b34-a3bf-06550334ba4a',
    type: 'Patient',
    display: 'Dylan, Bob (ZL EMR ID: Y2CK2G)',
  },
  encounter: {
    reference: 'Encounter/7aee7123-9e50-4f72-a636-895d77a63e98',
    type: 'Encounter',
  },
  requester: {
    reference: 'Practitioner/19e06fb0-22ea-4dd4-aafd-da14c14a1487',
    type: 'Practitioner',
    identifier: {
      value: 'MAADH',
    },
    display: 'Goodrich, Mark (Identifier: MAADH)',
  },
  dosageInstruction: [
    {
      text: 'test',
      timing: {
        repeat: {
          duration: 6,
          durationUnit: 'd',
        },
        code: {
          coding: [
            {
              code: '37328251-6759-4270-8a2e-8cab2c0b315b',
              display: 'OD (once daily)',
            },
            {
              system: 'http://snomed.info/sct',
              code: '229797004',
              display: 'OD (once daily)',
            },
          ],
          text: 'OD (once daily)',
        },
      },
      asNeededBoolean: false,
      route: {
        coding: [
          {
            code: '46aaaca8-1f21-410a-aac9-67bfcc1fd577',
            display: 'Oral',
          },
          {
            system: 'http://snomed.info/sct',
            code: '26643006',
            display: 'Oral',
          },
        ],
        text: 'Oral',
      },
      doseAndRate: [
        {
          doseQuantity: {
            value: 5.0,
            unit: 'Ampule(s)',
            system: 'http://snomed.info/sct',
            code: '413516001',
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
      unit: 'Application',
      system: 'http://snomed.info/sct',
      code: '413568008',
    },
  },
};

const medicationRequestStatus = computeMedicationRequestStatus(medicationRequest, 90);
const mostRecentMedicationDispenseStatus: MedicationDispenseStatus = getMostRecentMedicationDispenseStatus([]);

const prescriptionActionsState = {
  dispensable:
    medicationRequestStatus === MedicationRequestStatus.active &&
    mostRecentMedicationDispenseStatus !== MedicationDispenseStatus.declined,
  pauseable: true,
  closeable: true,
  quantityRemaining: 0,
  quantityDispensed: 0,
  patientUuid: mockPatientUuid,
  encounterUuid: mockEncounterUuid,
  medicationRequestBundle: { request: medicationRequest, dispenses: [] },
  session: undefined,
  providers: [],
};

describe('Action Buttons Component tests', () => {
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
      dispenseBehavior: {
        allowModifyingPrescription: false,
        restrictTotalQuantityDispensed: false,
      },
    });
  });

  test('component should render dispense button if active medication', () => {
    // status = active, and validity period start set to current datetime
    mockedExtensionSlot.mockImplementationOnce(() => (
      <div>
        <DispenseActionButton {...prescriptionActionsState} />
        <PauseActionButton {...prescriptionActionsState} />
        <CloseActionButton {...prescriptionActionsState} />
      </div>
    ));

    const { getByText, container } = render(
      <ActionButtons
        patientUuid={mockPatientUuid}
        encounterUuid={mockEncounterUuid}
        medicationRequestBundle={{ request: medicationRequest, dispenses: [] }}
      />,
    );
    expect(getByText('Dispense')).toBeInTheDocument();
  });

  // status = active, but validity period start time years in the past
  test('component should not render dispense button if expired medication', () => {
    const expiredMedicationRequest = {
      ...medicationRequest,
      dispenseRequest: {
        ...medicationRequest.dispenseRequest,
        validityPeriod: {
          start: '2019-01-24T19:02:04.000-05:00',
        },
      },
    };

    // Recalculate status with expired medication
    const expiredMedicationRequestStatus = computeMedicationRequestStatus(expiredMedicationRequest, 90);
    const mostRecentDispenseStatus = getMostRecentMedicationDispenseStatus([]);

    // Create new state with expired medication
    const expiredPrescriptionActionsState = {
      ...prescriptionActionsState,
      dispensable:
        expiredMedicationRequestStatus === MedicationRequestStatus.active &&
        mostRecentDispenseStatus !== MedicationDispenseStatus.declined,
      medicationRequestBundle: {
        request: expiredMedicationRequest,
        dispenses: [],
      },
    };

    mockedExtensionSlot.mockImplementationOnce(() => (
      <div>
        <DispenseActionButton {...expiredPrescriptionActionsState} />
        <PauseActionButton {...expiredPrescriptionActionsState} />
        <CloseActionButton {...expiredPrescriptionActionsState} />
      </div>
    ));

    const { queryByText } = render(
      <ActionButtons
        patientUuid={mockPatientUuid}
        encounterUuid={mockEncounterUuid}
        medicationRequestBundle={{ request: expiredMedicationRequest, dispenses: [] }}
      />,
    );

    expect(queryByText('Dispense')).not.toBeInTheDocument();
  });
});

/* eslint-disable @typescript-eslint/await-thenable */
import { type APIRequestContext, expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Patient } from '../commands';
import { type Encounter } from './types';
import { type MedicationRequest } from '../../src/types';

export const generateRandomMedicationRequest = async (
  fhirApi: APIRequestContext,
  patient: Patient,
  encounter: Encounter,
  providerUuid: string,
  drugOrder: Order,
): Promise<MedicationRequest> => {
  const dispense = await fhirApi.post('MedicationRequest?_summary=data', {
    data: {
      resourceType: 'MedicationDispense',
      medicationReference: {
        reference: 'Medication/',
      },
      encounter: encounter,
      intent: String,
      priority: String,
      subject: patient,
      requester: [
        {
          actor: {
            reference: providerUuid,
          },
        },
      ],
      quantity: {
        value: 1,
        unit: 'Tablet',
        code: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
      asNeededBoolean: false,
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      dosageInstruction: [
        {
          timing: {
            code: {
              coding: [
                {
                  code: '160862AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  display: 'Once daily',
                },
                {
                  system: 'https://cielterminology.org',
                  code: '160862',
                },
                {
                  system: 'http://snomed.info/sct/',
                  code: '229797004',
                },
              ],
              text: 'Once daily',
            },
          },
          asNeededBoolean: false,
          route: {
            coding: [
              {
                code: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                display: 'Oral',
              },
              {
                system: 'https://cielterminology.org',
                code: '160240',
              },
              {
                system: 'http://snomed.info/sct/',
                code: '26643006',
              },
            ],
            text: 'Oral',
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 1,
                unit: 'Milligram',
                code: '161553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              },
            },
          ],
        },
      ],
    },
  });
  await expect(dispense.ok()).toBeTruthy();
  return await dispense.json();
};

export const deleteMedicationRequest = async (fhirApi: APIRequestContext, uuid: string) => {
  await fhirApi.delete(`MedicationDispense/${uuid}`, { data: {} });
};

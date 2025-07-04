/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/await-thenable */
import { type APIRequestContext, expect } from '@playwright/test';
import { type Patient } from '../commands';
import { MedicationDispenseStatus, type MedicationDispense } from '../../src/types';
import { type Provider } from '../commands/types';

export const generateMedicationDispense = async (
  fhirApi: APIRequestContext,
  patient: Patient,
  provider: Provider,
  // medicationRequest: MedicationRequest,
): Promise<MedicationDispense> => {
  const dispense = await fhirApi.post('MedicationDispense?_summary=data', {
    data: {
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      authorizingPrescription: [
        {
          reference: 'MedicationRequest/03f95e47-243a-4f5e-997f-e8a86122c7bf',
          type: 'MedicationRequest',
        },
      ],
      medicationReference: {
        reference: 'Medication/09e58895-e7f0-4649-b7c0-e665c5c08e93',
        type: 'Medication',
        display: 'Aspirin 81mg',
      },
      subject: {
        reference: `Patient/${patient.uuid}`,
      },
      performer: [
        {
          actor: {
            reference: `Practitioner/${provider.uuid}`,
          },
        },
      ],
      location: {
        reference: `Location/${process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID}`,
      },
      substitution: { reason: [], type: undefined, wasSubstituted: false },
      type: undefined,
      whenHandedOver: '',
      whenPrepared: '',

      quantity: {
        value: 5,
        code: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        unit: 'Tablet',
      },
      dosageInstruction: [
        {
          text: '',
          timing: {
            repeat: {
              durationUnit: 'd',
            },
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
  console.log(dispense.json);
  return await dispense.json();
};

export const deleteMedicationDespense = async (fhirApi: APIRequestContext, id: string) => {
  await fhirApi.delete(`MedicationDispense/${id}`, { data: {} });
};

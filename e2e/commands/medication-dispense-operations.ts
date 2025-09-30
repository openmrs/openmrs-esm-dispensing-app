import dayjs from 'dayjs';
import { type APIRequestContext, expect } from '@playwright/test';
import { type Patient } from '.';
import { type Provider } from './types';
import { MedicationDispenseStatus, type MedicationDispense } from '../../src/types';

export const generateMedicationDispense = async (
  fhirApi: APIRequestContext,
  patient: Patient,
  provider: Provider,
  medicationRequestUuid: string,
): Promise<MedicationDispense> => {
  const dispense = await fhirApi.post('MedicationDispense', {
    data: {
      resourceType: 'MedicationDispense',
      status: MedicationDispenseStatus.completed,
      authorizingPrescription: [
        {
          reference: `MedicationRequest/${medicationRequestUuid}`,
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
      whenHandedOver: dayjs().format(),
      quantity: {
        value: 5,
        code: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        unit: 'Tablet',
      },
      dosageInstruction: [
        {
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

  expect(dispense.ok()).toBeTruthy();
  return await dispense.json();
};

export const deleteMedicationDispense = async (fhirApi: APIRequestContext, id: string) => {
  await fhirApi.delete(`MedicationDispense/${id}`);
};

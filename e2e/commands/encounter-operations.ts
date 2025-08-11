/* eslint-disable @typescript-eslint/await-thenable */
import { type APIRequestContext } from '@playwright/test';
import { type Encounter } from './types';
import { type Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export const createEncounter = async (
  api: APIRequestContext,
  patientId: string,
  providerId: string,
  visit: Visit,
): Promise<Encounter> => {
  // Backend validates: encounter >= visit.start AND encounter < current time
  const visitStart = dayjs(visit.startDatetime);
  const now = dayjs();

  // Calculate a safe encounter time: after visit start but before now
  const visitPlusOneMin = visitStart.add(1, 'minute');
  const nowMinusTenSec = now.subtract(10, 'seconds');

  // Choose the encounter time that satisfies both constraints
  let finalEncounterTime;
  if (visitPlusOneMin.isBefore(nowMinusTenSec)) {
    // Visit + 1min is safely in the past
    finalEncounterTime = visitPlusOneMin;
  } else if (visitStart.isBefore(nowMinusTenSec)) {
    // Visit start is before now-10sec, so use now-10sec
    finalEncounterTime = nowMinusTenSec;
  } else {
    // Visit just started - ensure encounter is after visit start but before now
    const visitPlusSmall = visitStart.add(100, 'milliseconds');
    // Always use visit + 100ms to ensure it's after visit start, regardless of now
    finalEncounterTime = visitPlusSmall;
  }

  // Format to match backend expectations
  const encounterDatetime = finalEncounterTime.utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + '+0000';

  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime,
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      visit: visit,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: providerId,
        },
      ],
      location: process.env.E2E_DEFAULT_LOGIN_LOCATION_UUID,
      encounterType: '39da3525-afe4-45ff-8977-c53b7b359158',
    },
  });

  if (!encounterRes.ok()) {
    const errorBody = await encounterRes.text();
    console.error('Encounter creation failed with status:', encounterRes.status());
    console.error('Error response:', errorBody);
    throw new Error(`Encounter creation failed: ${encounterRes.status()} - ${errorBody}`);
  }

  return await encounterRes.json();
};

export const deleteEncounter = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`encounter/${uuid}`, { data: {} });
};

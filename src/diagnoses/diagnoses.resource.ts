import { type FetchResponse, openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

export const usePatientDiagnosis = (encounterUuid: string) => {
  const customRepresentation =
    'custom:(uuid,display,visit:(uuid,patient,encounters:(uuid,diagnoses:(uuid,display,certainty,diagnosis:(coded:(uuid,display))),encounterDatetime,encounterType:(uuid,display),encounterProviders:(uuid,display,provider:(uuid,person:(uuid,display)))),location:(uuid,name,display),visitType:(uuid,name,display),startDatetime,stopDatetime))';
  const url = `${restBaseUrl}/encounter/${encounterUuid}?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWR<FetchResponse<{ visit: Visit }>>(url, openmrsFetch);

  const diagnoses = useMemo(() => {
    return (
      data?.data?.visit?.encounters?.flatMap(
        (encounter) =>
          encounter.diagnoses.map((diagnosis) => ({
            id: diagnosis.diagnosis.coded.uuid,
            text: diagnosis.display,
            certainty: diagnosis.certainty,
          })) || [],
      ) || []
    );
  }, [data]);

  return {
    error,
    isLoading,
    diagnoses: (diagnoses ?? []) as Array<{ id: string; text: string; certainty: string }>,
  };
};

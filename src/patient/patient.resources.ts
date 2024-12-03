import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const usePatientAge = (patienUuid: string) => {
  const customRep = 'custom:(age)';
  const url = `${restBaseUrl}/person/${patienUuid}?v=${customRep}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ age: number }>>(url, openmrsFetch);
  return {
    age: data?.data?.age,
    error,
    isLoading,
    mutate,
  };
};

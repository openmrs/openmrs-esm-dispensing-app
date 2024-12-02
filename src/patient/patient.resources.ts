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

export function concatAgePatientDisplay(input: string, age: number): string | null {
  const attrIndex = input.lastIndexOf(')');
  return input.slice(0, attrIndex) + ', Age: ' + age + input.slice(attrIndex);
}

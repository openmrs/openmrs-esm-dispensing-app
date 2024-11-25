import { type FetchResponse, fhirBaseUrl, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type PharmacyConfig } from '../config-schema';
import { useMemo } from 'react';

export interface ConditionsBundle {
  resourceType: string;
  id: string;
  meta: Meta;
  type: string;
  total: number;
  link: Array<Link>;
  entry: Array<Entry>;
}

export interface Meta {
  lastUpdated: string;
  tag: Array<Tag>;
}

export interface Tag {
  system: string;
  code: string;
  display: string;
}

export interface Link {
  relation: string;
  url: string;
}

export interface Entry {
  fullUrl: string;
  resource: Resource;
}

export interface Resource {
  resourceType: string;
  id: string;
  meta: ResourceMeta;
  clinicalStatus: ClinicalStatus;
  code: Code;
  subject: Subject;
  onsetDateTime: string;
  recordedDate: string;
  recorder: Recorder;
}

export interface ResourceMeta {
  versionId: string;
  lastUpdated: string;
  tag: Array<ResourceMetaTag>;
}

export interface ResourceMetaTag {
  system: string;
  code: string;
  display: string;
}

export interface ClinicalStatus {
  coding: Array<Coding>;
}

export interface Coding {
  system: string;
  code: string;
}

export interface Code {
  coding: Array<ConditionCoding>;
  text: string;
}

export interface ConditionCoding {
  code: string;
  display?: string;
  system?: string;
}

export interface Subject {
  reference: string;
  type: string;
  display: string;
}

export interface Recorder {
  reference: string;
  type: string;
  display: string;
}

export interface Condition {
  status?: 'active' | 'inactive';
  display: string;
  patient: string;
  onsetDateTime: string;
  recordedDate: string;
  recorder: string;
}

export const usePatientConditions = (patientUuid: string) => {
  const { showPatientConditions } = useConfig<PharmacyConfig>();
  const url = `${fhirBaseUrl}/Condition?patient=${patientUuid}&_count=100&_summary=data`;
  const { data, isLoading, mutate, error } = useSWR<FetchResponse<ConditionsBundle>>(
    showPatientConditions ? url : null,
    openmrsFetch,
  );

  const conditions = useMemo(() => {
    return data?.data?.entry?.reduce<Array<Condition>>((prev, entry) => {
      if (entry?.resource?.resourceType === 'Condition') {
        const condition: Condition = {
          display: entry?.resource?.code?.text,
          onsetDateTime: entry?.resource?.onsetDateTime,
          patient: entry?.resource?.subject?.display,
          recordedDate: entry?.resource?.recordedDate,
          recorder: entry?.resource?.recorder?.display,
          status: entry?.resource?.clinicalStatus?.coding[0]?.code as any,
        };
        return [...prev, condition];
      }
      return prev;
    }, []);
  }, [data]);
  return {
    conditions: (conditions ?? []).filter((condition) => condition.status === 'active'),
    isLoading,
    error,
    mutate,
    showPatientConditions,
  };
};

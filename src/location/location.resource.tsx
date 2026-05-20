import useSWR from 'swr';
import {
  type FetchResponse,
  type Location,
  openmrsFetch,
  restBaseUrl,
  useFeatureFlag,
  useSession,
} from '@openmrs/esm-framework';
import { type SimpleLocation } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { useMemo } from 'react';

export class MissingOptionalBackendDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingOptionalBackendDependencyError';
  }
}

/**
 * Returns the list of locations to show in the location filter dropdown, based on the configuration. If the
 * restrictToVisitLocationDescendants option is enabled, only returns locations that are descendants of the current login
 * location's nearest ancestor tagged as a visit location.
 * Location options are further filtered with the tag specified in the configuration.
 */
export function useLocations(config: PharmacyConfig) {
  const { restrictToVisitLocationDescendants } = config.locationBehavior;
  const byTag = useLocationsByTag(config, !restrictToVisitLocationDescendants);
  const byVisit = useVisitLocationDescendants(config, restrictToVisitLocationDescendants);
  return restrictToVisitLocationDescendants ? byVisit : byTag;
}

function toSimpleLocation(associatedPharmacyLocationAttribute: string) {
  return (e: Location): SimpleLocation => ({
    id: e.uuid,
    name: e.name,
    associatedPharmacyLocation:
      e.attributes?.find((a) => a.attributeType.name === associatedPharmacyLocationAttribute)?.value?.uuid ?? null,
  });
}

function useLocationsByTag(config: PharmacyConfig, enabled: boolean) {
  const { tag, associatedPharmacyLocationAttribute } = config.locationBehavior.locationFilter;
  const url = enabled
    ? `${restBaseUrl}/location?tag=${encodeURIComponent(tag)}&v=custom:(uuid,name,attributes:(attributeType:(name),value:(uuid)))`
    : null;
  const { data, ...rest } = useSWR<FetchResponse<{ results: Location[] }>>(url, openmrsFetch);

  const locations = useMemo(
    () =>
      (data?.data?.results ?? [])
        .map(toSimpleLocation(associatedPharmacyLocationAttribute))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data, associatedPharmacyLocationAttribute],
  );

  return { locations, ...rest };
}

function useVisitLocationDescendants(config: PharmacyConfig, enabled: boolean) {
  const { sessionLocation } = useSession();
  const { tag, associatedPharmacyLocationAttribute } = config.locationBehavior.locationFilter;
  const isEMRAPIInstalled = useFeatureFlag('emrapi-module');

  const configError = useMemo(
    () =>
      enabled && !isEMRAPIInstalled
        ? new MissingOptionalBackendDependencyError(
            'The restrictToVisitLocationDescendants option is enabled in the configuration, but the EMR API module is not installed.',
          )
        : null,
    [enabled, isEMRAPIInstalled],
  );

  const url =
    enabled && !configError && sessionLocation?.uuid
      ? `${restBaseUrl}/emrapi/locationThatSupportsVisits?location=${sessionLocation.uuid}&v=custom:(uuid,name,descendantLocations:(uuid,name,tags,attributes:(attributeType:(name),value:(uuid))))`
      : null;
  const { data, ...rest } = useSWR<FetchResponse<{ descendantLocations: Location[] }>>(url, openmrsFetch);

  const locations = useMemo(
    () =>
      (data?.data?.descendantLocations ?? [])
        // emrapi/locationThatSupportsVisits does not support server-side tag filtering, so we filter client-side
        .filter((l) => l.tags?.some((t) => t.display === tag))
        .map(toSimpleLocation(associatedPharmacyLocationAttribute))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data, tag, associatedPharmacyLocationAttribute],
  );

  return { locations, ...rest, error: configError ?? rest.error };
}

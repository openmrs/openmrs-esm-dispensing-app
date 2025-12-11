import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type SimpleLocation } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { useMemo } from 'react';

export function useLocationsForFiltering(config: PharmacyConfig) {
  const { data, error } = useSWR<FetchResponse, Error>(
    `${restBaseUrl}/location?tag=${encodeURIComponent(config.locationBehavior.locationFilter.tag)}&v=custom:(uuid,name,attributes:(attributeType:(name),value:(uuid))`,
    openmrsFetch,
  );

  // parse down to a simple representation of locations
  const filterLocations: Array<SimpleLocation> = useMemo(() => {
    return data?.data?.results
      ?.map((e) => ({
        id: e.uuid,
        name: e.name,
        associatedPharmacyLocation:
          e.attributes?.find(
            (a) => a.attributeType.name === config.locationBehavior.locationFilter.associatedPharmacyLocationAttribute,
          )?.value?.uuid ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.data?.results, config]);

  return {
    filterLocations,
    error,
    isLoading: !filterLocations && !error,
  };
}

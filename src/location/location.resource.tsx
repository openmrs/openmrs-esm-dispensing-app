import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type SimpleLocation } from '../types';
import { type PharmacyConfig } from '../config-schema';
import { useMemo } from 'react';

export function useLocations(config: PharmacyConfig) {
  const { data, error } = useSWR<FetchResponse, Error>(
    `${restBaseUrl}/location?tag=${encodeURIComponent(config.locationBehavior.locationFilter.tag)}&v=custom:(uuid,name,attributes:(attributeType:(name),value:(uuid))`,
    openmrsFetch,
  );

  // parse down to a simple representation of locations
  const locations: Array<SimpleLocation> = useMemo(() => {
    return data?.data?.results
      ?.map((e) => ({
        id: e.uuid,
        name: e.name,
        associatedPharmacyLocations:
          e.attributes
            ?.filter(
              (a) =>
                a.attributeType.name === config.locationBehavior.locationFilter.associatedPharmacyLocationAttribute,
            )
            ?.map((a) => a.value.uuid) ?? [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.data?.results, config]);

  return {
    locations,
    error,
    isLoading: !locations && !error,
  };
}

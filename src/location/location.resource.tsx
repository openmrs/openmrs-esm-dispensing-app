import useSWR from "swr";
import { fhirBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { LocationResponse, SimpleLocation } from "../types";
import { PharmacyConfig } from "../config-schema";

export function useLocationForFiltering(config: PharmacyConfig) {
  const { data, error } = useSWR<{ data: LocationResponse }, Error>(
    `${fhirBaseUrl}/Location?_tag=${encodeURIComponent(
      config.locationBehavior.locationFilter.tag
    )}&_count=100`,
    openmrsFetch
  );

  // parse down to a simple representation of locations
  const filterLocations: Array<SimpleLocation> = data?.data?.entry
    ?.map((e) => ({
      id: e.resource.id,
      name: e.resource.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    filterLocations,
    isError: error,
    isLoading: !filterLocations && !error,
  };
}

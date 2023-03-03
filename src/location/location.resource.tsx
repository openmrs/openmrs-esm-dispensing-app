import useSWR from "swr";
import { fhirBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import { LocationResponse, LoginLocation } from "../types";

export function useLoginLocations() {
  const { data, error } = useSWR<{ data: LocationResponse }, Error>(
    `${fhirBaseUrl}/Location?_tag=login%20location&_count=100`,
    openmrsFetch
  );

  // parse down to a simple representation of locations
  const loginLocations: Array<LoginLocation> = data?.data?.entry
    ?.map((e) => ({
      id: e.resource.id,
      name: e.resource.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    loginLocations,
    isError: error,
    isLoading: !loginLocations && !error,
  };
}

import { fhirBaseUrl, openmrsFetch } from "@openmrs/esm-framework";
import useSWR from "swr";
import { DispensePayload } from "../types";

export function saveMedicationDispense(
  medicationDispense: DispensePayload,
  abortController: AbortController
) {
  return openmrsFetch(`${fhirBaseUrl}/MedicationDispense`, {
    method: "POST",
    signal: abortController.signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: medicationDispense,
  });
}

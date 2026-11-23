import { vi, describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fhirBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';
import { usePatientConditions } from './conditions.resource';

const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);

describe('usePatientConditions', () => {
  it('requests only active problem-list conditions for the patient', () => {
    mockUseFhirFetchAll.mockReturnValue({ data: [], isLoading: false, error: undefined, mutate: vi.fn() } as any);

    renderHook(() => usePatientConditions('123abc'));

    expect(mockUseFhirFetchAll).toHaveBeenCalledWith(
      `${fhirBaseUrl}/Condition?patient=123abc&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item&_summary=data&clinical-status=active`,
    );
  });
});

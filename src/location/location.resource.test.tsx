import useSWR from 'swr';
import { vi, describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { openmrsFetch, useFeatureFlag, useSession } from '@openmrs/esm-framework';
import { MissingOptionalBackendDependencyError, useLocations } from './location.resource';
import { type PharmacyConfig } from '../config-schema';

const mockUseFeatureFlag = vi.mocked(useFeatureFlag);
const mockUseSession = vi.mocked(useSession);

vi.mocked(openmrsFetch);
vi.mock('swr');

const pharmacyConfig: PharmacyConfig = {
  drugOrderTypeUUID: '',
  appName: '',
  actionButtons: {
    pauseButton: {
      enabled: true,
    },
    closeButton: {
      enabled: true,
    },
    printPrescriptionsButton: {
      enabled: true,
    },
  },
  dispenseBehavior: {
    allowModifyingPrescription: false,
    restrictTotalQuantityDispensed: false,
  },
  dispenserProviderRoles: [],
  locationBehavior: {
    locationColumn: { enabled: false },
    locationFilter: {
      enabled: false,
      tag: 'Login Location',
      associatedPharmacyLocationAttribute: 'Associated Pharmacy Location',
    },
    restrictToVisitLocationDescendants: false,
  },
  refreshInterval: 10000,
  medicationRequestExpirationPeriodInDays: 0,
  valueSets: {
    reasonForPause: { uuid: '' },
    reasonForClose: { uuid: '' },
    substitutionReason: { uuid: '' },
    substitutionType: { uuid: '' },
  },
  enableStockDispense: false,
  completeOrderWithThisDispense: false,
  validateBatch: false,
  enableDuplicateDispenseCheck: true,
  leftNavMode: 'collapsed',
  customTabs: [],
  duplicateCheckWindowDays: 0,
};

describe('useLocations', () => {
  it('should call proper endpoint via SWR', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: 'mockedLoginLocations' },
    }));

    renderHook(() => useLocations(pharmacyConfig));
    expect(useSWR).toHaveBeenCalledWith(
      '/ws/rest/v1/location?tag=Login%20Location&v=custom:(uuid,name,attributes:(attributeType:(name),value:(uuid)))',
      openmrsFetch,
    );
  });
  it('should parse into Locations Array', () => {
    // @ts-ignore
    const queryResultsBundle = {
      results: [
        {
          uuid: '2bcb9215-8cd6-11eb-b7be-0242ac110002',
          name: 'KGH Triage',
          attributes: [],
        },
        {
          uuid: '5981f962-6eec-453d-89ce-2f9ac48d096f',
          name: 'KGH MCH',
          attributes: [
            {
              attributeType: {
                name: 'Associated Pharmacy Location',
              },
              value: {
                uuid: '84b9b680-786c-4388-9e7c-805614c13b5a',
              },
            },
          ],
        },
        {
          uuid: '7b959d2f-11f3-4611-b2e4-700200625d61',
          name: 'KGH NCD',
          attributes: [],
        },
      ],
    };

    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: queryResultsBundle } }));
    const { result } = renderHook(() => useLocations(pharmacyConfig));
    const { locations } = result.current;
    expect(locations.length).toBe(3);
    // should be sorted by name alphabetically
    expect(locations[0].id).toBe('5981f962-6eec-453d-89ce-2f9ac48d096f');
    expect(locations[0].name).toBe('KGH MCH');
    expect(locations[0].associatedPharmacyLocation).toBe('84b9b680-786c-4388-9e7c-805614c13b5a');
    expect(locations[1].id).toBe('7b959d2f-11f3-4611-b2e4-700200625d61');
    expect(locations[1].name).toBe('KGH NCD');
    expect(locations[1].associatedPharmacyLocation).toBe(null);
    expect(locations[2].id).toBe('2bcb9215-8cd6-11eb-b7be-0242ac110002');
    expect(locations[2].name).toBe('KGH Triage');
    expect(locations[2].associatedPharmacyLocation).toBe(null);
  });

  describe('when restrictToVisitLocationDescendants is true', () => {
    const visitLocationConfig: PharmacyConfig = {
      ...pharmacyConfig,
      locationBehavior: {
        ...pharmacyConfig.locationBehavior,
        restrictToVisitLocationDescendants: true,
      },
    };

    it('returns MissingOptionalBackendDependencyError when emrapi is not installed', () => {
      mockUseFeatureFlag.mockReturnValue(false);
      // @ts-ignore
      useSWR.mockReturnValue({ data: null });

      const { result } = renderHook(() => useLocations(visitLocationConfig));
      expect(result.current.error).toBeInstanceOf(MissingOptionalBackendDependencyError);
    });

    it('calls the emrapi endpoint when emrapi is installed and session location is set', () => {
      mockUseFeatureFlag.mockReturnValue(true);
      // @ts-ignore
      mockUseSession.mockReturnValue({ sessionLocation: { uuid: 'session-location-uuid' } });
      // @ts-ignore
      useSWR.mockReturnValue({ data: null });

      renderHook(() => useLocations(visitLocationConfig));
      expect(useSWR).toHaveBeenCalledWith(
        '/ws/rest/v1/emrapi/locationThatSupportsVisits?location=session-location-uuid&v=custom:(uuid,name,descendantLocations:(uuid,name,tags,attributes:(attributeType:(name),value:(uuid))))',
        openmrsFetch,
      );
    });

    it('returns descendant locations filtered by tag and sorted by name', () => {
      // @ts-ignore
      mockUseSession.mockReturnValue({ sessionLocation: { uuid: 'session-location-uuid' } });
      const queryResultsBundle = {
        descendantLocations: [
          {
            uuid: 'loc-1',
            name: 'KGH Triage',
            tags: [{ display: 'Login Location' }],
            attributes: [],
          },
          {
            uuid: 'loc-2',
            name: 'KGH MCH',
            tags: [{ display: 'Login Location' }],
            attributes: [{ attributeType: { name: 'Associated Pharmacy Location' }, value: { uuid: 'pharm-uuid' } }],
          },
          {
            uuid: 'loc-3',
            name: 'KGH Admin',
            tags: [{ display: 'Some Other Tag' }],
            attributes: [],
          },
        ],
      };
      // @ts-ignore
      useSWR.mockReturnValue({ data: { data: queryResultsBundle } });

      const { result } = renderHook(() => useLocations(visitLocationConfig));
      const { locations } = result.current;

      // loc-3 is filtered out because it doesn't have the 'Login Location' tag
      expect(locations.length).toBe(2);
      expect(locations[0].id).toBe('loc-2');
      expect(locations[0].name).toBe('KGH MCH');
      expect(locations[0].associatedPharmacyLocation).toBe('pharm-uuid');
      expect(locations[1].id).toBe('loc-1');
      expect(locations[1].name).toBe('KGH Triage');
      expect(locations[1].associatedPharmacyLocation).toBe(null);
    });
  });
});

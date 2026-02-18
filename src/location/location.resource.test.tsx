import useSWR from 'swr';
import { renderHook } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useLocations } from './location.resource';
import { type PharmacyConfig } from '../config-schema';

jest.mocked(openmrsFetch);
jest.mock('swr');

const pharmacyConfig: PharmacyConfig = {
  appName: '',
  actionButtons: {
    pauseButton: {
      enabled: true,
    },
    closeButton: {
      enabled: true,
    },
  },
  dispenseBehavior: {
    allowModifyingPrescription: false,
    restrictTotalQuantityDispensed: false,
    endActiveVisitOnCompletingOrder: false,
  },
  dispenserProviderRoles: [],
  locationBehavior: {
    locationColumn: { enabled: false },
    locationFilter: {
      enabled: false,
      tag: 'Login Location',
      associatedPharmacyLocationAttribute: 'Associated Pharmacy Location',
    },
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
  leftNavMode: 'collapsed',
  customTabs: [],
};

describe('Location Resource tests', () => {
  test('useLoginLocations should call proper endpoint via SWR', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: 'mockedLoginLocations' },
    }));

    renderHook(() => useLocations(pharmacyConfig));
    expect(useSWR).toHaveBeenCalledWith(
      '/ws/rest/v1/location?tag=Login%20Location&v=custom:(uuid,name,attributes:(attributeType:(name),value:(uuid))',
      openmrsFetch,
    );
  });
  test('useLoginLocations should parse into Login Locations Array', () => {
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
});

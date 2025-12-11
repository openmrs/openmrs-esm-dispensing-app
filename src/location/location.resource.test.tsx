import useSWR from 'swr';
import { renderHook } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useLocationsForFiltering } from './location.resource';
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

    renderHook(() => useLocationsForFiltering(pharmacyConfig));
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
    const { result } = renderHook(() => useLocationsForFiltering(pharmacyConfig));
    const { filterLocations } = result.current;
    expect(filterLocations.length).toBe(3);
    // should be sorted by name alphabetically
    expect(filterLocations[0].id).toBe('5981f962-6eec-453d-89ce-2f9ac48d096f');
    expect(filterLocations[0].name).toBe('KGH MCH');
    expect(filterLocations[0].associatedPharmacyLocation).toBe('84b9b680-786c-4388-9e7c-805614c13b5a');
    expect(filterLocations[1].id).toBe('7b959d2f-11f3-4611-b2e4-700200625d61');
    expect(filterLocations[1].name).toBe('KGH NCD');
    expect(filterLocations[1].associatedPharmacyLocation).toBe(null);
    expect(filterLocations[2].id).toBe('2bcb9215-8cd6-11eb-b7be-0242ac110002');
    expect(filterLocations[2].name).toBe('KGH Triage');
    expect(filterLocations[2].associatedPharmacyLocation).toBe(null);
  });
});

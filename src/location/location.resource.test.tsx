import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useLocationForFiltering } from './location.resource';
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
    locationFilter: { enabled: false, tag: 'Login Location' },
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
};

describe('Location Resource tests', () => {
  test('useLoginLocations should call proper endpoint via SWR', () => {
    // @ts-ignore
    useSWR.mockImplementation(() => ({
      data: { data: 'mockedLoginLocations' },
    }));

    useLocationForFiltering(pharmacyConfig);
    expect(useSWR).toHaveBeenCalledWith('/ws/fhir2/R4/Location?_tag=Login%20Location&_count=100', openmrsFetch);
  });
  test('useLoginLocations should parse into Login Locations Array', () => {
    // @ts-ignore
    const queryResultsBundle = {
      resourceType: 'Bundle',
      id: '1a3e8986-84bb-4382-b215-0f952a09cd2f',
      meta: {
        lastUpdated: '2023-03-01T19:14:41.542-05:00',
      },
      type: 'searchset',
      total: 41,
      link: [
        {
          relation: 'self',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4/Location?_tag=login%20location',
        },
        {
          relation: 'next',
          url: 'http://localhost:8080/openmrs/ws/fhir2/R4?_getpages=220bb352-01cd-4a9b-a54f-85f40eee268c&_getpagesoffset=10&_count=10&_bundletype=searchset',
        },
      ],
      entry: [
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Location/083e75b0-5959-11e4-8ed6-0800200c9a66',
          resource: {
            resourceType: 'Location',
            id: '083e75b0-5959-11e4-8ed6-0800200c9a66',
            meta: {
              lastUpdated: '2022-07-25T14:30:53.000-04:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Order Radiology Study Location',
                  display: 'Signifies a Location where a radiology study can be ordered',
                },
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Transfer Location',
                  display: 'Patients may only be transfer to inpatient care in a location with this tag',
                },
              ],
            },
            text: {
              status: 'generated',
            },
            status: 'active',
            name: "Women's Clinic",
            description: "Women's Clinic",
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Location/11857d81-5959-11e4-8ed6-0800200c9a66',
          resource: {
            resourceType: 'Location',
            id: '11857d81-5959-11e4-8ed6-0800200c9a66',
            meta: {
              lastUpdated: '2022-07-25T14:30:53.000-04:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Archives Location',
                  display: 'A location that serves as an archives for storing medical records',
                },
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Check-In Location',
                  display: 'Signifies a Location where the check-in app and form should be available',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><h2>CDI Klinik Ekstèn Jeneral Achiv Santral</h2></div>',
            },
            status: 'active',
            name: "Men's Clinic",
            description: "Men's Clinic",
          },
        },
        {
          fullUrl: 'http://localhost:8080/openmrs/ws/fhir2/R4/Location/11857d80-5959-11e4-8ed6-0800200c9a66',
          resource: {
            resourceType: 'Location',
            id: '11857d80-5959-11e4-8ed6-0800200c9a66',
            meta: {
              lastUpdated: '2022-07-25T14:30:53.000-04:00',
              tag: [
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Check-In Location',
                  display: 'Signifies a Location where the check-in app and form should be available',
                },
                {
                  system: 'http://fhir.openmrs.org/ext/location-tag',
                  code: 'Registration Location',
                  display: 'Signifies a Location where the registration app should be available',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml"><h2>CDI Klinik Ekstèn Jeneral Biwo Randevou</h2></div>',
            },
            status: 'active',
            name: 'Inpatient Ward',
            description: 'Inpatient Ward',
          },
        },
      ],
    };

    // @ts-ignore
    useSWR.mockImplementation(() => ({ data: { data: queryResultsBundle } }));
    const { filterLocations } = useLocationForFiltering(pharmacyConfig);
    expect(filterLocations.length).toBe(3);
    expect(filterLocations[0].id).toBe('11857d80-5959-11e4-8ed6-0800200c9a66');
    expect(filterLocations[0].name).toBe('Inpatient Ward');
    expect(filterLocations[1].id).toBe('11857d81-5959-11e4-8ed6-0800200c9a66');
    expect(filterLocations[1].name).toBe("Men's Clinic");
    expect(filterLocations[2].id).toBe('083e75b0-5959-11e4-8ed6-0800200c9a66');
    expect(filterLocations[2].name).toBe("Women's Clinic");
  });
});

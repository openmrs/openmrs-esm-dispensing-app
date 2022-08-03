export const ordersMock = {
  data: [
    {
      uuid: "8f9e24b4-0498-493c-b87c-ae1535551345",
      orderNumber: "ORD-1",
      accessionNumber: null,
      patient: {
        uuid: "96be32d2-9367-4d1d-a285-79a5e5db12b8",
        display: "1000C6 - Elizabeth Johnson",
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/patient/96be32d2-9367-4d1d-a285-79a5e5db12b8",
          },
        ],
      },
      concept: {
        uuid: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        display: "Pulse",
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/concept/5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          },
        ],
      },
      action: "NEW",
      careSetting: {
        uuid: "c365e560-c3ec-11e3-9c1a-0800200c9a66",
        display: "Inpatient",
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/caresetting/c365e560-c3ec-11e3-9c1a-0800200c9a66",
          },
        ],
      },
      previousOrder: null,
      dateActivated: "2018-10-16T12:08:43.000+0000",
      scheduledDate: null,
      dateStopped: null,
      autoExpireDate: null,
      encounter: {
        uuid: "69f83020-caf2-4c9e-bca7-89b8e62b52e1",
        display: "Vitals 08/10/2016",
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/encounter/69f83020-caf2-4c9e-bca7-89b8e62b52e1",
          },
        ],
      },
      orderer: {
        uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
        display: "UNKNOWN - Super User",
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/provider/f9badd80-ab76-11e2-9e96-0800200c9a66",
          },
        ],
      },
      orderReason: null,
      orderReasonNonCoded: null,
      orderType: {
        uuid: "52a447d3-a64a-11e3-9aeb-50e549534c5e",
        display: "Test Order",
        name: "Test Order",
        javaClassName: "org.openmrs.TestOrder",
        retired: false,
        description: "Order type for test orders",
        conceptClasses: [],
        parent: null,
        links: [
          {
            rel: "self",
            uri: "/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e",
          },
          {
            rel: "full",
            uri: "/openmrs/ws/rest/v1/ordertype/52a447d3-a64a-11e3-9aeb-50e549534c5e?v=full",
          },
        ],
        resourceVersion: "1.10",
      },
      urgency: "ROUTINE",
      instructions: null,
      commentToFulfiller: null,
      display: "Pulse",
      specimenSource: null,
      laterality: null,
      clinicalHistory: null,
      frequency: null,
      numberOfRepeats: null,
      links: [
        {
          rel: "self",
          uri: "/openmrs/ws/rest/v1/order/8f9e24b4-0498-493c-b87c-ae1535551345",
        },
        {
          rel: "full",
          uri: "/openmrs/ws/rest/v1/order/8f9e24b4-0498-493c-b87c-ae1535551345?v=full",
        },
      ],
      type: "testorder",
      resourceVersion: "1.10",
    },
  ],
};

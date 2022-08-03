export const mockOrderEncounters = {
  resourceType: "Bundle",
  id: "7f3bd7a9-b62d-41f6-ab33-60c14bbace7d",
  meta: {
    lastUpdated: "2022-07-12T13:45:21.028+00:00",
  },
  type: "searchset",
  total: 1151,
  link: [
    {
      relation: "self",
      url: "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter?_has%3AMedicationRequest%3Aencounter%3Aintent=order&_revinclude=MedicationRequest%3Aencounter&_tag=http%3A%2F%2Ffhir.openmrs.org%2Fext%2Fencounter-tag%7Cencounter",
    },
    {
      relation: "next",
      url: "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4?_getpages=630bb048-61e2-47ad-800c-b7dea9dda6e2&_getpagesoffset=10&_count=10&_bundletype=searchset",
    },
  ],
  entry: [
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/962d392c-8466-4558-8e15-14038162e4cf",
      resource: {
        resourceType: "Encounter",
        id: "962d392c-8466-4558-8e15-14038162e4cf",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>962d392c-8466-4558-8e15-14038162e4cf</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> Vitals </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Period:</td><td>2021-05-26 13:42:49.0 - ?</td></tr><tr><td>Part Of:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Encounter/349ab0c2-46ed-41a6-bedd-52b12525d970">Encounter/349ab0c2-46ed-41a6-bedd-52b12525d970</a></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "3a1e9dfd-d814-416e-82e2-25012ef68a30",
            recorded: "2021-05-26T13:42:50.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "67a71486-1a54-468f-ac3e-7091a9a79584",
                display: "Vitals",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        period: {
          start: "2021-05-26T13:42:49+00:00",
        },
        partOf: {
          reference: "Encounter/349ab0c2-46ed-41a6-bedd-52b12525d970",
          type: "Encounter",
        },
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/8d42f377-0680-4a08-9e51-f2a3eb07917e",
      resource: {
        resourceType: "Encounter",
        id: "8d42f377-0680-4a08-9e51-f2a3eb07917e",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8d42f377-0680-4a08-9e51-f2a3eb07917e</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 11:47:17.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/ba685651-ed3b-4e63-9b35-78893060758a">Inpatient Ward</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "3eff6023-50ab-4a85-9a38-5376048876b2",
            recorded: "2021-06-07T12:31:14.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T11:47:17+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/ba685651-ed3b-4e63-9b35-78893060758a",
              type: "Location",
              display: "Inpatient Ward",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/d8f2341c-57d0-4663-84c9-00e0a4455d85",
      resource: {
        resourceType: "Encounter",
        id: "d8f2341c-57d0-4663-84c9-00e0a4455d85",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>d8f2341c-57d0-4663-84c9-00e0a4455d85</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 11:47:17.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/ba685651-ed3b-4e63-9b35-78893060758a">Inpatient Ward</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "3ecf8771-27d0-4e1f-b7d6-57abb75b28f3",
            recorded: "2021-06-07T12:31:28.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T11:47:17+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/ba685651-ed3b-4e63-9b35-78893060758a",
              type: "Location",
              display: "Inpatient Ward",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/6f81d7e6-8e40-4d34-bcb9-24c9ae26e426",
      resource: {
        resourceType: "Encounter",
        id: "6f81d7e6-8e40-4d34-bcb9-24c9ae26e426",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6f81d7e6-8e40-4d34-bcb9-24c9ae26e426</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 11:47:17.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/ba685651-ed3b-4e63-9b35-78893060758a">Inpatient Ward</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "360167d1-7dfa-4e83-a694-9e41af7de186",
            recorded: "2021-06-07T12:46:27.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T11:47:17+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/ba685651-ed3b-4e63-9b35-78893060758a",
              type: "Location",
              display: "Inpatient Ward",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/65ddcf69-611f-49d6-a80e-ff18b83bc94e",
      resource: {
        resourceType: "Encounter",
        id: "65ddcf69-611f-49d6-a80e-ff18b83bc94e",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>65ddcf69-611f-49d6-a80e-ff18b83bc94e</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 11:47:17.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/ba685651-ed3b-4e63-9b35-78893060758a">Inpatient Ward</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "27e462de-0005-4f53-9bf8-917f48e36cf3",
            recorded: "2021-06-07T12:46:35.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T11:47:17+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/ba685651-ed3b-4e63-9b35-78893060758a",
              type: "Location",
              display: "Inpatient Ward",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/6301f6bd-e821-440d-bd3b-8cbed017a6ff",
      resource: {
        resourceType: "Encounter",
        id: "6301f6bd-e821-440d-bd3b-8cbed017a6ff",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>6301f6bd-e821-440d-bd3b-8cbed017a6ff</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 14:42:00.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/28066518-a0e5-4331-b23e-7b40f96d733a">MCH Clinic</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "8c6b498a-8e23-4b38-b86e-bfee6afcba57",
            recorded: "2021-06-07T14:42:26.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T14:42:00+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/28066518-a0e5-4331-b23e-7b40f96d733a",
              type: "Location",
              display: "MCH Clinic",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/5643e409-a6ae-4f4b-9c12-fafd7e329a4a",
      resource: {
        resourceType: "Encounter",
        id: "5643e409-a6ae-4f4b-9c12-fafd7e329a4a",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5643e409-a6ae-4f4b-9c12-fafd7e329a4a</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 14:42:44.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/28066518-a0e5-4331-b23e-7b40f96d733a">MCH Clinic</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "da6f801c-0cc5-433b-91f5-7bacaf8b7cce",
            recorded: "2021-06-07T14:45:51.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T14:42:44+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/28066518-a0e5-4331-b23e-7b40f96d733a",
              type: "Location",
              display: "MCH Clinic",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/c9cda785-9974-41e8-b220-fd23b10e7d1e",
      resource: {
        resourceType: "Encounter",
        id: "c9cda785-9974-41e8-b220-fd23b10e7d1e",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>c9cda785-9974-41e8-b220-fd23b10e7d1e</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-07 18:19:27.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/28066518-a0e5-4331-b23e-7b40f96d733a">MCH Clinic</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "e0435634-2e97-4c2a-a79b-1da3f80c041a",
            recorded: "2021-06-07T18:19:37.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-07T18:19:27+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/28066518-a0e5-4331-b23e-7b40f96d733a",
              type: "Location",
              display: "MCH Clinic",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/5fb181c8-1a67-40bf-b02d-211b7615ee84",
      resource: {
        resourceType: "Encounter",
        id: "5fb181c8-1a67-40bf-b02d-211b7615ee84",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>5fb181c8-1a67-40bf-b02d-211b7615ee84</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-08 09:57:27.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/28066518-a0e5-4331-b23e-7b40f96d733a">MCH Clinic</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "7dca9136-9063-4a67-8035-36331951ac1d",
            recorded: "2021-06-08T09:58:24.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-08T09:57:27+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/28066518-a0e5-4331-b23e-7b40f96d733a",
              type: "Location",
              display: "MCH Clinic",
            },
          },
        ],
      },
    },
    {
      fullUrl:
        "http://ohri-dev.globalhealthapp.net/openmrs/ws/fhir2/R4/Encounter/8005981f-ab7d-4091-8953-0f36b644d092",
      resource: {
        resourceType: "Encounter",
        id: "8005981f-ab7d-4091-8953-0f36b644d092",
        meta: {
          tag: [
            {
              system: "http://fhir.openmrs.org/ext/encounter-tag",
              code: "encounter",
              display: "Encounter",
            },
          ],
        },
        text: {
          status: "generated",
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><table class="hapiPropertyTable"><tbody><tr><td>Id:</td><td>8005981f-ab7d-4091-8953-0f36b644d092</td></tr><tr><td>Status:</td><td>UNKNOWN</td></tr><tr><td>Class:</td><td> (Details: http://terminology.hl7.org/CodeSystem/v3-ActCode ) </td></tr><tr><td>Type:</td><td> HTS Retrospective </td></tr><tr><td>Subject:</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8">John Doe (OpenMRS ID: 100000Y)</a></td></tr><tr><td>Participants:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Type</th><th>Period</th><th>Individual</th></tr><tr><td>1</td><td/><td/><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Practitioner/bc450226-4138-40b7-ad88-9c98df687738">Super User (Identifier: adminl)</a></td></tr></tbody></table></td></tr><tr><td>Period:</td><td>2021-06-18 10:52:17.0 - ?</td></tr><tr><td>Location:</td><td><table class="subPropertyTable"><tbody><tr><th>-</th><th>Location</th><th>Status</th><th>Physical Type</th><th>Period</th></tr><tr><td>1</td><td><a href="http://localhost:8080/openmrs/ws/fhir2/R4/Location/44c3efb0-2583-4c80-a79e-1f756a03c0a1">Outpatient Clinic</a></td><td/><td/><td/></tr></tbody></table></td></tr></tbody></table></div>',
        },
        contained: [
          {
            resourceType: "Provenance",
            id: "d899270f-c05b-4e10-b3e6-6881b7b4f78a",
            recorded: "2021-06-18T10:52:33.000+00:00",
            activity: {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystemv3-DataOperation",
                  code: "CREATE",
                  display: "create",
                },
              ],
            },
            agent: [
              {
                type: {
                  coding: [
                    {
                      system:
                        "http://terminology.hl7.org/CodeSystemprovenance-participant-type",
                      code: "author",
                      display: "Author",
                    },
                  ],
                },
                role: [
                  {
                    coding: [
                      {
                        system:
                          "http://terminology.hl7.org/CodeSystemv3-ParticipationType",
                        code: "AUT",
                        display: "author",
                      },
                    ],
                  },
                ],
                who: {
                  reference:
                    "Practitioner/82f18b44-6814-11e8-923f-e9a88dcb533f",
                  type: "Practitioner",
                  display: "Super User",
                },
              },
            ],
          },
        ],
        status: "unknown",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "AMB",
        },
        type: [
          {
            coding: [
              {
                system: "http://fhir.openmrs.org/code-system/encounter-type",
                code: "79c1f50f-f77d-42e2-ad2a-d29304dde2fe",
                display: "HTS Retrospective",
              },
            ],
          },
        ],
        subject: {
          reference: "Patient/b280078a-c0ce-443b-9997-3c66c63ec2f8",
          type: "Patient",
          display: "John Doe (OpenMRS ID: 100000Y)",
        },
        participant: [
          {
            individual: {
              reference: "Practitioner/bc450226-4138-40b7-ad88-9c98df687738",
              type: "Practitioner",
              identifier: {
                value: "adminl",
              },
              display: "Super User (Identifier: adminl)",
            },
          },
        ],
        period: {
          start: "2021-06-18T10:52:17+00:00",
        },
        location: [
          {
            location: {
              reference: "Location/44c3efb0-2583-4c80-a79e-1f756a03c0a1",
              type: "Location",
              display: "Outpatient Clinic",
            },
          },
        ],
      },
    },
  ],
};

import { Type } from '@openmrs/esm-framework';

/**
 * This is the config schema. It expects a configuration object which
 * looks like this:
 *
 * ```json
 * { "casualGreeting": true, "whoToGreet": ["Mom"] }
 * ```
 *
 * In OpenMRS Microfrontends, all config parameters are optional. Thus,
 * all elements must have a reasonable default. A good default is one
 * that works well with the reference application.
 *
 * To understand the schema below, please read the configuration system
 * documentation:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config
 * Note especially the section "How do I make my module configurable?"
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=im-developing-an-esm-module-how-do-i-make-it-configurable
 * and the Schema Reference
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=schema-reference
 */
export const configSchema = {
  appName: {
    _type: Type.String,
    _default: 'Pharmacy',
  },
  actionButtons: {
    pauseButton: {
      enabled: {
        _type: Type.Boolean,
        _description: 'Enabled/Disable including a Pause button in the button action bar',
        _default: true,
      },
    },
    closeButton: {
      enabled: {
        _type: Type.Boolean,
        _description: 'Enabled/Disable including a Close button in the button action bar',
        _default: true,
      },
    },
  },
  dispenseBehavior: {
    allowModifyingPrescription: {
      _type: Type.Boolean,
      _description:
        'Enable/Disable editing the prescription. If Disabled, Quantity will be he only editable field on prescription form. Note that thins means that quantity units will need to be mandatory and set correctly on the prescription.',
      _default: true,
    },
    restrictTotalQuantityDispensed: {
      _type: Type.Boolean,
      _description:
        'Enable/Disable restricting dispensing quantity greater than total quantity ordered. Marks prescription as complete when total quantity dispensed. If true, allowModifyingPrescription *must* be false, as this functionality relies solely on numeric quantity and assumes no change in formulation, dosage, unit, etc',
      _default: false,
    },
  },
  dispenserProviderRoles: {
    _type: Type.Array,
    _description:
      'Array of provider roles uuids.  If specified, only providers with these roles will be listed in the "Dispensed By" dropdown.  Note that this simply restricts the providers that can be recorded as Dispensers, it does not limit who can create dispense events.',
    _default: [],
  },
  medicationRequestExpirationPeriodInDays: {
    _type: Type.Number,
    _description: 'Medication Requests older that this will be considered expired',
    _default: 90,
  },
  locationBehavior: {
    locationColumn: {
      enabled: {
        _type: Type.Boolean,
        _description:
          'Enabled/Disable including a Location column in the main prescriptions table showing ordering location',
        _default: false,
      },
    },
    locationFilter: {
      enabled: {
        _type: Type.Boolean,
        _description: 'Enable/Disable Location filter on main prescriptions page',
        _default: false,
      },
      tag: {
        _type: Type.String,
        _description: 'Name of the location tag to use when fetching locations to populate filter',
        _default: 'Login Location',
      },
    },
  },
  refreshInterval: {
    _type: Type.Number,
    _description: 'The interval, in milliseconds, to query the backend for new/changed data',
    _default: 60000,
  },
  valueSets: {
    reasonForPause: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Pause' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/168099/",
        _default: '2dd3e5c0-3d3f-4f3d-9860-19b3f9ab26ff',
      },
    },
    reasonForClose: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Close' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/168099/",
        _default: 'bd6c1fc2-7cfc-4562-94a0-e4765e5e977e',
      },
    },
    substitutionReason: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Substitution' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167862/",
        _default: 'de8671b8-ed2e-4f7e-a9f8-dcd00878f2eb',
      },
    },
    substitutionType: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Type of Substitution' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167859/",
        _default: 'b9c5bca0-d026-4245-a4d2-e4c0a8999082',
      },
    },
  },
  enableStockDispense: {
    _type: Type.Boolean,
    _description:
      'Enable or disable stock deduction during the dispensing process. Requires the stock management module to be installed and configured.',
    _default: false,
  },
  endVisitOnDispense: {
    enabled: {
      _type: Type.Boolean,
      _description:
        'Enables or disables the ending of the current visit upon medication dispensing. This config also determines whether we show the close visit check box on the dispense form. When set to true, the system will attempt to end the visit after a successful medication dispense, subject to the conditions specified in the "visitTypes" config.',
      _default: false,
    },
    visitTypesUuids: {
      _type: Type.Array,
      _description:
        'Specifies a list of visit type UUIDs that are eligible for ending upon medication dispensing. If enabled, only visits of these types will be closed. An empty array means no visit types are eligible for closure. This setting is only relevant when "enabled" is set to true.',
      _default: [],
    },
  },
};

export interface PharmacyConfig {
  appName: string;
  actionButtons: {
    pauseButton: {
      enabled: boolean;
    };
    closeButton: {
      enabled: boolean;
    };
  };
  refreshInterval: number;
  dispenseBehavior: {
    allowModifyingPrescription: boolean;
    restrictTotalQuantityDispensed: boolean;
  };
  dispenserProviderRoles: [];
  medicationRequestExpirationPeriodInDays: number;
  locationBehavior: {
    locationColumn: {
      enabled: boolean;
    };
    locationFilter: {
      enabled: boolean;
      tag: string;
    };
  };
  valueSets: {
    reasonForPause: {
      uuid: string;
    };
    reasonForClose: {
      uuid: string;
    };
    substitutionReason: {
      uuid: string;
    };
    substitutionType: {
      uuid: string;
    };
  };
  enableStockDispense: boolean;
  endVisitOnDispense?: {
    enabled: boolean;
    visitTypesUuids: Array<string>;
  };
}

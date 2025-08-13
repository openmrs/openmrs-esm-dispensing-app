import { Type, validators } from '@openmrs/esm-framework';

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
        _default: '2462a9d7-61fb-4bf5-9359-aedecb8d03cb',
      },
    },
    reasonForClose: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Close' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/168099/",
        _default: '2462a9d7-61fb-4bf5-9359-aedecb8d03cb',
      },
    },
    substitutionReason: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Substitution' question. Defaults to CIEL value set: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167862/",
        _default: '2de6e1be-f2dd-4ba0-9516-8a611aa2af9b',
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
  validateBatch: {
    _type: Type.Boolean,
    _description:
      'Enable or disable stock item batch number validation. Requires the stock management module to be installed and configured.',
    _default: true,
  },
  leftNavMode: {
    _type: Type.String,
    _description: 'Sets the left nav mode for the dispensing app.',
    _validators: [validators.oneOf(['normal', 'collapsed', 'hidden'])],
    _default: 'collapsed',
  },
  completeOrderWithThisDispense: {
    _type: Type.Boolean,
    _description: 'Enable or disable the "Complete order with this dispense" checkbox on the dispense form.',
    _default: false,
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
  completeOrderWithThisDispense: boolean;
  validateBatch: boolean;
  leftNavMode: 'normal' | 'collapsed' | 'hidden';
}

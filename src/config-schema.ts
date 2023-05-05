import { Type } from "@openmrs/esm-framework";

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
    _default: "Pharmacy",
  },
  actionButtons: {
    pauseButton: {
      enabled: {
        _type: Type.Boolean,
        _description:
          "Enabled/Disable including a Pause button in the button action bar",
        _default: true,
      },
    },
    closeButton: {
      enabled: {
        _type: Type.Boolean,
        _description:
          "Enabled/Disable including a Close button in the button action bar",
        _default: true,
      },
    },
  },
  dispenseBehavior: {
    allowModifyingPrescription: {
      _type: Type.Boolean,
      _description:
        "Enable/Disable editing the prescription. If Disabled, Quantity will be he only editable field on prescription form",
      _default: false,
    },
    restrictTotalQuantityDispensed: {
      _type: Type.Boolean,
      _description:
        "Enable/Disable restricting dispensing quantity greater than total quantity ordered. Marks prescription as complete when total quantity dispensed. If true, allowModifyingPrescription *must* be false, as this functionality relies solely on numeric quantity and assumes no change in formulation, dosage, unit, etc",
      _default: false,
    },
  },
  medicationRequestExpirationPeriodInDays: {
    _type: Type.Number,
    _description:
      "Medication Requests older that this will be considered expired",
    _default: 90,
  },
  locationBehavior: {
    locationColumn: {
      enabled: {
        _type: Type.Boolean,
        _description:
          "Enabled/Disable including a Location column in the main prescriptions table showing ordering location",
        _default: false,
      },
    },
    locationFilter: {
      enabled: {
        _type: Type.Boolean,
        _description:
          "Enable/Disable Location filter on main prescriptions page",
        _default: false,
      },
      tag: {
        _type: Type.String,
        _description:
          "Name of the location tag to use when fetching locations to populate filter",
        _default: "Login Location",
      },
    },
  },
  valueSets: {
    reasonForPause: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Pause' question.",
        _default: "",
      },
    },
    reasonForClose: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Close' question.",
        _default: "",
      },
    },
    substitutionReason: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Reason for Substitution' question. Sample CIEL concept: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167862/",
        _default: "",
      },
    },
    substitutionType: {
      uuid: {
        _type: Type.UUID,
        _description:
          "UUID for the Value Set of valid answers to the 'Type of Substitution' question. Sample CIEL concept: https://app.openconceptlab.org/#/orgs/CIEL/sources/CIEL/concepts/167859/",
        _default: "",
      },
    },
  },
};

export type PharmacyConfig = {
  appName: string;
  actionButtons: {
    pauseButton: {
      enabled: boolean;
    };
    closeButton: {
      enabled: boolean;
    };
  };
  dispenseBehavior: {
    allowModifyingPrescription: boolean;
    restrictTotalQuantityDispensed: boolean;
  };
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
};

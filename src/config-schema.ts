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
};

export type PharmacyConfig = {
  appName: string;
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
  substitutionReason: {
    uuid: string;
  };
  substitutionType: {
    uuid: string;
  };
};

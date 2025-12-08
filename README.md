![Node.js CI](https://github.com/openmrs/openmrs-esm-dispensing-app/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Dispensing App

This repository is for the OpenMRS Dispensing App. For more information, please see the
[OpenMRS Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/sQubAQ).

## Required Configuration

The Dispensing ESM requires the "HL7-MedicationDispenseStatus" concept source and FHIR concept source, as well as "Medication Dispense Status" value/concept set, to be installed in your OpenMRS instance to properly map dispensing statuses.

References to the Iniz files that install these concept sources can be found here:

1. [Concept Sources Configuration](https://github.com/openmrs/openmrs-content-referenceapplication/blob/main/configuration/backend_configuration/conceptsources/conceptsources.csv#L24)

2. [FHIR Concept Sources Configuration](https://github.com/openmrs/openmrs-content-referenceapplication/blob/main/configuration/backend_configuration/fhirconceptsources/fhirconceptsources.csv#L5)

You can also manually configure these concept sources in your OpenMRS instance by adding the fhirConceptSource Mapping in the fhir_concept_source table with url `http://terminology.hl7.org/CodeSystem/medicationdispense-status` and name as `HL7-MedicationDispenseStatus`.  Also make sure it relates to a similar mapping in the concept_reference_source table.

To manually configure the concept sources, you'll need to:

1. **Add FHIR Concept Source Mapping:**
   - Table: `fhir_concept_source`
   - URL: `http://terminology.hl7.org/CodeSystem/medicationdispense-status`
   - Name: `HL7-MedicationDispenseStatus`

2. **Add Concept Reference Source Mapping:**
   - Table: `concept_reference_source`
   - Create a corresponding mapping that relates to the FHIR concept source above

These mappings enable the dispensing app to properly handle medication dispense statuses according to HL7 FHIR standards.

The Medication Dispense Status value set can be found [in this OCL search](https://app.openconceptlab.org/#/search/?q=medication+dispense+status).

It also is bundled in the "DrugDispense" OCL package provided by the Reference Application: [OpenMRS refapp distro package](https://github.com/openmrs/openmrs-distro-referenceapplication/tree/main/distro/configuration/ocl).

The "DrugDispense" also provides the default value sets for the "Substitution Type", "Substitution Reason", and "Medication Dispense Status Reason".

The "Substitution Type" and "Substitution Reason" value sets define the valid answers for both the equivalent questions when substituting a drug.  The "Medication Dispense Status Reason" provides the default answers for both the "Reason for Pause" and "Reason for Close" questions.

All of these can be customized via the config-schema, see: [config-schema](https://github.com/openmrs/openmrs-esm-dispensing-app/blob/main/src/config-schema.ts).

## Required privileges

Note that following privileges need to be installed and assigned to roles:

- `Task: dispensing.create.dispense` - Allows user to Dispense Medication
- `Task: dispensing.create.dispense.andModifyDetails` - Allows user to modify the Quantity, Drug, Formulation and Dose Instructions (from the values specified in the Order / Medication Request) when Dispensing
- `Task: dispensing.edit.dispense` - Allows user to edit an existing Medication Dispense
- `Task: dispensing.delete.dispense` - Allows user to delete an existing Medication Dispense
- `Task: dispensing.delete.dispense.ifCreator` - Allows user to delete an existing Medication Dispense, *but only* if they created it originally

## Optional Configuration

TODO: document all configuration options

### Default filter locations

The Dispensing app allows users to filter orders in the order list by location. By default, when you open the dispensing app, no locations are selected.

You can set certain locations as default filter locations for specific locations by setting the "Associated Pharmacy Location" attribute on a location.

For example, if you have an "Inpatient Pharmacy" location, and want only orders from inpatient locations to show by default, you can set the "Associated Pharmacy Location" attribute on all inpatients to (the uuid for) the Inpatient Pharmacy location.

## Running this code

First, install dependencies:

```sh
yarn
```

Start the microfrontend by running `yarn start`. By default, this will proxy requests to the demo O3 server at `https://dev3.openmrs.org`.

If you want to run against a different OpenMRS server, you can specify the backend URL and port using the optional `--backend` and `--port` CLI arguments:

```sh
yarn start --backend "http://localhost:8080/" --port 8081
```

This will start the microfrontend at `http://localhost:8081/openmrs/spa`. Log in and navigate to `/openmrs/spa/dispensing` to access the Dispensing app. Alternatively, once on the home page, you can click on the App menu icon in the top right corner of the navbar and select "Dispensing".

Note: All backend requests will be proxied to your local OpenMRS instance running on `http://localhost:8080/`.

## Troubleshooting

If you run into errors with running the code, and see errors in the console related to having not enough file watchers on Linux, these instructions help: [React Native error: enospc system limit for number of file watchers reached](https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached).

If you are unable to commit and push using Intellij, you may need to update the path in Intellij to match your terminal: [Command not found](https://typicode.github.io/husky/#/?id=command-not-found).

## Contributing

For more information, please see the [OpenMRS Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/sQubAQ).

In particular, the [Setup](https://openmrs.atlassian.net/wiki/x/sQubAQ) section can help you get started developing microfrontends in general.

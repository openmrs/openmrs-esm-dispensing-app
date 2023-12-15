![Node.js CI](https://github.com/openmrs/openmrs-esm-dispensing/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Dispensing App

This repository is for the OpenMRS Dispensing App. For more information, please see the
[Design Documentation](https://wiki.openmrs.org/display/projects/Dispensing+Design+Components).

## Required Configuration

The Dispensing ESM requires the "HL7-MedicationDispenseStatus" concept source and FHIR concept source, as well as "Medication Dispense Status" value/concept set, to be installed in your OpenMRS instance to properly map dispensing statuses.

References to the Iniz files that install these concept sources can be found here:

https://github.com/openmrs/openmrs-distro-referenceapplication/blob/main/distro/configuration/conceptsources/conceptsources-core_data.csv#L24

https://github.com/openmrs/openmrs-distro-referenceapplication/blob/main/distro/configuration/fhirconceptsources/fhir_concept_sources-core_data.csv#L5

https://openmrs.slack.com/archives/C02P790SM7X/p1692380047339679?thread_ts=1692338258.965499&cid=C02P790SM7X

The Medication Dispense Status value set can be found here:

https://app.openconceptlab.org/#/search/?q=medication+dispense+status

It also is bundled in the "DrugDispense" OCL package provided by the Reference Application:

https://github.com/openmrs/openmrs-distro-referenceapplication/tree/main/distro/configuration/ocl

The "DrugDispense" also provides the default value sets for the "Substitution Type", "Substitution Reason", and "Medication Dispense Status Reason".

The "Substitution Type" and "Substitution Reason" value sets define the valid answers for both the equivalent questions when substituting a drug.  The "Medication Dispense Status Reason" provides the default answers for both the "Reason for Pause" and "Reason for Close" questions.

All of these can be customized via the config-schema, see: https://github.com/openmrs/openmrs-esm-dispensing-app/blob/main/src/config-schema.ts

## Required privileges

Note that following privileges need to be installed and assigned to roles:

* "Task: dispensing.create.dispense" - Allows user to Dispense Medication
* "Task: dispensing.create.dispense.andModifyDetails" - Allows user to modify the Quantity, Drug, Formulation and Dose Instructions (from the values specified in the Order / Medication Request) when Dispensing
* "Task: dispensing.edit.dispense" - Allows user to edit an existing Medication Dispense
* "Task: dispensing.delete.dispense" - Allows user to delete an existing Medication Dispense 
* "Task: dispensing.delete.dispense.ifCreator" - Allows user to delete an existing Medication Dispense, *but only* if they created it originally

## Running this code

```sh
yarn  # to install dependencies
yarn start --backend "http://localhost:8080/" --port 8081 # will run against a local OpenMRS server at localhost:8080, serving the frontend from 8081
```

Open a browser, pointing the the port indicated above (eg. 8081):
`http://localhost:8081/openmrs/spa/dispensing`

## Troubleshooting

If you run into errors with running the code, and see errors in the console related to having not enough file watchers on Linux,
these instructions help:  https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached

If you are unable to commit and push using Intellij, you may need to update the path in Intellij to match your terminal:
https://typicode.github.io/husky/#/?id=command-not-found

## Contributing

For more information, please see the
[OpenMRS Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/).

In particular, the [Setup](https://openmrs.github.io/openmrs-esm-core/#/getting_started/setup)
section can help you get started developing microfrontends in general.


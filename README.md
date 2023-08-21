![Node.js CI](https://github.com/openmrs/openmrs-esm-dispensing/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Dispensing App

This repository is for the OpenMRS Dispensing App. For more information, please see the
[Design Documentation](https://wiki.openmrs.org/display/projects/Dispensing+Design+Components).

## Required privileges

Note that following privileges need to be installed and assigned to roles:

* "Task: dispensing.create.dispense" - Allows user to Dispense Medication
* "Task: dispensing.create.dispense.andModifyDetails" - Allows user to modify the Quantity, Drug, Formulation and Dose Instructions (from the values specified in the Order / Medication Request) when Dispensing
* "Task: dispensing.edit.dispense" - Allows user to edit an existing Medication Dispense
* "Task: dispensing.delete.dispense" - Allows user to delete an existing Medication Dispense 
* "Task: dispensing.delete.dispense.ifCreator" - Allows user to delete an existing Medication Dispense, *but only* if they created it originally

## Required configuation

Please see config-schema.ts for the required configuration.  Specifically, the following properties are required:

* "substitutionType" property is a valid concept uuid pointing to a concept set that contains the substitution type concepts.
* "substitutionReason" property is a valid concept uuid pointing to a concept set that contains the substitution reason concepts.
* If the "Pause" button is enabled, you need to make sure that "reasonForPause" property is a valid concept uuid pointing to a concept set that contains the reason for pause concepts.
* If the "Close" button is enabled, you need to make sure that "reasonForClose" property is a valid concept uuid pointing to a concept set that contains the reason for close concepts.

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


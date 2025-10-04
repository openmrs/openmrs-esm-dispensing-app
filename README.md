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

# E2E Tests

This directory contains an E2E test suite using the [Playwright](https://playwright.dev)
framework.

## Getting Started

Please ensure that you have followed the basic installation guide in the [root README](../README.md). Once everything is set up, make sure the dev server is running by using:

```sh
yarn start 
```

Then, in a separate terminal, run:

```sh
yarn test-e2e --headed
```

By default, the test suite will run against the http://localhost:8080. You can override this by exporting `E2E_BASE_URL` environment variables beforehand:

```sh
# Ex: Set the server URL to dev3:
export E2E_BASE_URL=https://dev3.openmrs.org/openmrs

# Run all e2e tests:

```sh
yarn test-e2e --headed
```

To run a specific test by title:

```sh
yarn test-e2e --headed -g "title of the test"
```

Read the [e2e testing guide](https://o3-docs.openmrs.org/docs/frontend-modules/end-to-end-testing) to learn more about End-to-End tests in this project.

### Updating Playwright

The Playwright version in the [Bamboo e2e Dockerfile](e2e/support/bamboo/playwright.Dockerfile#L2) and the `package.json` file must match. If you update the Playwright version in one place, you must update it in the other.

## Troubleshooting

If you notice that your local version of the application is not working or that there's a mismatch between what you see locally versus what's in [dev3](https://dev3.openmrs.org/openmrs/spa), you likely have outdated versions of core libraries. To update core libraries, run the following commands:

Check [this documentation](https://playwright.dev/docs/running-tests#command-line) for more running options.  

It is also highly recommended to install the companion VS Code extension:
https://playwright.dev/docs/getting-started-vscode

## Writing New Tests

In general, it is recommended to read through the official [Playwright docs](https://playwright.dev/docs/intro)
before writing new test cases. The project uses the official Playwright test runner and,
generally, follows a very simple project structure:

```
e2e
|__ commands
|   ^ Contains "commands" (simple reusable functions) that can be used in test cases/specs,
|     e.g. generate a random patient.
|__ core
|   ^ Contains code related to the test runner itself, e.g. setting up the custom fixtures.
|     You probably need to touch this infrequently.
|__ fixtures
|   ^ Contains fixtures (https://playwright.dev/docs/test-fixtures) which are used
|     to run reusable setup/teardown tasks
|__ pages
|   ^ Contains page object model classes for interacting with the frontend.
|     See https://playwright.dev/docs/test-pom for details.
|__ specs
|   ^ Contains the actual test cases/specs. New tests should be placed in this folder.
|__ support
    ^ Contains support files that requires to run e2e tests, e.g. docker compose files.
```

When you want to write a new test case, start by creating a new spec in `./specs`.
Depending on what you want to achieve, you might want to create new fixtures and/or
page object models. To see examples, have a look at the existing code to see how these different concepts play together.

## Open reports from GitHub Actions / Bamboo
To download the report from the GitHub action/Bamboo plan, follow these steps:
1. Go to the artifact section of the action/plan and locate the report file.
2. Download the report file and unzip it using a tool of your choice.
3. Open the index.html file in a web browser to view the report. 
The report will show you a full summary of your tests, including information on which 
tests passed, failed, were skipped, or were flaky. You can filter the report by browser 
and explore the details of individual tests, including any errors or failures, video 
recordings, and the steps involved in each test. Simply click on a test to view its details.

## Debugging Tests
Refer to [this documentation](https://playwright.dev/docs/debug) on how to debug a test.

## Configuration
This is very much underdeveloped/WIP. At the moment, there exists a (git-shared) `.env`
file which can be used for configuring certain test attributes. This is most likely
about to change in the future. Stay tuned for updates!

## Github Actions integration
The e2e.yml workflow is made up of two jobs: one for running on pull requests (PRs) and
one for running on commits.
1. When running on PRs, the workflow will start the dev server, use dev3.openmrs.org as the backend, 
and run tests only on chromium. This is done in order to quickly provide feedback to the developer. 
The tests are designed to generate their own data and clean up after themselves once they are finished. 
This ensures that the tests will have minimum effect from changes made to dev3 by other developers. 
In the future, we plan to use a docker container to run the tests in an isolated environment once we 
figure out a way to spin up the container within a small amount of time.

2. When running on commits, the workflow will spin up a docker container and run the dev server against
it in order to provide a known and isolated environment. In addition, tests will be run on multiple 
browsers (chromium, firefox, and WebKit) to ensure compatibility.

## Troubleshooting tips for E2E testing
On MacOS, you might run into the following error:
```browserType.launch: Executable doesn't exist at /Users/<user>/Library/Caches/ms-playwright/chromium-1015/chrome-mac/Chromium.app/Contents/MacOS/Chromium```
In order to fix this, you can attempt to force the browser reinstallation by running:
```PLAYWRIGHT_BROWSERS_PATH=/Users/$USER/Library/Caches/ms-playwright npx playwright install```


## Troubleshooting

If you run into errors with running the code, and see errors in the console related to having not enough file watchers on Linux, these instructions help: [React Native error: enospc system limit for number of file watchers reached](https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached).

If you are unable to commit and push using Intellij, you may need to update the path in Intellij to match your terminal: [Command not found](https://typicode.github.io/husky/#/?id=command-not-found).

## Contributing

For more information, please see the [OpenMRS Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/sQubAQ).

In particular, the [Setup](https://openmrs.atlassian.net/wiki/x/sQubAQ) section can help you get started developing microfrontends in general.



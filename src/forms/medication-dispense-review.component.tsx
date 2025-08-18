import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ComboBox, Dropdown, NumberInput, Stack, TextArea } from '@carbon/react';
import { OpenmrsDatePicker, useConfig, useSession, userHasAccess, ResponsiveWrapper } from '@openmrs/esm-framework';
import { getConceptCodingUuid, getMedicationReferenceOrCodeableConcept, getOpenMRSMedicineDrugName } from '../utils';
import { useMedicationCodeableConcept, useMedicationFormulations } from '../medication/medication.resource';
import { useMedicationRequest, usePrescriptionDetails } from '../medication-request/medication-request.resource';
import {
  useOrderConfig,
  useProviders,
  useSubstitutionReasonValueSet,
  useSubstitutionTypeValueSet,
} from '../medication-dispense/medication-dispense.resource';
import { PRIVILEGE_CREATE_DISPENSE_MODIFY_DETAILS } from '../constants';
import { type Medication, type MedicationDispense } from '../types';
import { type PharmacyConfig } from '../config-schema';
import MedicationCard from '../components/medication-card.component';
import styles from '../components/medication-dispense-review.scss';

interface MedicationDispenseReviewProps {
  medicationDispense: MedicationDispense;
  updateMedicationDispense: Function;
  quantityRemaining: number;
  quantityDispensed: number;
}

const MedicationDispenseReview: React.FC<MedicationDispenseReviewProps> = ({
  medicationDispense,
  updateMedicationDispense,
  quantityRemaining,
  quantityDispensed,
}) => {
  const { t } = useTranslation();
  const config = useConfig<PharmacyConfig>();
  const session = useSession();
  const [isEditingFormulation, setIsEditingFormulation] = useState(false);
  const [isSubstitution, setIsSubstitution] = useState(false);
  // Dosing Unit eg Tablets
  const [drugDosingUnits, setDrugDosingUnits] = useState([]);
  // Dispensing Unit eg Tablets
  const [drugDispensingUnits, setDrugDispensingUnits] = useState([]);
  // Route eg Oral
  const [drugRoutes, setDrugRoutes] = useState([]);
  // Frequency eg Twice daily
  const [orderFrequencies, setOrderFrequencies] = useState([]);
  // type of substitution question
  const [substitutionTypes, setSubstitutionTypes] = useState([]);
  // reason for substitution question
  const [substitutionReasons, setSubstitutionReasons] = useState([]);
  //quantity prescribed
  const [quantityPrescribed, setQuantityPrescribed] = useState(medicationDispense.quantity.value);
  const [userCanModify, setUserCanModify] = useState(false);

  const allowEditing = config.dispenseBehavior.allowModifyingPrescription;

  const { orderConfigObject } = useOrderConfig();
  const { substitutionTypeValueSet } = useSubstitutionTypeValueSet(config.valueSets.substitutionType.uuid);
  const { substitutionReasonValueSet } = useSubstitutionReasonValueSet(config.valueSets.substitutionReason.uuid);
  const providers = useProviders(config.dispenserProviderRoles);

  // get the medication request associated with this dispense event
  // (we fetch this so that we can use it below to determine if the formulation dispensed varies from what was
  // ordered; it's slightly inefficient/awkward to fetch it from the server here because we *have* fetched it earlier,
  // it just seems cleaner to fetch it here rather than to make sure we pass it down through various components; with
  // SWR handling caching, we may want to consider pulling more down into this)
  const { medicationRequest } = useMedicationRequest(
    medicationDispense.authorizingPrescription ? medicationDispense.authorizingPrescription[0].reference : null,
    config.refreshInterval,
  );

  // we fetch this just to get the prescription date
  const { prescriptionDate } = usePrescriptionDetails(medicationRequest ? medicationRequest.encounter.reference : null);

  useEffect(() => {
    if (orderConfigObject) {
      // sync drug route options order config
      const availableRoutes = drugRoutes.map((x) => x.id);
      const otherRouteOptions = [];
      orderConfigObject.drugRoutes.forEach(
        (x) => availableRoutes.includes(x.uuid) || otherRouteOptions.push({ id: x.uuid, text: x.display }),
      );
      setDrugRoutes([...drugRoutes, ...otherRouteOptions]);

      // sync dosage.unit options with what's defined in the order config
      const availableDosingUnits = drugDosingUnits.map((x) => x.id);
      const otherDosingUnits = [];
      orderConfigObject.drugDosingUnits.forEach(
        (x) => availableDosingUnits.includes(x.uuid) || otherDosingUnits.push({ id: x.uuid, text: x.display }),
      );
      setDrugDosingUnits([...drugDosingUnits, ...otherDosingUnits]);

      // sync dispensing unit options with what's defined in the order config
      const availableDispensingUnits = drugDispensingUnits.map((x) => x.id);
      const otherDispensingUnits = [];
      orderConfigObject.drugDispensingUnits.forEach(
        (x) => availableDispensingUnits.includes(x.uuid) || otherDispensingUnits.push({ id: x.uuid, text: x.display }),
      );
      setDrugDispensingUnits([...drugDispensingUnits, ...otherDispensingUnits]);

      // sync order frequency options with order config
      const availableFrequencies = orderFrequencies.map((x) => x.id);
      const otherFrequencyOptions = [];
      orderConfigObject.orderFrequencies.forEach(
        (x) => availableFrequencies.includes(x.uuid) || otherFrequencyOptions.push({ id: x.uuid, text: x.display }),
      );
      setOrderFrequencies([...orderFrequencies, ...otherFrequencyOptions]);
    }
  }, [drugDispensingUnits, drugDosingUnits, drugRoutes, orderConfigObject, orderFrequencies]);

  useEffect(() => {
    const substitutionTypeOptions = [];

    if (substitutionTypeValueSet?.compose?.include) {
      const uuidValueSet = substitutionTypeValueSet.compose.include.find((include) => !include.system);
      if (uuidValueSet) {
        uuidValueSet.concept?.forEach((concept) =>
          substitutionTypeOptions.push({
            id: concept.code,
            text: concept.display,
          }),
        );
      }
      substitutionTypeOptions.sort((a, b) => a.text.localeCompare(b.text));
    }
    setSubstitutionTypes(substitutionTypeOptions);
  }, [substitutionTypeValueSet]);

  useEffect(() => {
    const substitutionReasonOptions = [];

    if (substitutionReasonValueSet?.compose?.include) {
      const uuidValueSet = substitutionReasonValueSet.compose.include.find((include) => !include.system);
      if (uuidValueSet) {
        uuidValueSet.concept?.forEach((concept) =>
          substitutionReasonOptions.push({
            id: concept.code,
            text: concept.display,
          }),
        );
      }
      substitutionReasonOptions.sort((a, b) => a.text.localeCompare(b.text));
    }
    setSubstitutionReasons(substitutionReasonOptions);
  }, [substitutionReasonValueSet]);

  // if this an order for a drug by concept, but not a particular formulation, we already have access to concept uuid
  const existingMedicationCodeableConceptUuid = getConceptCodingUuid(
    getMedicationReferenceOrCodeableConcept(medicationDispense)?.medicationCodeableConcept?.coding,
  );
  // otherwise we need to fetch the medication details to get the codeable concept
  // (note that React Hooks should not be called conditionally, so we *always* call this hook, but it will return null if existingMedicationCodeableConcept is defined
  const { medicationCodeableConceptUuid } = useMedicationCodeableConcept(
    existingMedicationCodeableConceptUuid,
    getMedicationReferenceOrCodeableConcept(medicationDispense).medicationReference?.reference,
  );
  // get the formulations
  const { medicationFormulations } = useMedicationFormulations(
    existingMedicationCodeableConceptUuid
      ? existingMedicationCodeableConceptUuid
      : medicationCodeableConceptUuid
        ? medicationCodeableConceptUuid
        : null,
  );

  // check to see if the current dispense would be a substitution, and update accordingly
  useEffect(() => {
    if (
      medicationRequest?.medicationReference?.reference &&
      medicationDispense?.medicationReference?.reference &&
      medicationRequest.medicationReference.reference != medicationDispense.medicationReference.reference
    ) {
      setIsSubstitution(true);
      updateMedicationDispense({
        ...medicationDispense,
        substitution: {
          ...medicationDispense.substitution,
          wasSubstituted: true,
        },
      });
    } else {
      setIsSubstitution(false);
      updateMedicationDispense({
        ...medicationDispense,
        substitution: {
          wasSubstituted: false,
          reason: [
            {
              coding: [{ code: null }],
            },
          ],
          type: { coding: [{ code: null }] },
        },
      });
    }
  }, [medicationDispense, medicationRequest, updateMedicationDispense]);

  useEffect(() => {
    setUserCanModify(session?.user && userHasAccess(PRIVILEGE_CREATE_DISPENSE_MODIFY_DETAILS, session.user));
  }, [session]);

  const initialDispenser = useMemo(() => {
    return medicationDispense?.performer?.[0]?.actor?.reference
      ? providers?.find((provider) => provider.uuid === medicationDispense.performer[0].actor.reference.split('/')[1])
      : session?.currentProvider?.uuid
        ? {
            uuid: session.currentProvider.uuid,
            person: {
              display: session?.user?.person?.display ?? '',
            },
          }
        : undefined;
  }, [medicationDispense?.performer, providers, session?.currentProvider?.uuid, session?.user?.person?.display]);

  useEffect(() => {
    if (initialDispenser?.uuid) {
      updateMedicationDispense({
        ...medicationDispense,
        performer: [
          {
            actor: {
              reference: `Practitioner/${initialDispenser.uuid}`,
            },
          },
        ],
      });
    }
  }, [initialDispenser, medicationDispense, updateMedicationDispense]);

  return (
    <div className={styles.medicationDispenseReviewContainer}>
      <Stack gap={5}>
        {!isEditingFormulation ? (
          <MedicationCard
            medication={getMedicationReferenceOrCodeableConcept(medicationDispense)}
            editAction={userCanModify && allowEditing ? () => setIsEditingFormulation(true) : null}
          />
        ) : (
          <ResponsiveWrapper>
            <Dropdown
              id="medicationFormulation"
              items={medicationFormulations}
              itemToString={(item: Medication) => getOpenMRSMedicineDrugName(item)}
              initialSelectedItem={{
                ...medicationFormulations?.find(
                  (formulation) => formulation.id === medicationDispense.medicationReference?.reference.split('/')[1],
                ),
              }}
              titleText={t('medicationFormulation', 'Medication Formulation')}
              label={t('medicationFormulation', 'Medication Formulation')}
              onChange={({ selectedItem }) => {
                const typedItem = selectedItem as Medication;
                updateMedicationDispense({
                  ...medicationDispense,
                  medicationCodeableConcept: undefined,
                  medicationReference: {
                    reference: 'Medication/' + typedItem?.id,
                    display: getOpenMRSMedicineDrugName(typedItem),
                  },
                });
                setIsEditingFormulation(false);
              }}
            />
          </ResponsiveWrapper>
        )}

        {isSubstitution && (
          <div className={styles.dispenseDetailsContainer}>
            <ResponsiveWrapper>
              <ComboBox
                className={styles.substitutionType}
                id="substitutionType"
                items={substitutionTypes}
                titleText={t('substitutionType', 'Type of substitution')}
                itemToString={(item) => item?.text}
                initialSelectedItem={{
                  id: medicationDispense.substitution.type?.coding[0]?.code,
                  text: medicationDispense.substitution.type?.text,
                }}
                onChange={({ selectedItem }) => {
                  updateMedicationDispense({
                    ...medicationDispense,
                    substitution: {
                      ...medicationDispense.substitution,
                      type: {
                        coding: [
                          {
                            code: selectedItem?.id,
                          },
                        ],
                      },
                    },
                  });
                }}
              />
            </ResponsiveWrapper>
          </div>
        )}

        {isSubstitution && (
          <div className={styles.dispenseDetailsContainer}>
            <ResponsiveWrapper>
              <ComboBox
                className={styles.substitutionReason}
                id="substitutionReason"
                items={substitutionReasons}
                titleText={t('substitutionReason', 'Reason for substitution')}
                itemToString={(item) => item?.text}
                initialSelectedItem={{
                  id: medicationDispense.substitution.reason[0]?.coding[0]?.code,
                  text: medicationDispense.substitution.reason[0]?.text,
                }}
                onChange={({ selectedItem }) => {
                  updateMedicationDispense({
                    ...medicationDispense,
                    substitution: {
                      ...medicationDispense.substitution,
                      reason: [
                        {
                          coding: [
                            {
                              code: selectedItem?.id,
                            },
                          ],
                        },
                      ],
                    },
                  });
                }}
              />
            </ResponsiveWrapper>
          </div>
        )}
        <ResponsiveWrapper>
          <div>
            <p className={styles.quantitySummary}>
              {t('quantityPrescribed', 'Quantity Prescribed')}: {quantityPrescribed}
            </p>
            <p className={styles.quantitySummary}>
              {t('quantityDispensed', 'Quantity Dispensed')}: {quantityDispensed}
            </p>
            {config.dispenseBehavior.restrictTotalQuantityDispensed ? (
              <p className={styles.quantitySummary}>
                {t('quantityRemaining', 'Quantity Remaining to Dispense')}: {quantityRemaining}
              </p>
            ) : null}
          </div>
        </ResponsiveWrapper>

        <div className={styles.dispenseDetailsContainer}>
          <NumberInput
            allowEmpty={true}
            value={medicationDispense.quantity.value}
            disabled={!userCanModify}
            hideSteppers={true}
            id="quantity"
            invalidText={t('numberIsNotValid', 'Number is not valid')}
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{t('quantity', 'Quantity')}</div>
            }
            min={0}
            max={config.dispenseBehavior.restrictTotalQuantityDispensed ? quantityRemaining : undefined}
            onChange={(event, state) => {
              updateMedicationDispense({
                ...medicationDispense,
                quantity: {
                  ...medicationDispense.quantity,
                  value: state.value ? parseFloat(state.value.toString()) : '',
                },
              });
            }}
          />
          <ResponsiveWrapper>
            <ComboBox
              id="quantityUnits"
              disabled={!userCanModify || !allowEditing}
              items={drugDispensingUnits}
              titleText={t('drugDispensingUnit', 'Dispensing unit')}
              itemToString={(item) => item?.text}
              initialSelectedItem={{
                id: medicationDispense.quantity.code,
                text: medicationDispense.quantity.unit,
              }}
              onChange={({ selectedItem }) => {
                updateMedicationDispense({
                  ...medicationDispense,
                  // note that we specifically recreate doseQuantity to overwrite any unit or system properties that may have been set
                  quantity: {
                    value: medicationDispense.quantity.value,
                    code: selectedItem?.id,
                  },
                });
              }}
              required
            />
          </ResponsiveWrapper>
        </div>

        <div className={styles.dispenseDetailsContainer}>
          <NumberInput
            allowEmpty={false}
            disabled={!userCanModify || !allowEditing}
            hideSteppers={true}
            id="dosingQuantity"
            invalidText={t('numberIsNotValid', 'Number is not valid')}
            min={0}
            label={t('dose', 'Dose')}
            value={medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity.value}
            onChange={(event, state) => {
              updateMedicationDispense({
                ...medicationDispense,
                dosageInstruction: [
                  {
                    ...medicationDispense.dosageInstruction[0],
                    doseAndRate: [
                      {
                        ...medicationDispense.dosageInstruction[0].doseAndRate[0],
                        doseQuantity: {
                          ...medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity,
                          value: state.value ? parseFloat(state.value.toString()) : '',
                        },
                      },
                    ],
                  },
                ],
              });
            }}
          />

          <ResponsiveWrapper>
            <ComboBox
              id="dosingUnits"
              disabled={!userCanModify || !allowEditing}
              items={drugDosingUnits}
              titleText={t('doseUnit', 'Dose unit')}
              itemToString={(item) => item?.text}
              initialSelectedItem={{
                id: medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity?.code,
                text: medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity?.unit,
              }}
              onChange={({ selectedItem }) => {
                updateMedicationDispense({
                  ...medicationDispense,
                  dosageInstruction: [
                    {
                      ...medicationDispense.dosageInstruction[0],
                      doseAndRate: [
                        {
                          doseQuantity: {
                            // note that we specifically recreate doseQuantity to overwrite any unit or system properties that may have been set
                            value: medicationDispense.dosageInstruction[0].doseAndRate[0].doseQuantity?.value,
                            code: selectedItem?.id,
                          },
                        },
                      ],
                    },
                  ],
                });
              }}
              required
            />
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <ComboBox
              id="editRoute"
              disabled={!userCanModify || !allowEditing}
              items={drugRoutes}
              initialSelectedItem={{
                id: medicationDispense.dosageInstruction[0].route?.coding[0]?.code,
                text: medicationDispense.dosageInstruction[0].route?.text,
              }}
              titleText={t('route', 'Route')}
              itemToString={(item) => item?.text}
              onChange={({ selectedItem }) => {
                updateMedicationDispense({
                  ...medicationDispense,
                  dosageInstruction: [
                    {
                      ...medicationDispense.dosageInstruction[0],
                      route: {
                        coding: [
                          {
                            code: selectedItem?.id,
                          },
                        ],
                      },
                    },
                  ],
                });
              }}
              required
            />
          </ResponsiveWrapper>
        </div>

        <ResponsiveWrapper>
          <ComboBox
            id="frequency"
            disabled={!userCanModify || !allowEditing}
            items={orderFrequencies}
            initialSelectedItem={{
              id: medicationDispense.dosageInstruction[0].timing?.code?.coding[0]?.code,
              text: medicationDispense.dosageInstruction[0].timing?.code?.text,
            }}
            titleText={t('frequency', 'Frequency')}
            itemToString={(item) => item?.text}
            onChange={({ selectedItem }) => {
              updateMedicationDispense({
                ...medicationDispense,
                dosageInstruction: [
                  {
                    ...medicationDispense.dosageInstruction[0],
                    timing: {
                      ...medicationDispense.dosageInstruction[0].timing,
                      code: {
                        coding: [
                          {
                            code: selectedItem?.id,
                          },
                        ],
                      },
                    },
                  },
                ],
              });
            }}
            required
          />
        </ResponsiveWrapper>

        <TextArea
          labelText={t('patientInstructions', 'Patient instructions')}
          value={medicationDispense.dosageInstruction[0].text}
          maxLength={65535}
          onChange={(e) => {
            updateMedicationDispense({
              ...medicationDispense,
              dosageInstruction: [
                {
                  ...medicationDispense.dosageInstruction[0],
                  text: e.target.value,
                },
              ],
            });
          }}
        />

        <OpenmrsDatePicker
          id="dispenseDate"
          labelText={t('dispenseDate', 'Date of Dispense')}
          minDate={prescriptionDate ? dayjs(prescriptionDate).startOf('day').toDate() : null}
          maxDate={dayjs().toDate()}
          onChange={(input) => {
            const currentDate = medicationDispense.whenHandedOver ? dayjs(medicationDispense.whenHandedOver) : null;
            const selectedDate = dayjs(input);
            updateMedicationDispense({
              ...medicationDispense,
              whenHandedOver: currentDate?.isSame(selectedDate, 'day')
                ? currentDate.toISOString()
                : selectedDate.toISOString(), // to preserve any time component, only update if the day actually changes
            });
          }}
          value={dayjs(medicationDispense.whenHandedOver).toDate()}></OpenmrsDatePicker>

        {providers && (
          <ResponsiveWrapper>
            <ComboBox
              id="dispenser"
              initialSelectedItem={initialDispenser}
              onChange={({ selectedItem }) => {
                updateMedicationDispense({
                  ...medicationDispense,
                  performer: [
                    {
                      actor: {
                        reference: `Practitioner/${selectedItem?.uuid}`,
                      },
                    },
                  ],
                });
              }}
              items={providers}
              itemToString={(item) => item?.person?.display}
              required
              titleText={t('dispensedBy', 'Dispensed by')}
            />
          </ResponsiveWrapper>
        )}
      </Stack>
    </div>
  );
};

export default MedicationDispenseReview;

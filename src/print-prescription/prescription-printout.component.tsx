import React, { useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import { formatDate, parseDate, useSession } from '@openmrs/esm-framework';
import { type DosageInstruction, type MedicationRequestBundle, type Quantity } from '../types';
import {
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getQuantity,
  getRefillsAllowed,
} from '../utils';
import styles from './print-prescription.scss';

type PrescriptionsPrintoutProps = {
  medicationrequests: Array<MedicationRequestBundle>;
  excludedPrescription: Array<string>;
};

const PrescriptionsPrintout: React.FC<PrescriptionsPrintoutProps> = ({ medicationrequests, excludedPrescription }) => {
  const { t } = useTranslation();
  const {
    sessionLocation: { display: facilityName },
  } = useSession();
  const patient = medicationrequests[0]?.request?.subject;
  const requester = useRef<string>(null);

  const extractPatientName = (display: string) => (display.includes('(') ? display.split('(')[0] : display);
  return (
    <Layer className={styles.printOutContainer}>
      <StructuredListWrapper>
        <StructuredListBody>
          <StructuredListRow head>
            <StructuredListCell head>
              <br />
              <br />
              <p className={styles.printoutTitle}>{t('prescriptionInstructions', 'Prescription instructions')}</p>
              {patient && (
                <p className={classNames(styles.patientName, styles.faintText)}>
                  {extractPatientName(patient.display)}
                </p>
              )}
              <br />
              <br />
            </StructuredListCell>
          </StructuredListRow>
          {medicationrequests
            ?.filter((req) => !excludedPrescription.includes(req.request.id))
            ?.map((request, index) => {
              const medicationEvent = request.request;
              requester.current = medicationEvent?.requester?.display;
              const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
              const quantity: Quantity = getQuantity(medicationEvent);
              const numberOfRefillsAllowed: number = getRefillsAllowed(medicationEvent);

              return (
                <div key={index}>
                  {dosageInstruction && (
                    <StructuredListRow>
                      <StructuredListCell>
                        <p>
                          <strong>
                            {getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}
                          </strong>
                        </p>
                        <br />
                        <p>
                          <span className={styles.faintText}>{t('dose', 'Dose')}</span>
                          {': '}
                          <span>
                            {dosageInstruction?.doseAndRate?.map((doseAndRate, index) => {
                              return (
                                <span key={index}>
                                  {doseAndRate?.doseQuantity?.value} {doseAndRate?.doseQuantity?.unit}
                                </span>
                              );
                            })}
                          </span>{' '}
                          &mdash; {dosageInstruction?.route?.text} &mdash; {dosageInstruction?.timing?.code?.text}
                          {dosageInstruction?.timing?.repeat?.duration
                            ? ` ${t('for', 'for')} ` +
                              dosageInstruction?.timing?.repeat?.duration +
                              ' ' +
                              dosageInstruction?.timing?.repeat?.durationUnit
                            : ' '}
                          {quantity && (
                            <p>
                              <span className={styles.faintText}>{t('quantity', 'Quantity')}</span>
                              {': '}
                              <span>
                                {quantity.value} {quantity.unit}
                              </span>
                            </p>
                          )}
                        </p>
                        <p>
                          <span className={styles.faintText}>{t('datePrescribed', 'Date prescribed')}</span>
                          {': '} <span>{formatDate(parseDate(request.request.authoredOn), { noToday: true })}</span>
                        </p>
                        <p>
                          <span className={styles.faintText}>{t('refills', 'Refills')}</span>
                          {': '}{' '}
                          <span>
                            {numberOfRefillsAllowed || numberOfRefillsAllowed === 0
                              ? numberOfRefillsAllowed
                              : t('noRefills', 'No refills')}
                          </span>
                        </p>

                        {dosageInstruction?.text && <p>{dosageInstruction.text}</p>}
                        {dosageInstruction?.additionalInstruction?.length > 0 && (
                          <p>
                            {dosageInstruction?.additionalInstruction.map((instruction) => instruction.text).join(', ')}
                          </p>
                        )}
                      </StructuredListCell>
                    </StructuredListRow>
                  )}
                </div>
              );
            })}
          {requester.current && (
            <p className={styles.prescriber}>
              {t('prescribedBy', 'Prescribed By')}: {requester.current?.split('(')?.at(0)}
            </p>
          )}
          <p className={styles.facilityName}>{facilityName}</p>
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PrescriptionsPrintout;

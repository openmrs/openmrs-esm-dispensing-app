import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Layer, StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { type DosageInstruction, type MedicationRequestBundle, type Quantity } from '../types';
import {
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getQuantity,
  getRefillsAllowed,
} from '../utils';
import styles from './print-label.scss';

type LabelPrintoutProps = {
  excludedPrescriptions: Array<string>;
  medicationRequests: Array<MedicationRequestBundle>;
};

const LabelPrintout: React.FC<LabelPrintoutProps> = ({ excludedPrescriptions, medicationRequests }) => {
  const { t } = useTranslation();
  const patient = medicationRequests[0]?.request?.subject;

  const extractPatientName = (display: string) => (display.includes('(') ? display.split('(')[0] : display);

  const filteredRequests = useMemo(
    () => medicationRequests?.filter((req) => !excludedPrescriptions.includes(req.request.id)) || [],
    [medicationRequests, excludedPrescriptions],
  );

  return (
    <Layer className={styles.printOutContainer}>
      <StructuredListWrapper>
        <StructuredListBody>
          <StructuredListRow head>
            <StructuredListCell head>
              <br />
              <br />
              <p className={styles.printoutTitle}>{t('dosageInstructions', 'Dosage Instructions')}</p>
              {patient && (
                <p className={classNames(styles.patientName, styles.faintText)}>
                  {extractPatientName(patient.display)}
                </p>
              )}
              <br />
              <br />
            </StructuredListCell>
          </StructuredListRow>
          {filteredRequests.map((request) => {
            const medicationEvent = request.request;
            const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
            const quantity: Quantity = getQuantity(medicationEvent);
            const numberOfRefillsAllowed: number = getRefillsAllowed(medicationEvent);

            return (
              <div key={request.request.id}>
                {dosageInstruction && (
                  <StructuredListRow>
                    <StructuredListCell>
                      <p className={styles.medicationName}>
                        <strong>
                          {getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}
                        </strong>
                      </p>
                      <br />
                      <p>
                        <span className={styles.faintText}>{t('dose', 'Dose')}</span>
                        {': '}
                        <span className={styles.prescriptionInfo}>
                          {dosageInstruction?.doseAndRate?.map((doseAndRate, index) => {
                            return (
                              <span className={styles.prescriptionInfo} key={`dose-${request.request.id}-${index}`}>
                                {doseAndRate?.doseQuantity?.value} {doseAndRate?.doseQuantity?.unit}
                              </span>
                            );
                          })}
                        </span>{' '}
                        &mdash;{' '}
                        <span className={styles.prescriptionInfo}>
                          {dosageInstruction?.route?.text} &mdash; {dosageInstruction?.timing?.code?.text}
                          {dosageInstruction?.timing?.repeat?.duration
                            ? ` ${t('for', 'for')} ${dosageInstruction?.timing?.repeat?.duration} ${dosageInstruction?.timing?.repeat?.durationUnit}`
                            : ''}
                        </span>
                        {quantity && (
                          <div>
                            <span className={styles.faintText}>{t('quantity', 'Quantity')}</span>
                            {': '}
                            <span className={styles.prescriptionInfo}>
                              {quantity.value} {quantity.unit}
                            </span>
                          </div>
                        )}
                      </p>
                      <p>
                        <span className={styles.faintText}>{t('datePrescribed', 'Date prescribed')}</span>
                        {': '}{' '}
                        <span className={styles.prescriptionInfo}>
                          {formatDate(parseDate(request.request.authoredOn), { noToday: true })}
                        </span>
                      </p>
                      <p>
                        <span className={styles.faintText}>{t('refills', 'Refills')}</span>
                        {': '}{' '}
                        <span className={styles.prescriptionInfo}>
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
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default LabelPrintout;

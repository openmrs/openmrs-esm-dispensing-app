import React, { useMemo } from 'react';
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
  excludedPrescription: Array<string>;
  medicationRequests: Array<MedicationRequestBundle>;
};

const PrescriptionsPrintout: React.FC<PrescriptionsPrintoutProps> = ({ excludedPrescription, medicationRequests }) => {
  const { t } = useTranslation();
  const {
    sessionLocation: { display: facilityName },
  } = useSession();
  const patient = medicationRequests[0]?.request?.subject;

  const extractPatientName = (display: string) => (display.includes('(') ? display.split('(')[0] : display);

  const requesters = useMemo(() => {
    const uniqueRequesters = new Set<string>();
    medicationRequests
      ?.filter((req) => !excludedPrescription.includes(req.request.id))
      ?.forEach((request) => {
        const display = request.request?.requester?.display;
        if (display) uniqueRequesters.add(display);
      });
    return uniqueRequesters;
  }, [medicationRequests, excludedPrescription]);

  const filteredRequests = useMemo(
    () => medicationRequests?.filter((req) => !excludedPrescription.includes(req.request.id)) || [],
    [medicationRequests, excludedPrescription],
  );

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
          {requesters.size > 0 && (
            <p className={styles.prescriber}>
              {t('prescribedBy', 'Prescribed By')}:{' '}
              {Array.from(requesters.values())
                .map((name) => name?.split('(')?.at(0))
                ?.join(', ')}
            </p>
          )}
          <p className={styles.facilityName}>{facilityName}</p>
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PrescriptionsPrintout;

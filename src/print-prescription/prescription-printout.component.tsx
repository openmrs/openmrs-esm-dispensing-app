import { Layer, StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import { formatDate, parseDate, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
};

const PrescriptionsPrintout: React.FC<PrescriptionsPrintoutProps> = ({ medicationrequests }) => {
  const { t } = useTranslation();
  const {
    sessionLocation: { display: facilityName },
  } = useSession();
  const patient = medicationrequests[0]?.request?.subject;
  return (
    <Layer className={styles.printOutContainer}>
      <StructuredListWrapper>
        {/* <StructuredListHead>
        <StructuredListRow head>
          <StructuredListCell head>Patient Name Here</StructuredListCell>
          <StructuredListCell head>Facility name here</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead> */}
        <StructuredListBody>
          <StructuredListRow head>
            <StructuredListCell head>
              <br />
              <br />
              <p className={styles.printoutTitle}>Prescription Instructions</p>
              {patient && (
                <p className={styles.faintText} style={{ textAlign: 'center' }}>
                  {patient.display
                    .match(/^([A-Za-z\s]+)\s\(/)
                    ?.at(1)
                    ?.toUpperCase()}
                </p>
              )}
              <br />
              <br />
            </StructuredListCell>
          </StructuredListRow>
          {medicationrequests?.map((request, index) => {
            const medicationEvent = request.request;
            const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
            const quantity: Quantity = getQuantity(medicationEvent);
            const refillsAllowed: number = getRefillsAllowed(medicationEvent);
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
                        &mdash; {dosageInstruction?.route?.text} &mdash; {dosageInstruction?.timing?.code?.text}{' '}
                        {dosageInstruction?.timing?.repeat?.duration
                          ? 'for ' +
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
                        {': '} <span>{formatDate(parseDate((request.request as any).authoredOn))}</span>
                      </p>
                      {(refillsAllowed || refillsAllowed === 0) && (
                        <p>
                          <span className={styles.faintText}>{t('refills', 'Refills')}</span>
                          {': '} <span>{refillsAllowed}</span>
                        </p>
                      )}
                      {dosageInstruction?.text && <p>{dosageInstruction.text}</p>}
                      {dosageInstruction?.additionalInstruction?.length > 0 && (
                        <p>{dosageInstruction?.additionalInstruction[0].text}</p>
                      )}
                    </StructuredListCell>
                  </StructuredListRow>
                )}
              </div>
            );
          })}
          <p className={styles.facilityName}>{facilityName}</p>
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PrescriptionsPrintout;

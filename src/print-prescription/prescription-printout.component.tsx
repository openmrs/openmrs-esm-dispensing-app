import React from 'react';
import { type DosageInstruction, type MedicationRequestBundle, type Quantity } from '../types';
import {
  getDosageInstruction,
  getMedicationDisplay,
  getMedicationReferenceOrCodeableConcept,
  getQuantity,
  getRefillsAllowed,
} from '../utils';
import {
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';

type PrescriptionsPrintoutProps = {
  medicationrequests: Array<MedicationRequestBundle>;
};

const PrescriptionsPrintout: React.FC<PrescriptionsPrintoutProps> = ({ medicationrequests }) => {
  const { t } = useTranslation();
  return (
    <StructuredListWrapper>
      {/* <StructuredListHead>
        <StructuredListRow head>
          <StructuredListCell head>Patient Name Here</StructuredListCell>
          <StructuredListCell head>Facility name here</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead> */}
      <StructuredListBody>
        {medicationrequests?.map((request, index) => {
          const medicationEvent = request.request;
          const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
          const quantity: Quantity = getQuantity(medicationEvent);
          const refillsAllowed: number = getRefillsAllowed(medicationEvent);
          return (
            <div key={index}>
              <StructuredListRow head>
                <StructuredListCell head>
                  {getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}
                </StructuredListCell>
              </StructuredListRow>

              {dosageInstruction && (
                <StructuredListRow>
                  <StructuredListCell>
                    <span>{t('dose', 'Dose').toUpperCase()}</span>
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
                  </StructuredListCell>
                </StructuredListRow>
              )}
              {quantity && (
                <StructuredListRow>
                  <StructuredListCell>
                    <span>{t('quantity', 'Quantity')}</span>
                    {': '}
                    <span>
                      {quantity.value} {quantity.unit}
                    </span>
                  </StructuredListCell>
                </StructuredListRow>
              )}

              {(refillsAllowed || refillsAllowed === 0) && (
                <StructuredListRow>
                  <StructuredListCell>
                    <span>{t('refills', 'Refills')}</span>
                    {': '} <span>{refillsAllowed}</span>
                  </StructuredListCell>
                </StructuredListRow>
              )}
              {dosageInstruction?.text && (
                <StructuredListRow>
                  <StructuredListCell>{dosageInstruction.text}</StructuredListCell>
                </StructuredListRow>
              )}
              {dosageInstruction?.additionalInstruction?.length > 0 && (
                <StructuredListRow>
                  <StructuredListCell>{dosageInstruction?.additionalInstruction[0].text}</StructuredListCell>
                </StructuredListRow>
              )}
            </div>
          );
        })}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default PrescriptionsPrintout;

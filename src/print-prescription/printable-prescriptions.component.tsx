import React from 'react';
import { type DosageInstruction, type MedicationRequestBundle } from '../types';
import { getDosageInstruction, getMedicationDisplay, getMedicationReferenceOrCodeableConcept } from '../utils';
import { Checkbox } from '@carbon/react';
import { useTranslation } from 'react-i18next';

type PrintablePrescriptionsSelectorProps = {
  medicationrequests: Array<MedicationRequestBundle>;
  excludedPrescription: Array<string>;
  onExcludedPrescriptionChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const PrintablePrescriptionsSelector: React.FC<PrintablePrescriptionsSelectorProps> = ({
  medicationrequests,
  onExcludedPrescriptionChange,
  excludedPrescription,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <p>
        <strong>{t('selectPrescriptions', 'Check prescriptions to print')}</strong>
      </p>
      {medicationrequests?.map((request, index) => {
        const medicationEvent = request.request;
        const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);
        return (
          <div key={index}>
            {dosageInstruction && (
              <Checkbox
                id={medicationEvent.id}
                labelText={getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}
                checked={!excludedPrescription.includes(medicationEvent.id)}
                onChange={(_, { checked }) => {
                  if (checked) {
                    onExcludedPrescriptionChange(excludedPrescription.filter((id) => id !== medicationEvent.id));
                  } else {
                    onExcludedPrescriptionChange([...excludedPrescription, medicationEvent.id]);
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PrintablePrescriptionsSelector;

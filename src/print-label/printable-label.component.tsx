import React, { useCallback } from 'react';
import { Checkbox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type DosageInstruction, type MedicationRequestBundle } from '../types';
import { getDosageInstruction, getMedicationDisplay, getMedicationReferenceOrCodeableConcept } from '../utils';

type PrintableLabelSelectorProps = {
  medicationRequests: Array<MedicationRequestBundle>;
  excludedPrescription: Array<string>;
  onExcludedPrescriptionChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const PrintableLabelSelector: React.FC<PrintableLabelSelectorProps> = ({
  medicationRequests,
  onExcludedPrescriptionChange,
  excludedPrescription,
}) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (checked: boolean, medicationEventId: string) => {
      if (checked) {
        onExcludedPrescriptionChange(excludedPrescription.filter((id) => id !== medicationEventId));
      } else {
        onExcludedPrescriptionChange([...excludedPrescription, medicationEventId]);
      }
    },
    [onExcludedPrescriptionChange, excludedPrescription],
  );

  return (
    <div>
      <p>
        <strong>{t('selectPrescriptions', 'Check prescriptions to print')}</strong>
      </p>
      {medicationRequests?.map((request) => {
        const medicationEvent = request.request;
        const dosageInstruction: DosageInstruction = getDosageInstruction(medicationEvent.dosageInstruction);

        return (
          <div key={medicationEvent.id}>
            {dosageInstruction && (
              <Checkbox
                id={medicationEvent.id}
                labelText={getMedicationDisplay(getMedicationReferenceOrCodeableConcept(medicationEvent))}
                checked={!excludedPrescription.includes(medicationEvent.id)}
                onChange={(_, { checked }) => handleChange(checked, medicationEvent.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PrintableLabelSelector;

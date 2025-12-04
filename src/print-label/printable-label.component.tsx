import React, { useCallback } from 'react';
import { Checkbox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type DosageInstruction, type MedicationRequestBundle } from '../types';
import { getDosageInstruction, getMedicationDisplay, getMedicationReferenceOrCodeableConcept } from '../utils';

type PrintableLabelSelectorProps = {
  medicationRequests: Array<MedicationRequestBundle>;
  excludedPrescriptions: Array<string>;
  onExcludedPrescriptionChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const PrintableLabelSelector: React.FC<PrintableLabelSelectorProps> = ({
  medicationRequests,
  onExcludedPrescriptionChange,
  excludedPrescriptions,
}) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    (checked: boolean, medicationEventId: string) => {
      if (checked) {
        onExcludedPrescriptionChange(excludedPrescriptions.filter((id) => id !== medicationEventId));
      } else {
        onExcludedPrescriptionChange([...excludedPrescriptions, medicationEventId]);
      }
    },
    [onExcludedPrescriptionChange, excludedPrescriptions],
  );

  return (
    <div>
      <p>
        <fieldset>
          <legend>
            <strong>{t('selectPrescriptionsForLabel', 'Check prescriptions to include on label')}</strong>
          </legend>
        </fieldset>
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
                checked={!excludedPrescriptions.includes(medicationEvent.id)}
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

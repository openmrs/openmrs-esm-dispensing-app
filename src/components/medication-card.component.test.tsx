import React from 'react';
import { render } from '@testing-library/react';
import { type MedicationReferenceOrCodeableConcept } from '../types';
import MedicationCard from './medication-card.component';

describe('Medication Card Component tests', () => {
  test('component should render medication card without edit action button', () => {
    const medication: MedicationReferenceOrCodeableConcept = {
      medicationReference: {
        display: 'Some Medication',
        reference: '',
        type: '',
      },
    };

    const { getByText, container } = render(<MedicationCard medication={medication} />);
    expect(getByText('Some Medication')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  test('component should render medication card with edit action button', () => {
    const medication: MedicationReferenceOrCodeableConcept = {
      medicationReference: {
        display: 'Some Medication',
        reference: '',
        type: '',
      },
    };

    const action = () => 0;

    const { getByText, container } = render(<MedicationCard medication={medication} editAction={action} />);
    expect(getByText('Some Medication')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

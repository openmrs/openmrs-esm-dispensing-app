import React from 'react';
import { render, screen } from '@testing-library/react';
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

    render(<MedicationCard medication={medication} />);
    expect(screen.getByText('Some Medication')).toBeInTheDocument();
    expect(screen.queryByRole('svg')).not.toBeInTheDocument();
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

    render(<MedicationCard medication={medication} editAction={action} />);
    expect(screen.getByText('Some Medication')).toBeInTheDocument();
  });
});

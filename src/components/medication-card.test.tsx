/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/prefer-screen-queries --
   these tests query through render's container; rewriting them to screen queries is follow-up work */
import React from 'react';
import { describe, expect, test } from 'vitest';
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

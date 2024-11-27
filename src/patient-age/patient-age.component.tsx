import React from 'react';
import { InlineLoading } from '@carbon/react';
import usePatientAge from './use-patient-age';

type PatientAgeProps = {
  patientUuid: string;
};

const PatientAge: React.FC<PatientAgeProps> = ({ patientUuid }) => {
  const { error, isLoading, age } = usePatientAge(patientUuid);
  if (isLoading) return <InlineLoading status="active" iconDescription="Loading" />;
  return <>{age}</>;
};

export default PatientAge;

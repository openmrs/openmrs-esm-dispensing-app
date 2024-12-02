import React from 'react';
import { concatAgePatientDisplay, usePatientAge } from './patient.resources';

type PatientInfoCellProps = {
  patient: {
    name: string;
    uuid: string;
  };
};

const PatientInfoCell: React.FC<PatientInfoCellProps> = ({ patient: { name, uuid } }) => {
  const { error, isLoading, age } = usePatientAge(uuid);
  if (isLoading || error) return <>{name}</>;
  const patient = concatAgePatientDisplay(name, age);
  return <>{patient}</>;
};

export default PatientInfoCell;

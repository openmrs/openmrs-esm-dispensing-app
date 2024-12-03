import React from 'react';
import { usePatientAge } from './patient.resources';
import { useTranslation } from 'react-i18next';

type PatientInfoCellProps = {
  patient: {
    name: string;
    uuid: string;
  };
};

const PatientInfoCell: React.FC<PatientInfoCellProps> = ({ patient: { name: display, uuid } }) => {
  const { error, isLoading, age } = usePatientAge(uuid);
  const { t } = useTranslation();
  const ageLabel = t('age', 'Age');
  function concatAgePatientDisplay(input: string, age: number): string | null {
    const attrIndex = input.lastIndexOf(')');
    if (attrIndex !== -1) return input.slice(0, attrIndex) + `, ${ageLabel}: ${age}` + input.slice(attrIndex);
    else return `${input} ${ageLabel}: ${age}`;
  }
  if (isLoading || error) return <>{display}</>;
  const displayWithAge = concatAgePatientDisplay(display, age);
  return <>{displayWithAge}</>;
};

export default PatientInfoCell;

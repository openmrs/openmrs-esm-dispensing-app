import React from 'react';
import { Layer } from '@carbon/react';
import { Report } from '@carbon/react/icons';
import styles from './empty-state.scss';

type EmptyState = {
  title: string;
  message: string;
};

const EmptyState: React.FC<EmptyState> = ({ title, message }) => {
  return (
    <Layer className={styles.container}>
      <p className={styles.title}>{title}</p>
      <div className={styles.messageContainer}>
        <Report className={styles.emptyIcon} size={50} />
        <p className={styles.message}>{message}</p>
      </div>
    </Layer>
  );
};

export default EmptyState;

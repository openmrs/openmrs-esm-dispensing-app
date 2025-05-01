import React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';

const DeleteConfirmModal = ({
  title,
  onClose,
  onDelete,

  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  message: string;
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ModalHeader closeModal={onClose} title={title}></ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={onDelete}>
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
export default DeleteConfirmModal;

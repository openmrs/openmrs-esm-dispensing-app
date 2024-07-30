import { getVisitTypes, showSnackbar, updateVisit } from '@openmrs/esm-framework';
import { saveMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import { updateMedicationRequestFulfillerStatus } from '../medication-request/medication-request.resource';
import { type DispenseFormHandlerParams, MedicationDispenseStatus } from '../types';
import { computeNewFulfillerStatusAfterDispenseEvent, getFulfillerStatus, getUuidFromReference } from '../utils';
import { createStockDispenseRequestPayload, sendStockDispenseRequest } from './stock-dispense/stock.resource';

class Handler {
  nextHandler: Handler | null;

  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: DispenseFormHandlerParams) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return Promise.resolve(request);
  }
}

class MedicationDispenseHandler extends Handler {
  handle(request) {
    const { medicationDispensePayload, medicationRequestBundle, config, abortController } = request;
    return saveMedicationDispense(medicationDispensePayload, MedicationDispenseStatus.completed, abortController)
      .then((response) => {
        if (response.ok) {
          const newFulfillerStatus = computeNewFulfillerStatusAfterDispenseEvent(
            medicationDispensePayload,
            medicationRequestBundle,
            config.dispenseBehavior.restrictTotalQuantityDispensed,
          );
          if (getFulfillerStatus(medicationRequestBundle.request) !== newFulfillerStatus) {
            return updateMedicationRequestFulfillerStatus(
              getUuidFromReference(medicationDispensePayload.authorizingPrescription[0].reference),
              newFulfillerStatus,
            );
          }
        }
        return response;
      })
      .then((response) => {
        request.response = response;
        return super.handle(request);
      });
  }
}

class StockDispenseHandler extends Handler {
  async handle(request) {
    const {
      response,
      config,
      inventoryItem,
      patientUuid,
      encounterUuid,
      medicationDispensePayload,
      abortController,
      t,
    } = request;
    const { status } = response;

    if (config.enableStockDispense && (status === 201 || status === 200)) {
      try {
        const stockDispenseRequestPayload = createStockDispenseRequestPayload(
          inventoryItem,
          patientUuid,
          encounterUuid,
          medicationDispensePayload,
        );
        await sendStockDispenseRequest(stockDispenseRequestPayload, abortController);
        showSnackbar({
          isLowContrast: true,
          title: t('stockDispensed', 'Stock dispensed'),
          kind: 'success',
          subtitle: t('stockDispensedSuccessfully', 'Stock dispensed successfully and batch level updated.'),
        });
      } catch (error) {
        showSnackbar({
          title: t('stockDispensedError', 'Stock dispensed error'),
          kind: 'error',
          isLowContrast: true,
          timeoutInMs: 5000,
          subtitle: error?.message,
        });
      }
    }

    return super.handle(request);
  }
}

class CloseCurrentVisitHandler extends Handler {
  async handle(request) {
    const { currentVisit, abortController, closeVisitOnDispense, response, t, config } = request;

    try {
      const visitTypes = await getVisitTypes().toPromise();
      const shouldCloseVisit =
        shouldCloseVisitOnDispense(currentVisit, visitTypes, response.status, config) && closeVisitOnDispense;

      if (shouldCloseVisit) {
        const updateResponse = await updateVisit(
          currentVisit.uuid,
          {
            stopDatetime: new Date(),
            location: currentVisit.location.uuid,
            startDatetime: undefined,
            visitType: currentVisit?.visitType.uuid,
          },
          abortController,
        ).toPromise();

        showSnackbar({
          title: t('visitClose', 'Visit closed'),
          kind: 'success',
          subtitle: t('visitClosedSuccessfully', 'Visit closed successfully.'),
        });
        request.response = updateResponse;
      }
    } catch (error) {
      showSnackbar({ title: 'Close visit error', kind: 'error', subtitle: error?.message });
    }

    return super.handle(request);
  }
}

class FinalResponseHandler extends Handler {
  handle(request) {
    const { response, closeOverlay, revalidate, encounterUuid, setIsSubmitting, mode, t } = request;
    const { status } = response;

    if (status === 201 || status === 200) {
      closeOverlay();
      revalidate(encounterUuid);
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('medicationListUpdated', 'Medication dispense list has been updated.'),
        title: t(
          mode === 'enter' ? 'medicationDispensed' : 'medicationDispenseUpdated',
          mode === 'enter' ? 'Medication successfully dispensed.' : 'Dispense record successfully updated.',
        ),
        timeoutInMs: 5000,
      });
    } else {
      showSnackbar({
        title: t(
          mode === 'enter' ? 'medicationDispenseError' : 'medicationDispenseUpdatedError',
          mode === 'enter' ? 'Error dispensing medication.' : 'Error updating dispense record',
        ),
        kind: 'error',
        isLowContrast: true,
        subtitle: response.error?.message,
      });
      setIsSubmitting(false);
    }

    return super.handle(request);
  }
}

const setupChain = () => {
  const medicationDispenseHandler = new MedicationDispenseHandler();
  const stockDispenseHandler = new StockDispenseHandler();
  const closeActiveVisitHandler = new CloseCurrentVisitHandler();
  const finalResponseHandler = new FinalResponseHandler();

  medicationDispenseHandler
    .setNext(stockDispenseHandler)
    .setNext(closeActiveVisitHandler)
    .setNext(finalResponseHandler);

  return medicationDispenseHandler;
};

export const executeMedicationDispenseChain = (params) => {
  const chain = setupChain();
  return chain.handle(params);
};

/**
 * Determines whether the current visit should be closed based on the provided parameters.
 *
 * @param {object} currentVisit - The current visit object.
 * @param {Array} visitTypes - An array of allowed visit types.
 * @param {number} status - The status code of the request.
 * @param {object} config - The configuration object.
 * @returns {boolean} - Returns true if the current visit should be closed, false otherwise.
 */
function shouldCloseVisitOnDispense(currentVisit, visitTypes, status, config): boolean {
  if (!currentVisit || !visitTypes) return false;

  const hasAllowedVisitType = visitTypes.some((vt) => vt.uuid === currentVisit.visitType.uuid);
  return hasAllowedVisitType && config.closeVisitOnDispense.enabled && (status === 200 || status === 201);
}

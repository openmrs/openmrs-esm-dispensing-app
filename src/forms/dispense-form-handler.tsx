import { getVisitTypes, showSnackbar, updateVisit } from '@openmrs/esm-framework';
import { saveMedicationDispense } from '../medication-dispense/medication-dispense.resource';
import { updateMedicationRequestFulfillerStatus } from '../medication-request/medication-request.resource';
import { type DispenseFormHandlerParams, MedicationDispenseStatus } from '../types';
import { computeNewFulfillerStatusAfterDispenseEvent, getFulfillerStatus, getUuidFromReference } from '../utils';
import { createStockDispenseRequestPayload, sendStockDispenseRequest } from './stock-dispense/stock.resource';

abstract class Handler {
  protected nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  abstract handle(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams>;

  protected async callNext(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams> {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return request;
  }

  protected showErrorSnackbar(t: Function, title: string, error: any): void {
    showSnackbar({
      title: t(title),
      kind: 'error',
      isLowContrast: true,
      timeoutInMs: 5000,
      subtitle: error?.message || t('unknownError', 'An unknown error occurred'),
    });
  }
}

class MedicationDispenseHandler extends Handler {
  async handle(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams> {
    const { medicationDispensePayload, medicationRequestBundle, config, abortController, t } = request;
    try {
      const response = await saveMedicationDispense(
        medicationDispensePayload,
        MedicationDispenseStatus.completed,
        abortController,
      );

      if (response.ok) {
        const newFulfillerStatus = computeNewFulfillerStatusAfterDispenseEvent(
          medicationDispensePayload,
          medicationRequestBundle,
          config.dispenseBehavior.restrictTotalQuantityDispensed,
        );

        if (getFulfillerStatus(medicationRequestBundle.request) !== newFulfillerStatus) {
          await updateMedicationRequestFulfillerStatus(
            getUuidFromReference(medicationDispensePayload.authorizingPrescription[0].reference),
            newFulfillerStatus,
          );
        }
      }

      request.response = response;
    } catch (error) {
      this.showErrorSnackbar(t, 'medicationDispenseError', error);
      request.response = { ok: false, error };
    }
    return this.callNext(request);
  }
}

class StockDispenseHandler extends Handler {
  async handle(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams> {
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

    if (config.enableStockDispense && (response.status === 201 || response.status === 200)) {
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
        this.showErrorSnackbar(t, 'stockDispensedError', error);
      }
    }

    return this.callNext(request);
  }
}

class EndCurrentVisitHandler extends Handler {
  async handle(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams> {
    const { currentVisit, abortController, closeVisitOnDispense, response, t, config } = request;

    try {
      const visitTypes = await getVisitTypes().toPromise();
      const shouldCloseVisit =
        this.shouldEndVisitOnDispense(currentVisit, visitTypes, response.status, config) && closeVisitOnDispense;

      if (shouldCloseVisit) {
        const updateResponse = await updateVisit(
          currentVisit.uuid,
          {
            stopDatetime: new Date(),
            startDatetime: new Date(currentVisit.startDatetime),
            location: currentVisit.location.uuid,
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
      this.showErrorSnackbar(t, 'closeVisitError', error);
    }

    return this.callNext(request);
  }

  private shouldEndVisitOnDispense(currentVisit, visitTypes, status, config): boolean {
    if (!currentVisit || !visitTypes) return false;

    const hasAllowedVisitType = visitTypes.some((vt) => vt.uuid === currentVisit.visitType.uuid);
    return hasAllowedVisitType && config?.closeVisitOnDispense?.enabled && (status === 200 || status === 201);
  }
}

class FinalResponseHandler extends Handler {
  handle(request: DispenseFormHandlerParams): Promise<DispenseFormHandlerParams> {
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
      this.showErrorSnackbar(
        t,
        mode === 'enter' ? 'medicationDispenseError' : 'medicationDispenseUpdatedError',
        response.error,
      );
      setIsSubmitting(false);
    }

    return Promise.resolve(request);
  }
}

export const executeMedicationDispenseChain = (
  params: DispenseFormHandlerParams,
): Promise<DispenseFormHandlerParams> => {
  const medicationDispenseHandler = new MedicationDispenseHandler();
  const stockDispenseHandler = new StockDispenseHandler();
  const endCurrentVisitHandler = new EndCurrentVisitHandler();
  const finalResponseHandler = new FinalResponseHandler();

  medicationDispenseHandler.setNext(stockDispenseHandler).setNext(endCurrentVisitHandler).setNext(finalResponseHandler);

  return medicationDispenseHandler.handle(params);
};

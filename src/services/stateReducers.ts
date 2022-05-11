import { Alert } from '../model/Alerta';
import { AlertaExtStore, FetchAlertStatus } from '../model/ExtensionState';
import { getState, saveState } from '../browser/storage';

export enum AlertaEvent {
  POLLING_RESULT_RECEIVED,
  USER_PREF_UPDATED,
  POLLING_IN_ERROR,
}

interface PollingResultReceivedAction {
  event: typeof AlertaEvent.POLLING_RESULT_RECEIVED;
  payload: { newAlerts: Alert[]; fetchedAlerts: Alert[] };
}

interface UserPrefUpdated {
  event: typeof AlertaEvent.USER_PREF_UPDATED;
  payload: any;
}

interface PollingInError {
  event: typeof AlertaEvent.POLLING_IN_ERROR;
  payload: {
    status: number;
    statusText: string;
  };
}

type ActionTypes = PollingResultReceivedAction | UserPrefUpdated | PollingInError;

export function reduce(state: AlertaExtStore, action: ActionTypes): AlertaExtStore {
  switch (action.event) {
    case AlertaEvent.POLLING_RESULT_RECEIVED:
      return pollingResultReceived(state, action.payload);
    case AlertaEvent.POLLING_IN_ERROR:
      return pollingInError(state, action.payload);
    default:
      return state;
  }
}

export function dispatchAndSave(action: ActionTypes) {
  const newState = reduce(getState(), action);
  saveState(newState);
}

function pollingInError(
  state: AlertaExtStore,
  payload: { status: number; statusText: string },
): AlertaExtStore {
  return {
    ...state,
    fetchAlertPollingState: {
      status: FetchAlertStatus.KO,
      error: { ...payload },
    },
  };
}
function pollingResultReceived(
  state: AlertaExtStore,
  payload: { fetchedAlerts: Alert[] },
): AlertaExtStore {
  return {
    ...state,
    fetchAlertPollingState: {
      status: FetchAlertStatus.OK,
    },
    pollingState: {
      ...state.pollingState,
      alerts: payload.fetchedAlerts,
      isNewState: false,
    },
  };
}

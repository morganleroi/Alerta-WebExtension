import { Alert } from '../model/Alerta';
import { AlertaExtStore, FetchAlertStatus } from '../model/ExtensionState';
import { getState, saveState } from '../browser/storage';
import { UserPreferences } from '../model/UserPreferences';
import * as alertaApi from './fetchAlertaApi';

export enum AlertaEvent {
  POLLING_RESULT_RECEIVED,
  USER_PREF_UPDATED,
  POLLING_IN_ERROR,
  SAVE_USER_PREFERENCES,
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

interface SaveUserPreferences {
  event: typeof AlertaEvent.SAVE_USER_PREFERENCES;
  payload: UserPreferences;
}

type ActionTypes = PollingResultReceivedAction | UserPrefUpdated | PollingInError | SaveUserPreferences;

function saveUserPreferences(state: AlertaExtStore, payload: UserPreferences): AlertaExtStore {
  return {
    ...state,
    pollingState: {
      ...state.pollingState,
      alertaFetchQuery: alertaApi.createFetchQuery(payload),
      isNewState: true,
    },
    userPreferences: payload,
  };
}

export function reduce(state: AlertaExtStore, action: ActionTypes): AlertaExtStore {
  switch (action.event) {
    case AlertaEvent.POLLING_RESULT_RECEIVED:
      return pollingResultReceived(state, action.payload);
    case AlertaEvent.POLLING_IN_ERROR:
      return pollingInError(state, action.payload);
    case AlertaEvent.SAVE_USER_PREFERENCES:
      return saveUserPreferences(state, action.payload);
    default:
      return state;
  }
}

export async function dispatchAndSave(action: ActionTypes) {
  const newState = reduce(getState(), action);
  await saveState(newState);
}

function pollingInError(state: AlertaExtStore, payload: { status: number; statusText: string }): AlertaExtStore {
  return {
    ...state,
    fetchAlertPollingState: {
      status: FetchAlertStatus.KO,
      error: { ...payload },
    },
  };
}

function pollingResultReceived(state: AlertaExtStore, payload: { fetchedAlerts: Alert[] }): AlertaExtStore {
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

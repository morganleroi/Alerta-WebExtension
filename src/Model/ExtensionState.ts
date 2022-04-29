import { Alert } from './alerta';
import { UserPreferences } from './userPreferences';

type PollingState = {
  alerts: Alert[];
  alertaFetchQuery: string;
  isNewState: boolean;
  fetchAlertState: FetchAlertState;
};

export enum FetchAlertStatus {
  'NotYetFetched',
  'OK',
  'KO',
}

export type FetchAlertState = {
  status: FetchAlertStatus;
  error?: { status: number; statusText: string };
};

export type AlertaExtStore = {
  userPreferences: UserPreferences;
  pollingState: PollingState;
  fetchAlertPollingState: FetchAlertState;
};

export const defaultState: AlertaExtStore = {
  fetchAlertPollingState: {
    status: FetchAlertStatus.NotYetFetched,
  },
  pollingState: {
    alertaFetchQuery: '',
    alerts: [],
    isNewState: true,
    fetchAlertState: { status: FetchAlertStatus.NotYetFetched },
  },
  userPreferences: {
    alertaApiServerUrl: 'http://localhost:8080/api/',
    alertaUiUrl: 'http://localhost:8080/',
    persistentNotifications: false,
    showNotifications: true,
    alertaApiSecret: 'XXX',
    username: 'John Doe',
    filterGroups: [],
    filterEnvironments: ['Production'],
    filterServices: [],
    playAudio: false,
  },
};

import { Alert } from './alerta';
import { UserPreferences } from './userPreferences';

export type PollingState = {
  alerts: Alert[];
  alertaFetchQuery: string;
  isNewState: boolean;
  status: FetchAlertStatus;
};

export enum FetchAlertStatusResult {
  'NotYetFetched',
  'OK',
  'KO',
}

export type FetchAlertStatus = {
  result: FetchAlertStatusResult;
  error?: { status: number; statusText: string };
};

export type AlertaExtStore = {
  userPreferences: UserPreferences;
  pollingState: PollingState;
};

export const defaultState: AlertaExtStore = {
  pollingState: {
    alertaFetchQuery: '',
    alerts: [],
    isNewState: true,
    status: {
      result: FetchAlertStatusResult.NotYetFetched,
    },
  },
  userPreferences: {
    alerta: {
      apiUrl: 'http://localhost:8080/api/',
      uiUrl: 'http://localhost:8080/',
      apiSecret: 'XXX',
    },
    notification: {
      persistentNotifications: false,
      showNotifications: true,
      playAudio: false,
    },
    filters: {
      groups: [],
      environments: ['Production'],
      services: [],
    },
    username: 'John Doe',
  },
};

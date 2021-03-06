import { AlertaEvent, reduce } from './stateReducers';
import { Alert } from '../model/Alerta';
import { AlertaExtStore, defaultState, FetchAlertStatusResult } from '../model/ExtensionState';
import { UserPreferences } from '../model/UserPreferences';

function createNewAlert(id: number): Alert {
  return {
    event: 'MyTestEvent',
    id: id.toString(),
    service: ['WebApp'],
    text: 'WebApp seems unresponsive',
  };
}

test('When receiving new alert, state should be updated', () => {
  const newAlerts = [createNewAlert(3)];
  const fetchedAlerts = [createNewAlert(3), createNewAlert(2), createNewAlert(1)];
  const newState = reduce(defaultState, {
    event: AlertaEvent.POLLING_RESULT_RECEIVED,
    payload: {
      newAlerts,
      fetchedAlerts,
    },
  });

  expect(newState.pollingState.alerts).toEqual(fetchedAlerts);
  expect(newState.pollingState.status.error).toBeUndefined();
  expect(newState.pollingState.status.result).toEqual(FetchAlertStatusResult.OK);
});

test('When receiving no new Alert, state no should be updated', () => {
  const newState = reduce(defaultState, {
    event: AlertaEvent.POLLING_RESULT_RECEIVED,
    payload: {
      newAlerts: [],
      fetchedAlerts: [createNewAlert(1)],
    },
  });

  expect(newState.pollingState.alerts).toEqual([createNewAlert(1)]);
});

test('When receiving polling results, state should not be flagged as "new" anymore', () => {
  const oldState = {
    ...defaultState,
    pollingState: {
      ...defaultState.pollingState,
      isNewState: true,
    },
  };

  const newState = reduce(oldState, {
    event: AlertaEvent.POLLING_RESULT_RECEIVED,
    payload: {
      newAlerts: [],
      fetchedAlerts: [createNewAlert(1)],
    },
  });

  expect(newState.pollingState.isNewState).toBeFalsy();
});

test('When receiving polling error, state should be notified', () => {
  const newState = reduce(defaultState, {
    event: AlertaEvent.POLLING_IN_ERROR,
    payload: {
      status: 401,
      statusText: 'Unauthorized',
    },
  });

  expect(newState.pollingState.status.result).toEqual(FetchAlertStatusResult.KO);
  expect(newState.pollingState.status.error).toEqual({
    status: 401,
    statusText: 'Unauthorized',
  });
});

test('When receiving save user preferences, state should be updated', () => {
  const userPref: UserPreferences = {
    ...defaultState.userPreferences,
    notification: {
      ...defaultState.userPreferences.notification,
      persistentNotifications: true,
    },
    alerta: {
      ...defaultState.userPreferences.alerta,
      apiSecret: 'AZERTY :-)',
    },
  };

  const newState = reduce(defaultState, {
    event: AlertaEvent.SAVE_USER_PREFERENCES,
    payload: userPref,
  });

  expect(newState.userPreferences.notification.persistentNotifications).toBeTruthy();
  expect(newState.userPreferences.alerta.apiSecret).toEqual('AZERTY :-)');
});

test('When receiving save user preferences, polling state should be recomputed', () => {
  const initialState: AlertaExtStore = {
    ...defaultState,
    pollingState: {
      alerts: [],
      isNewState: false,
      alertaFetchQuery: '',
      status: {
        result: FetchAlertStatusResult.NotYetFetched,
      },
    },
  };

  const newState = reduce(initialState, {
    event: AlertaEvent.SAVE_USER_PREFERENCES,
    payload: defaultState.userPreferences,
  });

  expect(newState.pollingState.isNewState).toBeTruthy();
  expect(newState.pollingState.alertaFetchQuery).toEqual('status=open&status=ack&sort-by=lastReceiveTime&environment=Production');
});

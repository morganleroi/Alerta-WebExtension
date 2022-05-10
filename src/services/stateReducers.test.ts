import { reduce, AlertaEvent } from './stateReducers';
import { Alert } from '../model/Alerta';
import { defaultState, FetchAlertStatus } from '../model/ExtensionState';

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
  expect(newState.fetchAlertPollingState.error).toBeUndefined();
  expect(newState.fetchAlertPollingState.status).toEqual(FetchAlertStatus.OK);
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

  expect(newState.fetchAlertPollingState.status).toEqual(FetchAlertStatus.KO);
  expect(newState.fetchAlertPollingState.error).toEqual({
    status: 401,
    statusText: 'Unauthorized',
  });
});

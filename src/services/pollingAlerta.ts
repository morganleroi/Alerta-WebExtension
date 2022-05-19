import { Alert } from '../model/alerta';
import { AlertaExtStore } from '../model/extensionState';
import { sendNotification } from '../browser/notifications';
import { getState } from '../browser/storage';
import browser from 'webextension-polyfill';
import { AlertaEvent, dispatchAndSave } from './stateReducers';

export const startPolling = () => {
  browser.alarms.onAlarm.addListener(() => {
    fetchAlerts(getState());
  });

  browser.alarms.create('PollingAlerta', {
    delayInMinutes: 0.1,
    periodInMinutes: 0.2,
  });
};

export const fetchAlerts = (state: AlertaExtStore) => {
  fetch(`${state.userPreferences.alertaApiServerUrl}alerts?${state.pollingState.alertaFetchQuery}`, {
    headers: {
      Authorization: `Key ${state.userPreferences.alertaApiSecret}`,
    },
  })
    .then(response => (response.ok ? response.json() : Promise.reject(response)))
    .then(response => {
      handleAlertaResponse(response, state);
    })
    .catch(error => {
      browser.browserAction.setBadgeText({ text: 'ERR' });
      browser.browserAction.setBadgeBackgroundColor({ color: 'red' });

      dispatchAndSave({
        event: AlertaEvent.POLLING_IN_ERROR,
        payload: {
          status: error.status,
          statusText: error.statusText,
        },
      });
    });
};

function handleAlertaResponse(alertaResponse: any, state: AlertaExtStore) {
  const fetchedAlerts = alertaResponse.alerts as Alert[];

  if (!fetchedAlerts) {
    return;
  }

  // We collect new alerts in the fetchAlerts.
  const newAlerts = fetchedAlerts.filter(alert => state.pollingState.alerts && !state.pollingState.alerts.map(x => x.id).includes(alert.id));
  const currentNbOfAlerts: number = alertaResponse.alerts.length;
  browser.browserAction.setBadgeText({ text: currentNbOfAlerts.toString() });
  browser.browserAction.setBadgeBackgroundColor({
    color: currentNbOfAlerts > 0 ? 'red' : 'green',
  });

  sendNotification(state, newAlerts);

  dispatchAndSave({
    event: AlertaEvent.POLLING_RESULT_RECEIVED,
    payload: {
      newAlerts,
      fetchedAlerts,
    },
  });
}

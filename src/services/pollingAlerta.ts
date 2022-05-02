import { Alert } from '../model/alerta';
import { AlertaExtStore, FetchAlertStatus } from '../model/extensionState';
import { sendNotification } from '../chromium/notifications';
import { getState, savePollingStateState, saveState } from '../chromium/state';
import browser from 'webextension-polyfill';

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
  fetch(
    `${state.userPreferences.alertaApiServerUrl}alerts?${state.pollingState.alertaFetchQuery}`,
    {
      headers: {
        Authorization: `Key ${state.userPreferences.alertaApiSecret}`,
      },
    },
  )
    .then(response => (response.ok ? response.json() : Promise.reject(response)))
    .then(response => {
      handleAlertaResponse(response, state);

      savePollingStateState({
        status: FetchAlertStatus.OK,
      });
    })
    .catch(error => {
      console.log(error);
      browser.browserAction.setBadgeText({ text: 'ERR' });
      browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
      savePollingStateState({
        status: FetchAlertStatus.KO,
        error: { status: error.status, statusText: error.statusText },
      });
    });
};

function handleAlertaResponse(alertaResponse: any, state: AlertaExtStore) {
  const fetchedAlerts = alertaResponse.alerts as Alert[];

  if (!fetchedAlerts) {
    return;
  }

  // We collect new alerts in the fetchAlerts.
  const newAlerts = fetchedAlerts.filter(
    alert =>
      state.pollingState.alerts && !state.pollingState.alerts.map(x => x.id).includes(alert.id),
  );
  const currentNbOfAlerts: number = alertaResponse.alerts.length;
  browser.browserAction.setBadgeText({ text: currentNbOfAlerts.toString() });
  browser.browserAction.setBadgeBackgroundColor({
    color: currentNbOfAlerts > 0 ? 'red' : 'green',
  });

  sendNotification(state, newAlerts);

  // Update the storage with the new value. Only if needed or if it's the first time we have a state (or user preferences saved)
  if (newAlerts.length > 0 || state.pollingState.isNewState) {
    saveState({
      ...state,
      pollingState: {
        ...state.pollingState,
        alerts: fetchedAlerts,
        isNewState: false,
      },
    });
  }
}

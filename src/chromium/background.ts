import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { startPolling } from '../services/pollingAlerta';
import { getState, initializeState, loadState, synchronizeState } from './state';
import browser from 'webextension-polyfill';
// When the Extension is first installed or when updated.
browser.runtime.onInstalled.addListener(() => initializeState().then(startPolling));

// When the Extensions starts (Chrome starts, ...)
browser.runtime.onStartup.addListener(() => loadState().then(startPolling));

// Every time we change user preferences, we reload the state
browser.storage.onChanged.addListener((_, area) => {
  if (area === 'local') {
    synchronizeState();
  }
});

// User clicks on extension Icon
browser.browserAction.onClicked.addListener(() => openAlerta(getState()));

// User click on notification
browser.notifications.onClicked.addListener(notificationId =>
  openAlert(getState(), notificationId, notificationId.split('_').pop()),
);

// User clicks on notification button
browser.notifications.onButtonClicked.addListener((notificationId, index) =>
  triggerNotificationAction(getState(), notificationId, index),
);

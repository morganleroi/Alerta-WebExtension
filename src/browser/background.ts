import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { startPolling } from '../services/pollingAlerta';
import { getState, initializeState, loadState, synchronizeState } from './storage';
import browser from 'webextension-polyfill';
import { isFirefox } from './crossBrowserUtils';

// When the Extension is first installed or when updated.
browser.runtime.onInstalled.addListener(() => initializeState().then(startPolling));

// When the Extensions starts (Browser starts, ...)
browser.runtime.onStartup.addListener(() => loadState().then(startPolling));

// Every time we change user preferences, we reload the state
browser.storage.onChanged.addListener((c, area) => {
  if (area === 'local') {
    synchronizeState();
  }
});

// When user clicks on extension Icon
browser.browserAction.onClicked.addListener(() => openAlerta(getState()));

// User click on notification
browser.notifications.onClicked.addListener(notificationId =>
  openAlert(getState(), notificationId, notificationId.split('_').pop()),
);

// User clicks on notification button, applies for all browser except Firefox.
if (!isFirefox()) {
  browser.notifications.onButtonClicked.addListener((notificationId, index) =>
    triggerNotificationAction(getState(), notificationId, index),
  );
}

import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { startPolling } from '../services/pollingAlerta';
import { getState, initializeState, loadState, synchronizeState } from './state';

// When the Extension is first installed or when updated.
chrome.runtime.onInstalled.addListener(() => initializeState().then(startPolling));

// When the Extensions starts (Chrome starts, ...)
chrome.runtime.onStartup.addListener(() => loadState().then(startPolling));

// Every time we change user preferences, we relead the state
chrome.storage.onChanged.addListener((_, area) => {
    if (area === 'local') {
        synchronizeState();
    }
});

// User clicks on extension Icon
chrome.browserAction.onClicked.addListener(() => openAlerta(getState()));

// User click on notification
chrome.notifications.onClicked.addListener(notificationId => openAlert(getState(), notificationId, notificationId.split('_').pop()));

// User clicks on notification button
chrome.notifications.onButtonClicked.addListener((notificationId, index) => triggerNotificationAction(getState(), notificationId, index));
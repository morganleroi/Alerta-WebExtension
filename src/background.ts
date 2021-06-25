import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { startPolling } from './pollingAlerta';
import { getState, initializeState, loadState, saveState, synchronizeState } from './state';

chrome.runtime.onInstalled.addListener(() => initializeState().then(startPolling));

chrome.runtime.onStartup.addListener(() => loadState().then(startPolling));

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
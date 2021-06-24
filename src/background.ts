import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { SendNotification } from './notifications';
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

function startPolling() {
    chrome.alarms.onAlarm.addListener(function () {
        const state = getState();
        fetch(`${state.userPreferences.AlertaApiServerUrl}/alerts?${state.pollingState.alertaFetchQuery}`,
            { headers: { 'Authorization': `Key ${state.userPreferences.AlertaApiSecret}` } })
            .then(response => response.json())
            .then(HandleAlertaResponse);
    });

    // Start the Alarms
    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.2,
    });
}

async function HandleAlertaResponse(resp: any) {
    const currentTotal: number = resp.alerts.length;
    chrome.browserAction.setBadgeText({ text: currentTotal.toString() });
    chrome.browserAction.setBadgeBackgroundColor({ color: currentTotal > 0 ? "red" : "green" });

    // Get the state
    const state = getState();

    SendNotification(state, resp);

    // Update the storage with the new value. Only if needed
    if (state.pollingState.alertCount == undefined || state.pollingState.alertCount != currentTotal) {
        saveState({
            ...state,
            pollingState: {
                ...state.pollingState,
                alertCount: currentTotal
            }
        })
    }
};
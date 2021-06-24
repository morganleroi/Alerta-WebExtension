import { AlertaExtStore } from './Model/AlertaExtStore';
import { openAlert, openAlerta, triggerNotificationAction } from './notificationActions';
import { SendNotification } from './notifications';

// Where we will expose all the data we retrieve from storage.sync.
var storageCache: AlertaExtStore = {
    pollingState: {
        alertaFetchQuery: ""
    },
    userPreferences: {
        AlertaApiServerUrl: "http://localhost:9999/api",
        AlertaUiUrl: "http://localhost:9999",
        PersistentNotifications: false,
        ShowNotifications: true,
        AlertaApiSecret: "XXX",
        username: "John Doe",
        filterGroups: [],
        filterServices: [],
        playAudio: false
    }
}

chrome.runtime.onInstalled.addListener(() => {

    // Initialize the storage with default values.
    chrome.storage.sync.set(storageCache);

    // Start the Alarms
    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.2,
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    getAllStorageSyncData().then(items => {
        if (area === 'sync') {
            const newState = items as AlertaExtStore;

            // Copy the data retrieved from storage into storageCache.
            Object.assign(storageCache, newState);
        }
    });
});

// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
    // Copy the data retrieved from storage into storageCache.
    Object.assign(storageCache, items);
    startPolling();
});

chrome.browserAction.onClicked.addListener(async (tab) => {
    try {
        await initStorageCache;
    } catch (e) {
        // Handle error that occurred during storage initialization.
    }
    // Normal action handler logic.
});

// User clicks on extension Icon
chrome.browserAction.onClicked.addListener(() => openAlerta(storageCache));

// User click on notification
chrome.notifications.onClicked.addListener(notificationId => openAlert(storageCache, notificationId, notificationId.split('_').pop()));

// User clicks on notification button
chrome.notifications.onButtonClicked.addListener((notificationId, index) => triggerNotificationAction(storageCache, notificationId, index));

function getAllStorageSyncData() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (items) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(items);
        });
    });
}

function startPolling() {
    const cache = storageCache;
    chrome.alarms.onAlarm.addListener(function () {
        // Fetch All alerts with severity high and on a Production env.
        fetch(`${cache.userPreferences.AlertaApiServerUrl}/alerts?${cache.pollingState.alertaFetchQuery}`, { headers: { 'Authorization': `Key ${storageCache.userPreferences.AlertaApiSecret}` } })
            .then(response => response.json())
            .then(HandleAlertaResponse);
    });
}

function HandleAlertaResponse(resp: any) {
    const currentTotal: number = resp.alerts.length;
    chrome.browserAction.setBadgeText({ text: currentTotal.toString() });
    chrome.browserAction.setBadgeBackgroundColor({ color: currentTotal > 0 ? "red" : "green" });

    // Get the state
    chrome.storage.sync.get(null, (items) => {

        var currentState = items as AlertaExtStore;

        SendNotification(currentState, resp);
        // Update the storage with the new value. Only if needed
        if (currentState.pollingState.alertCount == undefined || currentState.pollingState.alertCount != currentTotal) {
            const newState: AlertaExtStore = {
                ...currentState,
                pollingState: {
                    ...currentState.pollingState,
                    alertCount: currentTotal
                }
            };
            chrome.storage.sync.set(newState);
        }
    });
};
import { AlertaExtStore } from './Model/AlertaExtStore';
import { SendNotification } from './notifications';

// Where we will expose all the data we retrieve from storage.sync.
var storageCache: AlertaExtStore = {
    pollingState: {},
    userPreferences: {
        AlertaApiServerUrl: "http://localhost:9999/api",
        AlertaUiUrl: "http://localhost:9999",
        PersistentNotifications: false,
        ShowNotifications: true,
        AlertaApiSecret: "XXX",
        username: "John Doe"
    }
}

chrome.action.onClicked.addListener(() => openAlerta());

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set(storageCache);

    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.2,
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    getAllStorageSyncData().then(items => {
        if (area === 'sync') {
            // Copy the data retrieved from storage into storageCache.
            Object.assign(storageCache, items);
        }
    });
});


// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
    // Copy the data retrieved from storage into storageCache.
    Object.assign(storageCache, items);
    startPolling();
});

chrome.action.onClicked.addListener(async (tab) => {
    try {
        await initStorageCache;
    } catch (e) {
        // Handle error that occurred during storage initialization.
    }
    // Normal action handler logic.
});
chrome.notifications.onClicked.addListener(notificationId => {
    openAlert(notificationId, notificationId.split('_').pop());
});

chrome.notifications.onButtonClicked.addListener((notificationId, index) => {
    if(notificationId == "GoToAlertaHome"){
        openAlerta(notificationId);
    }
    else if(notificationId.startsWith("Alert_") && index == 0){
        ackAlert(notificationId, notificationId.split('_').pop());
    }
    else if(notificationId.startsWith("Alert_") && index == 1){
        openAlert(notificationId, notificationId.split('_').pop());
    }
});

function ackAlert(notificationId: string, alertId?: string) {
    if(!alertId){
        return;
    }

    var body = {
        status: "ack",
        text: storageCache.userPreferences.username ? `${storageCache.userPreferences.username} : I'll take a look ...` : ""
    };

    fetch(`${storageCache.userPreferences.AlertaApiServerUrl}/alert/${alertId}/status`, { method: "PUT", body: JSON.stringify(body), headers: { "Content-type": "application/json", 'Authorization': `Key ${storageCache.userPreferences.AlertaApiSecret}` } })
        .then(_ => chrome.notifications.clear(notificationId));
}

function openAlerta(notificationId?: string) {
    const url = `${storageCache.userPreferences.AlertaUiUrl}`;
    chrome.tabs.create({ active: true, url }, (t) => {
        if(notificationId){
            chrome.notifications.clear(notificationId);
        } 
        chrome.windows.update(t.windowId!, { focused: true });
    });
}

function openAlert(notificationId: string, alertId?: string) {
    if(!alertId){
        openAlerta(notificationId);
    }

    const url = `${storageCache.userPreferences.AlertaUiUrl}/alert/${alertId}`;
    chrome.tabs.create({ active: true, url }, (t) => {
        chrome.notifications.clear(notificationId);
        chrome.windows.update(t.windowId!, { focused: true });
    });
}

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
        fetch(`${cache.userPreferences.AlertaApiServerUrl}/alerts?environment=Production&status=open&status=ack&sort-by=lastReceiveTime`, { headers: { 'Authorization': `Key ${storageCache.userPreferences.AlertaApiSecret}` } })
            .then(response => response.json())
            .then(HandleAlertaResponse);
    });
}

function HandleAlertaResponse(resp: any) {
    const currentTotal: number = resp.alerts.length;
    chrome.action.setBadgeText({ text: currentTotal.toString() });
    chrome.action.setBadgeBackgroundColor({ color: currentTotal > 0 ? "red" : "green" });

    // Get the state
    chrome.storage.sync.get(null, (items) => {

        var currentState = items as AlertaExtStore;

        if (currentState.userPreferences.ShowNotifications) {
            // We have new alerts !
            // We only trigger alert if :
            // - The alert count if defined (Not the first time we poll Alerta)
            // - The alert count is lower than the alerta count result from the polling request
            if (currentState.pollingState.alertCount && currentState.pollingState.alertCount < currentTotal) {
                SendNotification(currentState, currentTotal, resp);
            };
        }

        // Update the storage with the new value.
        const newState: AlertaExtStore = {
            ...currentState,
            pollingState: {
                alertCount: currentTotal,
                lastPolling: Date.now()
            }
        };
        chrome.storage.sync.set(newState);
    });
};
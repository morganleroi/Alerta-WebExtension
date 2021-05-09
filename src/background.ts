import { AlertaExtStore } from './Model/AlertaExtStore';

// Where we will expose all the data we retrieve from storage.sync.
var storageCache: AlertaExtStore = {
    pollingState: {},
    userPreferences: {
        AlertaServerUrl: "http://localhost:9999",
        PersistentNotifications: false,
        ShowNotifications: true,
        AlertaApiSecret: "XXXX"
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensions is installed!=");

    chrome.storage.sync.set(storageCache, () => console.log("User Pref initialized"));

    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.1,
    });

    console.log("Starting Alerta polling");
});

chrome.storage.onChanged.addListener((changes, area) => {
    console.log("onchange");
    getAllStorageSyncData().then(items => {
        if (area === 'sync') {
            console.log("Reload configuration");
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
chrome.notifications.onClicked.addListener(alertId => {
    chrome.tabs.create({ active: true, url: `${storageCache.userPreferences.AlertaServerUrl}/alert/${alertId}` });
});

chrome.notifications.onButtonClicked.addListener((id, index) => {
    var body = {
        status: "ack",
        text: "I'll take a look ...",
        timeout: "7200"
    }
    fetch(`${storageCache.userPreferences.AlertaServerUrl}/api/alert/${id}/status`, { method: "PUT", body: JSON.stringify(body), headers: { "Content-type": "application/json" } })
        .then(resp => console.log("Alert Ack !"));
});

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
        console.log(cache);
        // Fetch All alerts with severity high and on a Production env.
        fetch(`${cache.userPreferences.AlertaServerUrl}/api/alerts?q=severity:((critical OR major) OR warning) AND environment:Production`)
            .then(response => response.json())
            .then(HandleAlertaResponse);
    });
}

function HandleAlertaResponse(resp: any){
    const currentTotal = resp.alerts.length;
    chrome.action.setBadgeText({ text: currentTotal.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "red" });

    // Get the state
    chrome.storage.sync.get(null, (items) => {

        var alertaExtStore = items as AlertaExtStore;

        // If no data in store, then we do not (yet) push notification and we will wait for new alerts
        // TODO ; If there is a delay between the count and now, perhaps we should not triggers alert, and just update the cache ?
        if (alertaExtStore.pollingState.alertCount == undefined) {
            console.log("First time we   fetch data from Alerta ... we will wait for new state to push notification !");
        }
        // We have new alerts !
        else if (alertaExtStore.pollingState.alertCount < currentTotal) {
            SendNotification(alertaExtStore, currentTotal, resp)
        };

        // Update the storage with the new value.
        const newState: AlertaExtStore = {
            ...alertaExtStore,
            pollingState: {
                alertCount: currentTotal,
                lastPolling: Date.now()
            }
        };
        chrome.storage.sync.set(newState);
    });
}

function SendNotification(alertaExtStore: AlertaExtStore, currentTotal: number, resp: any) {
    var newAlertsCount = currentTotal - alertaExtStore.pollingState.alertCount!;

    // Only one new alert since the last polling result, we send a basic notification
    if (newAlertsCount == 1) {
        var newAlert = resp.alerts[0];

        var alertId = newAlert.id;
        var notification: chrome.notifications.NotificationOptions = {
            type: 'basic',
            title: `[${newAlert.group}] ${newAlert.text}`,
            message: newAlert.value,
            iconUrl: "icon48.png",
            requireInteraction: alertaExtStore.userPreferences.PersistentNotifications,
            isClickable: true,
            buttons: [{ title: 'Ack' }, { title: 'View alert defails' }],
        };
    }
    // More than one alert, we send a list notification
    else {
        var notification: chrome.notifications.NotificationOptions = {
            type: 'list',
            title: 'New alert detected',
            message: 'Primary message to display',
            items: [{ title: "Alert one", message: "Outch1" }, { title: "Alert Two", message: "Outch2" }],
            iconUrl: "icon48.png",
            buttons: [{ title: 'Go to alerta' }]
        };
    };

    chrome.notifications.create(alertId, notification);
}
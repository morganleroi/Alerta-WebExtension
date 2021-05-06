import { UserPreferences } from './Model/UserPreferences'

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensions is installed!=");

    let userPref: UserPreferences = {
        AlertaServerUrl: "http://localhost:9999/api",
        PersistentNotifications: false,
        ShowNotifications: true
    }
    chrome.storage.sync.set(userPref, () => console.log("User Pref initialized"));

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

// Where we will expose all the data we retrieve from storage.sync.
var storageCache: any = {};
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

// Les derniéres alertes, sur la production, qui n'ont pas de duplicate

//http://localhost:9999/api/alerts?q=duplicateCount:<=0 AND (severity:normal critical warning) AND environment:Production

function startPolling() {
    const cache = storageCache;
    chrome.alarms.onAlarm.addListener(function () {
        console.log(cache);
        fetch(`${cache.AlertaServerUrl}/alerts?q=duplicateCount:<=0 AND (severity:critical warning) AND environment:Production`)
            .then(response => response.json())
            .then(resp => {
                const currentTotal = resp.alerts.length;
                chrome.action.setBadgeText({ text: currentTotal.toString() });

                chrome.action.setBadgeBackgroundColor({color: "red"});
                chrome.action.setTitle({title: "outch"});
                
                // Get the previous value of total from cache
                chrome.storage.sync.get(['numberOfAlerts'], (items) => {

                    chrome.storage.sync.set({
                        numberOfAlerts: currentTotal
                    }, function () { });

                    // If no data in store, then we do not (yet) push notification and we will wait for new alerts
                    // TODO ; If there is a delay between the count and now, perhaps we should not triggers alert, and just update the cache ?
                    if(items.numberOfAlerts == undefined){
                        console.log("First time we   fetch data from Alerta ... we will wait for new state to push notification !");
                    }
                    else if (items.numberOfAlerts < currentTotal) {
                        var opt = {
                            type: 'basic',
                            title: 'New alert detected',
                            message: 'Primary message to display',
                            iconUrl: "icon48.png",
                            buttons: [{ title: 'Ack' }, { title: 'Go to alerta' }]
                        };
                        chrome.notifications.create('id', opt, function (id) { console.log("Alerte OK") });
                    }
                })
            })
    });
}
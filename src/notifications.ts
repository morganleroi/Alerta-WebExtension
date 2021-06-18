import { AlertaExtStore } from "./Model/AlertaExtStore";

export function SendNotification(alertaExtStore: AlertaExtStore, currentTotal: number, resp: any) {
    if (alertaExtStore.userPreferences.ShowNotifications) {
        // We have new alerts !
        // We only trigger alert if :
        // - The alert count if defined (Not the first time we poll Alerta)
        // - The alert count is lower than the alerta count result from the polling request
        if (alertaExtStore.pollingState.alertCount != undefined && (alertaExtStore.pollingState.alertCount < currentTotal)) {
            var newAlertsCount = currentTotal - alertaExtStore.pollingState.alertCount!;

            let notification = (newAlertsCount == 1) ? CreateBasicNotification(resp, alertaExtStore) : CreateListNotification(newAlertsCount);
        
            if(alertaExtStore.userPreferences.playAudio){
                var myAudio = new Audio(chrome.runtime.getURL("bip.mp3"));
                myAudio.play();
            }
        
            chrome.notifications.create(notification.id, notification.payload);
        }
    }  
}

function CreateBasicNotification(resp: any, alertaExtStore: AlertaExtStore): { id: string, payload: chrome.notifications.NotificationOptions } {
    var newAlert = resp.alerts[0];
    return {
        id: `Alert_${newAlert.id}`,
        payload: {
            type: 'basic',
            title: `${newAlert.service[0]} - ${newAlert.event}`,
            message: newAlert.value,
            iconUrl: "alert.png",
            requireInteraction: alertaExtStore.userPreferences.PersistentNotifications,
            isClickable: true,
            buttons: [{ title: 'Ack' }, { title: 'View alert details' }],
        }
    }
}

function CreateListNotification(newAlertsCount: number): { id: string, payload: chrome.notifications.NotificationOptions } {
    return {
        id: "GoToAlertaHome",
        payload: {
            type: 'list',
            title: `${newAlertsCount} new alerts detected !`,
            message: 'Click to open Alerta',
            items: [],
            iconUrl: "alert.png",
            isClickable: true,
            buttons: [{ title: 'Go to alerta' }]
        }
    }
}
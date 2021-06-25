
import { Alert, AlertaAlertQueryResponse } from "./Model/Alerta";
import { AlertaExtStore as AlertaExtensionState } from "./Model/AlertaExtStore";
import { PlaySound } from "./playSound";

export function SendNotification(extensionState: AlertaExtensionState, alertaResponse: AlertaAlertQueryResponse, newAlerts: Alert[]) {
    if (extensionState.userPreferences.ShowNotifications) {
        // We have new alerts !
        // We only trigger alert if :
        // - The alert count if defined (Not the first time we poll Alerta)
        // - The alert count is lower than the alerta count result from the polling request
        if (newAlerts.length > 0) {
            var newAlertsCount = alertaResponse.alerts.length - extensionState.pollingState.alertCount!;

            let notification = (newAlerts.length == 1) ? CreateBasicNotification(newAlerts[0], extensionState) : CreateListNotification(newAlertsCount);
        
            if(extensionState.userPreferences.playAudio){
                PlaySound()
            }
        
            chrome.notifications.create(notification.id, notification.payload);
        }
    }  
}

function CreateBasicNotification(alert: Alert, alertaExtStore: AlertaExtensionState): { id: string, payload: chrome.notifications.NotificationOptions } {
    return {
        id: `Alert_${alert.id}`,
        payload: {
            type: 'basic',
            title: `${alert.service[0]} - ${alert.event}`,
            message: alert.value,
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
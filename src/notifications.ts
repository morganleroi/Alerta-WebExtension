
import { Alert } from "./Model/Alerta";
import { UserPreferences } from "./Model/UserPreferences";
import { PlaySound } from "./playSound";

export function SendNotification(userPreferences: UserPreferences, newAlerts: Alert[]) {
    if (userPreferences.ShowNotifications) {
        // We have new alerts !
        // We only trigger alert if :
        // - The alert count if defined (Not the first time we poll Alerta)
        // - The alert count is lower than the alerta count result from the polling request
        if (newAlerts.length > 0) {
            let notification = (newAlerts.length == 1) ? CreateBasicNotification(newAlerts[0], userPreferences) : CreateListNotification(newAlerts.length);
        
            if(userPreferences.playAudio){
                PlaySound()
            }
            chrome.notifications.create(notification.id, notification.payload);
        }
    }  
}

function CreateBasicNotification(alert: Alert, userPreferences: UserPreferences): { id: string, payload: chrome.notifications.NotificationOptions } {
    return {
        id: `Alert_${alert.id}`,
        payload: {
            type: 'basic',
            title: `${alert.service[0]} - ${alert.event}`,
            message: alert.value,
            iconUrl: "alert.png",
            requireInteraction: userPreferences.PersistentNotifications,
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
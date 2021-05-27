import { AlertaExtStore } from "./Model/AlertaExtStore";

export function SendNotification(alertaExtStore: AlertaExtStore, currentTotal: number, resp: any) {
    var newAlertsCount = currentTotal - alertaExtStore.pollingState.alertCount!;

    let notification = (newAlertsCount == 1) ? CreateBasicNotification(resp, alertaExtStore) : CreateListNotification(newAlertsCount);

    chrome.notifications.create(notification.id, notification.payload);
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
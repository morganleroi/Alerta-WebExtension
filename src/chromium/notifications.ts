import { Alert } from "../model/alerta";
import { AlertaExtStore } from "../model/extensionState";
import { UserPreferences } from "../model/userPreferences";
import { playSound } from "../services/playSound";

export function sendNotification(state: AlertaExtStore, newAlerts: Alert[]) {
  if (state.userPreferences.showNotifications) {
    // We have new alerts !
    // We only trigger alert if :
    // - The alert count if defined (Not the first time we poll Alerta or if new preferences has been saved)
    // - The alert count is lower than the alerta count result from the polling request
    if (!state.pollingState.isNewState && newAlerts.length > 0) {
      let notification =
        newAlerts.length == 1
          ? createBasicNotification(newAlerts[0], state.userPreferences)
          : createListNotification(newAlerts);

      if (state.userPreferences.playAudio) {
        playSound();
      }
      chrome.notifications.create(notification.id, notification.payload);
    }
  }
}

function createBasicNotification(
  alert: Alert,
  userPreferences: UserPreferences
): { id: string; payload: chrome.notifications.NotificationOptions } {
  return {
    id: `Alert_${alert.id}`,
    payload: {
      type: "basic",
      iconUrl: "alert.png",
      requireInteraction: userPreferences.persistentNotifications,
      isClickable: true,
      buttons: [{ title: "Ack" }, { title: "View alert details" }],
      ...createAlertForNotification(alert),
    },
  };
}

function createListNotification(alerts: Alert[]): {
  id: string;
  payload: chrome.notifications.NotificationOptions;
} {
  return {
    id: "GoToAlertaHome",
    payload: {
      type: "list",
      title: `${alerts.length} new alerts detected !`,
      message: "Click to open Alerta",
      items: alerts.map(createAlertForNotification),
      iconUrl: "alert.png",
      isClickable: true,
      buttons: [{ title: "Go to alerta" }],
    },
  };
}

function createAlertForNotification(
  Alert: Alert
): chrome.notifications.ItemOptions {
  return {
    title: `${Alert.service[0]} - ${Alert.event}`,
    message: Alert.text ?? " ",
  };
}

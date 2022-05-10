import { Alert } from '../model/alerta';
import { AlertaExtStore } from '../model/extensionState';
import { UserPreferences } from '../model/userPreferences';
import { playSound } from '../services/playSound';
import browser, { Notifications } from 'webextension-polyfill';
import { isFirefox } from '../services/crossBrowserUtils';
import CreateNotificationOptions = Notifications.CreateNotificationOptions;

export type CreateNotificationOptionsComplete = CreateNotificationOptions &
  Partial<{
    buttons: { title: string }[];
    requireInteraction: boolean;
  }>;

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
          : createListNotification(newAlerts, state.userPreferences);

      if (state.userPreferences.playAudio) {
        playSound();
      }
      browser.notifications.create(notification.notificationId, notification.options);
    }
  }
}

function createBasicNotification(
  alert: Alert,
  userPreferences: UserPreferences,
): {
  notificationId: string;
  options: CreateNotificationOptionsComplete;
} {
  let payload: CreateNotificationOptionsComplete = {
    type: 'basic',
    iconUrl: 'alert.png',
    ...createAlertForNotification(alert),
  };

  // If we cannot use buttons, then the browser is firefox and do not handle button and require interaction
  if (!isFirefox()) {
    payload.buttons = [{ title: 'Ack' }, { title: 'View alert details' }];
    payload.requireInteraction = userPreferences.persistentNotifications;
    payload.isClickable = true;
  }

  return {
    notificationId: `Alert_${alert.id}`,
    options: payload,
  };
}

function createListNotification(
  alerts: Alert[],
  userPreferences: UserPreferences,
): {
  notificationId: string;
  options: CreateNotificationOptionsComplete;
} {
  let payload: CreateNotificationOptionsComplete = {
    type: 'list',
    title: `${alerts.length} new alerts detected !`,
    message: 'Click to open Alerta',
    iconUrl: 'alert.png',
  };

  // If we cannot use buttons, then the browser is firefox and do not handle button and require interaction
  if (!isFirefox()) {
    payload.items = alerts.map(createAlertForNotification);
    payload.buttons = [{ title: 'Go to alerta' }];
    payload.requireInteraction = userPreferences.persistentNotifications;
    payload.isClickable = true;
  }

  return {
    notificationId: 'GoToAlertaHome',
    options: payload,
  };
}

function createAlertForNotification(Alert: Alert) {
  return {
    title: `${Alert.service[0]} - ${Alert.event}`,
    message: Alert.text ?? ' ',
  };
}

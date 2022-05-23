import { AlertaExtStore } from '../model/extensionState';
import browser from 'webextension-polyfill';

export function triggerNotificationAction(state: AlertaExtStore, notificationId: string, index?: number) {
  if (notificationId === 'GoToAlertaHome') {
    openAlerta(state, notificationId);
  } else if (notificationId.startsWith('Alert_') && index === 0) {
    ackAlert(state, notificationId, notificationId.split('_').pop());
  } else if (notificationId.startsWith('Alert_') && (index === 1 || index === undefined)) {
    openAlert(state, notificationId, notificationId.split('_').pop());
  }
}

export function ackAlert(state: AlertaExtStore, notificationId: string, alertId?: string) {
  if (!alertId) {
    return;
  }

  const body = {
    status: 'ack',
    text: state.userPreferences.username ? `${state.userPreferences.username}: I'll take a look ...` : '',
  };

  fetch(`${state.userPreferences.alerta.apiUrl}alert/${alertId}/status`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-type': 'application/json',
      Authorization: `Key ${state.userPreferences.alerta.apiSecret}`,
    },
  }).then(_ => browser.notifications.clear(notificationId));
}

export function openAlerta(state: AlertaExtStore, notificationId?: string) {
  return createNewTab(`${state.userPreferences.alerta.uiUrl}`, notificationId);
}

export function openAlert(state: AlertaExtStore, notificationId: string, alertId?: string) {
  if (!alertId || notificationId === 'GoToAlertaHome') {
    return openAlerta(state, notificationId);
  }

  return createNewTab(`${state.userPreferences.alerta.uiUrl}alert/${alertId}`, notificationId);
}

async function createNewTab(url: string, notificationId?: string) {
  const tab = await browser.tabs.create({ active: true, url });
  if (notificationId) {
    browser.notifications.clear(notificationId);
  }
  browser.windows.update(tab.windowId!, { focused: true });

  return tab;
}

import { AlertaExtStore } from "../model/extensionState";

export function triggerNotificationAction(state: AlertaExtStore, notificationId: string, index: number) {
    if (notificationId === "GoToAlertaHome") {
        openAlerta(state, notificationId);
    }
    else if (notificationId.startsWith("Alert_") && index === 0) {
        ackAlert(state, notificationId, notificationId.split('_').pop());
    }
    else if (notificationId.startsWith("Alert_") && index === 1) {
        openAlert(state, notificationId, notificationId.split('_').pop());
    }
}

export function ackAlert(state: AlertaExtStore, notificationId: string, alertId?: string) {
    if (!alertId) {
        return;
    }

    var body = {
        status: "ack",
        text: state.userPreferences.username ? `${state.userPreferences.username}: I'll take a look ...` : ""
    };

    fetch(`${state.userPreferences.alertaApiServerUrl}alert/${alertId}/status`, { method: "PUT", body: JSON.stringify(body), headers: { "Content-type": "application/json", 'Authorization': `Key ${state.userPreferences.alertaApiSecret}` } })
        .then(_ => chrome.notifications.clear(notificationId));
}

export function openAlerta(state: AlertaExtStore, notificationId?: string) {
    createNewTab(`${state.userPreferences.alertaUiUrl}`, notificationId);
}

export function openAlert(state: AlertaExtStore, notificationId: string, alertId?: string) {
    if (!alertId || notificationId === "GoToAlertaHome") {
        openAlerta(state, notificationId);
        return;
    }

    createNewTab(`${state.userPreferences.alertaUiUrl}alert/${alertId}`, notificationId)
}

function createNewTab(url: string, notificationId?: string) {
    console.log(url);
    chrome.tabs.create({ active: true, url }, (tab) => {
        if (notificationId) {
            chrome.notifications.clear(notificationId);
        }
        chrome.windows.update(tab.windowId!, { focused: true });
    });
}
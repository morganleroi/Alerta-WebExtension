import { AlertaExtStore } from "./Model/AlertaExtStore";
import { SendNotification } from "./notifications";
import { getState, saveState } from "./state";

const startPolling = () => {
    chrome.alarms.onAlarm.addListener(() => {
        fetchAlerts(getState())
    });

    // Start the Alarms
    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.2,
    });
}

const fetchAlerts = (state: AlertaExtStore) => {
    fetch(`${state.userPreferences.AlertaApiServerUrl}/alerts?${state.pollingState.alertaFetchQuery}`,
        { headers: { 'Authorization': `Key ${state.userPreferences.AlertaApiSecret}` } })
        .then(response => response.json())
        .then(response => HandleAlertaResponse(response, state));
}

function HandleAlertaResponse(alertaResponse: any, state: AlertaExtStore) {
    const currentTotal: number = alertaResponse.alerts.length;
    chrome.browserAction.setBadgeText({ text: currentTotal.toString() });
    chrome.browserAction.setBadgeBackgroundColor({ color: currentTotal > 0 ? "red" : "green" });

    SendNotification(state, alertaResponse);

    // Update the storage with the new value. Only if needed
    if (state.pollingState.alertCount == undefined || state.pollingState.alertCount != currentTotal) {
        saveState({
            ...state,
            pollingState: {
                ...state.pollingState,
                alertCount: currentTotal
            }
        })
    }
};

export { startPolling, fetchAlerts }
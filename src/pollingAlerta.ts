import { Alert } from "./Model/Alerta";
import { AlertaExtStore } from "./Model/AlertaExtStore";
import { SendNotification } from "./notifications";
import { getState, saveState } from "./state";

export const startPolling = () => {
    chrome.alarms.onAlarm.addListener(() => {
        fetchAlerts(getState())
    });

    // Start the Alarms
    chrome.alarms.create("PollingAlerta", {
        delayInMinutes: 0.1,
        periodInMinutes: 0.2,
    });
}

export const fetchAlerts = (state: AlertaExtStore) => {
    fetch(`${state.userPreferences.AlertaApiServerUrl}/alerts?${state.pollingState.alertaFetchQuery}`,
        { headers: { 'Authorization': `Key ${state.userPreferences.AlertaApiSecret}` } })
        .then(response => response.json())
        .then(response => HandleAlertaResponse(response, state));
}

function HandleAlertaResponse(alertaResponse: any, state: AlertaExtStore) {

    var fetchedAlerts = alertaResponse.alerts as Alert[];

    // We collect new alerts in the fetchAlerts.
    const newAlerts = fetchedAlerts.filter(alert => !state.pollingState.alerts.map(x => x.id).includes(alert.id));
    const currentNbOfAlerts: number = alertaResponse.alerts.length;
    chrome.browserAction.setBadgeText({ text: currentNbOfAlerts.toString() });
    chrome.browserAction.setBadgeBackgroundColor({ color: currentNbOfAlerts > 0 ? "red" : "green" });

    SendNotification(state.userPreferences, newAlerts);
    
    // Update the storage with the new value. Only if needed
    if (newAlerts.length > 0) {
        saveState({
            ...state,
            pollingState: {
                ...state.pollingState,
                alertCount: currentNbOfAlerts,
                alerts: fetchedAlerts
            }
        })
    }
};
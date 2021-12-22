import { Alert } from "./alerta"
import { UserPreferences } from "./userPreferences"

type PollingState = {
    alerts: Alert[]
    alertaFetchQuery: string;
    isNewState: boolean;
    fetchAlertState: FetchAlertState;
}

export type FetchAlertState = {
    status: "Not yet fetched" | "OK" | "KO";
    error?:  { status: number, statusText: string }
}

export type AlertaExtStore = {
    userPreferences: UserPreferences;
    pollingState: PollingState;
}

export const defaultState: AlertaExtStore = {
    pollingState: {
        alertaFetchQuery: "",
        alerts: [],
        isNewState: true,
        fetchAlertState: { status: "Not yet fetched" }
    },
    userPreferences: {
        alertaApiServerUrl: "http://localhost:9999/api/",
        alertaUiUrl: "http://localhost:9999/",
        persistentNotifications: false,
        showNotifications: true,
        alertaApiSecret: "XXX",
        username: "John Doe",
        filterGroups: [],
        filterEnvironments: ["Production"],
        filterServices: [],
        playAudio: false
    }
}
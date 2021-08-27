import { Alert } from "./Alerta"
import { UserPreferences } from "./UserPreferences"

type PollingState = {
    alerts: Alert[]
    alertaFetchQuery: string;
}

export type AlertaExtStore = {
    userPreferences: UserPreferences;
    pollingState: PollingState;
}

export const defaultState: AlertaExtStore = {
    pollingState: {
        alertaFetchQuery: "",
        alerts: []

    },
    userPreferences: {
        AlertaApiServerUrl: "http://localhost:9999/api",
        AlertaUiUrl: "http://localhost:9999",
        PersistentNotifications: false,
        ShowNotifications: true,
        AlertaApiSecret: "XXX",
        username: "John Doe",
        filterGroups: [],
        filterServices: [],
        playAudio: false
    }
}
import { Alert } from "./Alerta"
import { UserPreferences } from "./UserPreferences"

type PollingState = {
    alertCount?: number;
    alerts: Alert[]
    alertaFetchQuery: string;
}

export type AlertaExtStore = {
    userPreferences: UserPreferences;
    pollingState: PollingState;
}
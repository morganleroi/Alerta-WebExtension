import { UserPreferences } from "./UserPreferences"

type PollingState = {
    alertCount?: number;
    lastPolling?: number;
}

export type AlertaExtStore = {
    userPreferences: UserPreferences;
    pollingState: PollingState;
}
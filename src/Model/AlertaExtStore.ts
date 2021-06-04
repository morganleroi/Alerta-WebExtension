import { UserPreferences } from "./UserPreferences"

type PollingState = {
    alertCount?: number;
    alertaFetchQuery: string;
}

export type AlertaExtStore = {
    userPreferences: UserPreferences;
    pollingState: PollingState;
}
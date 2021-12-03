export type UserPreferences = {
    alertaApiServerUrl: string;
    alertaUiUrl: string;
    alertaApiSecret: string;
    showNotifications: boolean;
    persistentNotifications: boolean;
    username: string;
    filterServices: string[];
    filterGroups: string[];
    filterEnvironments: string[];
    playAudio: boolean;
}
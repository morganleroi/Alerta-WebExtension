export type UserPreferences = {
    AlertaApiServerUrl: string;
    AlertaUiUrl: string;
    AlertaApiSecret: string;
    ShowNotifications: boolean;
    PersistentNotifications: boolean;
    username: string;
    filterServices: string[];
    filterGroups: string [];
}
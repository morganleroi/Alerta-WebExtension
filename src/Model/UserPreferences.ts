export interface UserPreferences {
  alerta: AlertaUserPreferences;
  notification: NotificationPreferences;
  filters: FiltersPreferences;
  username: string;
}

interface FiltersPreferences {
  services: string[];
  groups: string[];
  environments: string[];
}

interface NotificationPreferences {
  showNotifications: boolean;
  persistentNotifications: boolean;
  playAudio: boolean;
}

interface AlertaUserPreferences {
  apiUrl: string;
  apiSecret: string;
  uiUrl: string;
}

import { AlertaExtStore } from "../model/extensionState";
import { UserPreferences } from "../model/userPreferences";
import * as alertaApi from "../services/fetchAlertaApi";

export const askForPermissionIfNeeded = (userPref: UserPreferences) => {
    chrome.permissions.contains({
        origins: [userPref.alertaApiServerUrl]
    }, isAlertaAllowed => {
        if (!isAlertaAllowed) {
            chrome.permissions.request({
                origins: [userPref.alertaApiServerUrl]
            }, function () { });
        }
    });
}

export const saveUserPreferences = (userPref: UserPreferences) => {
    return new Promise<void>((resolve, reject) => {
        chrome.storage.local.get(null, (items: any) => {
            const alertaExtStore: AlertaExtStore = items;
            const newState: AlertaExtStore = {
                ...alertaExtStore,
                pollingState: {
                    ...alertaExtStore.pollingState,
                    alertaFetchQuery: alertaApi.createFetchQuery(userPref)
                },
                userPreferences: userPref
            };

            if(chrome.runtime.lastError){
                return reject(" Fail to save user preferences. (")
            }

            chrome.storage.local.set(newState, () => {
                if(chrome.runtime.lastError){
                    return reject(" Fail to save user preferences.")
                }
                resolve();
            });
        });
    });


}
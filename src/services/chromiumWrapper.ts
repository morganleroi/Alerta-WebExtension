import { AlertaExtStore } from '../model/extensionState';
import { UserPreferences } from '../model/userPreferences';
import * as alertaApi from '../services/fetchAlertaApi';
import browser from 'webextension-polyfill';

export const saveUserPreferences = (userPref: UserPreferences) => {
  return new Promise<void>((resolve, reject) => {
    browser.storage.local.get(null).then((items: any) => {
      const alertaExtStore: AlertaExtStore = items;
      const newState: AlertaExtStore = {
        ...alertaExtStore,
        pollingState: {
          ...alertaExtStore.pollingState,
          alertaFetchQuery: alertaApi.createFetchQuery(userPref),
          isNewState: true,
        },
        userPreferences: userPref,
      };

      if (browser.runtime.lastError) {
        return reject(' Fail to save user preferences. (');
      }

      browser.storage.local.set(newState).then(() => {
        if (browser.runtime.lastError) {
          return reject(' Fail to save user preferences.');
        }
        resolve();
      });
    });
  });
};

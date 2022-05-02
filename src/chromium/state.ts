import { AlertaExtStore, defaultState, FetchAlertState } from '../model/extensionState';
import browser from 'webextension-polyfill';

let state: AlertaExtStore = defaultState;

const initializeState = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    browser.storage.local.set(defaultState).then(() => {
      if (browser.runtime.lastError) {
        return reject(browser.runtime.lastError);
      }
      state = defaultState;
      resolve();
    });
  });
};

const saveState = (newState: AlertaExtStore) => {
  browser.storage.local.set(newState).then(() => {
    Object.assign(state, newState);
  });
};

const savePollingStateState = (fetchAlertaState: FetchAlertState) => {
  browser.storage.local.set({ fetchAlertPollingState: fetchAlertaState });
};

const getState = () => {
  return state;
};

const synchronizeState = () => {
  loadState().then(items => {
    const newState = items as AlertaExtStore;
    Object.assign(state, newState);
  });
};

function loadState(): Promise<AlertaExtStore> {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(null).then(items => {
      if (browser.runtime.lastError) {
        return reject(browser.runtime.lastError);
      }
      resolve(items as AlertaExtStore);
    });
  });
}

export { initializeState, saveState, savePollingStateState, getState, loadState, synchronizeState };

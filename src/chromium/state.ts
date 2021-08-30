import { AlertaExtStore, defaultState } from "../model/extensionState";

var state: AlertaExtStore;

const initializeState = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(defaultState, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            state = defaultState
            resolve();
        });
    });
}

const saveState = (newState: AlertaExtStore) => {
    chrome.storage.local.set(newState, () => {
        Object.assign(state, newState);
    });
}

const getState = () => {
    return state;
}

const synchronizeState = () => {
    loadState().then(items => {
            const newState = items as AlertaExtStore;
            Object.assign(state, newState);
    });
}

function loadState(): Promise<AlertaExtStore> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (items) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(items as AlertaExtStore);
        });
    });
}

export { initializeState, saveState, getState, loadState, synchronizeState }
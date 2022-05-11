import { AlertaExtStore, defaultState } from '../model/extensionState';
import browser from 'webextension-polyfill';

let state: AlertaExtStore = defaultState;

const initializeState = async () => {
  await saveState(defaultState);
};

const saveState = async (newState: AlertaExtStore) => {
  await browser.storage.local.set(newState);
  Object.assign(state, newState);
};

const getState = () => {
  return state;
};

async function loadState() {
  let newState = (await browser.storage.local.get(null)) as AlertaExtStore;
  Object.assign(state, newState);
  return newState;
}

export { initializeState, saveState, getState, loadState };

import browser from 'webextension-polyfill';

export function isFirefox() {
  // @ts-ignore
  return browser.notifications.onShown !== undefined;
}

import browser from 'webextension-polyfill';

export function acceptPermission() {
  return browser.permissions.request({
    origins: ['*://*/*'],
  });
}

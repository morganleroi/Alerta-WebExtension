// To simulate Web Extension as a Chromium Browser, one solution is to return undefined on the onShown method on the notifications API as is it not implemented in Chromium
export function setupMockAsChromium() {
  // @ts-ignore
  mockBrowser.notifications.onShown.mock(undefined);
}

// To simulate Web Extension as a Firefox Browser, one solution is to return a function on the onShown method on the notifications API as is it implemented in Firefox
export function setupMockAsFirefox() {
  // @ts-ignore
  mockBrowser.notifications.onShown.mock(() => {});
}
